const {app, BrowserWindow, ipcMain} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {spawn, execFile} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const workspace = process.env.JARVIS_WORKSPACE || path.join(root, 'workspace');
const recordFile = path.join(os.homedir(), '.local/state/hermes/gateway-locks/host-desktop-serve.json');
let win, socket, backend, ownEndpoint, backendFailure='', session, connecting, busy = false, sequence = 0;
const pending = new Map();
const emit = data => { if (win && !win.isDestroyed()) win.webContents.send('jarvis:event', data); };
function rejectPending(reason) {
  for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error(reason)); }
  pending.clear();
}
function request(method, params) {
  if (socket?.readyState !== WebSocket.OPEN) return Promise.reject(new Error('Conexão indisponível.'));
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('O serviço não confirmou o pedido.')); }, 30000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({jsonrpc:'2.0', id, method, params}));
  });
}
async function locate() {
  try {
    const record = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
    if (record.host !== '127.0.0.1' || !Number.isInteger(record.port) || record.port < 1 || record.port > 65535) return null;
    const token = fs.readFileSync(path.join(path.dirname(recordFile), 'host-desktop-serve.token'), 'utf8').trim();
    const response = await fetch(`http://127.0.0.1:${record.port}/api/status`, {
      headers: {Authorization:`Bearer ${token}`}, signal:AbortSignal.timeout(1500)
    });
    if (!response.ok) return null;
    return {port:record.port, token};
  } catch { return null; }
}
async function connect() {
  if (session && socket?.readyState === WebSocket.OPEN) return {ready:true};
  if (connecting) return connecting;
  connecting = (async () => {
    let endpoint = ownEndpoint || await locate();
    if (!endpoint) {
      if (!backend || backend.exitCode !== null) {
        fs.mkdirSync(path.join(root,'logs'), {recursive:true});
        const token=crypto.randomBytes(32).toString('hex');
        const ownership=crypto.randomBytes(16).toString('hex');
        const nonce=crypto.randomBytes(8).toString('hex');
        // Use Hermes' Windows helper so the token has the required private ACL and path.
        const tokenFile=await new Promise((resolve,reject)=>{
          const helper=spawn(path.join(root,'runtime/bin/hermes.exe'),['--run-module','hermes_cli.windows_ssh_runtime','upload-token',ownership,nonce],
            {windowsHide:true,env:{...process.env,HERMES_HOME:path.join(root,'runtime')},stdio:['pipe','pipe','pipe']});
          let output='';helper.stdout.on('data',chunk=>{output+=chunk.toString();});
          helper.on('error',reject);helper.on('close',code=>{
            if(code!==0)return reject(new Error('Hermes não conseguiu preparar a credencial local.'));
            try{resolve(JSON.parse(output.trim()).path);}catch{reject(new Error('Resposta inválida ao preparar conexão.'));}
          });helper.stdin.end(token);
        });
        backend = spawn(path.join(root,'runtime/bin/hermes.exe'), ['serve','--host','127.0.0.1','--port','0',
          '--ssh-session-token-file',tokenFile,'--ssh-owner-nonce',nonce], {
          cwd:workspace, windowsHide:true, env:{...process.env,HERMES_HOME:path.join(root,'runtime')}, stdio:['ignore','pipe','pipe']
        });
        let buffer='';
        const receive=chunk=>{
          buffer=(buffer+chunk.toString()).slice(-4096);
          backendFailure=buffer.replaceAll(token,'[credential]').slice(-1200);
          const match=buffer.match(/HERMES_BACKEND_READY port=(\d+)/);
          if(match){ownEndpoint={port:Number(match[1]),token};try{fs.unlinkSync(tokenFile);}catch{}}
        };
        backend.stdout.on('data',receive);backend.stderr.on('data',receive);
        backend.on('exit',()=>{try{fs.unlinkSync(tokenFile);}catch{}ownEndpoint=null;});
        backend.on('error', () => emit({type:'connection.error',text:'Não foi possível iniciar o Hermes.'}));
      }
      for (let attempt=0; attempt<90; attempt++) {
        await new Promise(resolve => setTimeout(resolve,1000));
        endpoint = ownEndpoint || await locate();
        if (endpoint) break;
        if (backend.exitCode !== null) throw new Error('Hermes encerrou durante a inicialização: '+backendFailure);
      }
    }
    if (!endpoint) throw new Error('Hermes não ficou pronto. Tente conectar novamente.');
    session = null;
    socket = new WebSocket(`ws://127.0.0.1:${endpoint.port}/api/ws?token=${encodeURIComponent(endpoint.token)}`);
    await new Promise((resolve,reject) => {
      const timer = setTimeout(() => { socket.close(); reject(new Error('Conexão local expirou.')); },10000);
      socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, {once:true});
      socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Falha na conexão local.')); }, {once:true});
    });
    socket.addEventListener('message', event => {
      for (const line of String(event.data).trim().split('\n')) {
        let frame; try { frame=JSON.parse(line); } catch { continue; }
        if (frame.id && pending.has(frame.id)) {
          const item=pending.get(frame.id); pending.delete(frame.id); clearTimeout(item.timer);
          frame.error ? item.reject(new Error(frame.error.message)) : item.resolve(frame.result);
        } else if (frame.method === 'event') {
          const data = frame.params;
          if (data?.session_id && data.session_id !== session) continue;
          if (data?.type === 'message.complete' || data?.type === 'error') busy=false;
          emit(data);
        }
      }
    });
    socket.addEventListener('close', () => {
      session=null; busy=false; rejectPending('Conexão encerrada.');
      emit({type:'connection.error',text:'Conexão encerrada. Clique em Reconectar.'});
    });
    const stateFile=path.join(app.getPath('userData'),`session-default-${crypto.createHash('sha256').update(path.resolve(workspace).toLowerCase()).digest('hex').slice(0,16)}.json`);
    let stored;try{stored=JSON.parse(fs.readFileSync(stateFile,'utf8')).stored_session_id;}catch{}
    let result;
    if(stored){
      try{result=await request('session.resume',{session_id:stored,source:'desktop',close_on_disconnect:true,inline_images:false});}
      catch(error){
        if(!/not found|unknown session|no session|does not exist/i.test(error.message))throw error;
        emit({type:'session.notice',text:'A conversa anterior não está mais disponível. Uma nova será aberta.'});
      }
    }
    if(!result)result=await request('session.create', {source:'desktop',title:'Jarvis',cwd:workspace,cwd_explicit:true,
      follow_profile_config:true,close_on_disconnect:true});
    session=result.session_id;
    fs.mkdirSync(path.dirname(stateFile),{recursive:true});
    fs.writeFileSync(stateFile,JSON.stringify({stored_session_id:result.stored_session_id||result.session_key||result.resumed||result.info?.stored_session_id||stored||session}));
    const messages=(result.messages||[]).filter(row=>['user','assistant'].includes(row.role)&&row.display_kind!=='hidden').slice(-80)
      .map(row=>({role:row.role,text:typeof row.content==='string'?row.content:typeof row.text==='string'?row.text:''})).filter(row=>row.text);
    return {ready:true,model:result.info?.model||'Qwen3.5 · 2B local',messages};
  })();
  try { return await connecting; } finally { connecting=null; }
}
function trusted(event) { if (event.sender !== win?.webContents || event.senderFrame !== win.webContents.mainFrame) throw new Error('Origem inválida.'); }
ipcMain.handle('jarvis:connect', (event) => { trusted(event); return connect(); });
ipcMain.handle('jarvis:send', async (event,text) => {
  trusted(event);
  if (typeof text !== 'string' || !text.trim() || text.length>16000) throw new Error('Pedido inválido ou muito longo.');
  if (busy) throw new Error('Aguarde a tarefa atual ou interrompa.');
  await connect(); busy=true;
  try { return await request('prompt.submit',{session_id:session,text:text.trim()}); }
  catch (error) { busy=false; throw error; }
});
ipcMain.handle('jarvis:interrupt', async event => { trusted(event); if(!session) return; return request('session.interrupt',{session_id:session}); });
ipcMain.handle('jarvis:resources', async event => {
  trusted(event);
  const memory={total:Math.round(os.totalmem()/2**30*10)/10,free:Math.round(os.freemem()/2**30*10)/10};
  const gpu=await new Promise(resolve => execFile('nvidia-smi',['--query-gpu=memory.used,memory.total','--format=csv,noheader,nounits'],
    {windowsHide:true,timeout:3000},(error,stdout) => resolve(error?null:stdout.trim())));
  return {memory,gpu};
});
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if(win){win.restore();win.focus();} });
  app.whenReady().then(() => {
    win=new BrowserWindow({width:1200,height:800,minWidth:720,minHeight:600,title:'Jarvis',backgroundColor:'#030a15',autoHideMenuBar:true,
      webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.loadFile(path.join(__dirname,'index.html'));
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', () => {
    socket?.close(); rejectPending('Aplicativo encerrado.');
    if(backend && backend.exitCode===null){
      if(process.platform==='win32')execFile('taskkill',['/PID',String(backend.pid),'/T','/F'],{windowsHide:true},()=>{});
      else backend.kill();
    }
  });
}
