const {app, BrowserWindow, ipcMain,Notification,nativeImage} = require('electron');
const {createTaskStore}=require('./task-store.cjs');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {spawn, execFile} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const workspace = process.env.JARVIS_WORKSPACE || path.join(root, 'workspace');
const tasks=createTaskStore(workspace);let taskTimer,notificationsEnabled=false;
const runtimeEnv = {...process.env,HERMES_HOME:path.join(root,'runtime'),HF_HOME:path.join(root,'cache/huggingface'),HERMES_VOICE:'0',HERMES_VOICE_TTS:'0'};
app.setAppUserModelId('Jarvis.Desktop');
const recordDirectory=path.join(os.homedir(),'.local/state/hermes/gateway-locks');
let win, socket, backend, ownEndpoint, backendFailure='', session, connecting, busy = false, sequence = 0;
let activeEndpoint, recording=false, recordingTimer;
const pending = new Map();
const userRequests=new Map();
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
async function locate(){
  for(const name of ['host-serve','host-desktop-serve'])try{
    const record=JSON.parse(fs.readFileSync(path.join(recordDirectory,name+'.json'),'utf8'));
    if(record.host!=='127.0.0.1'||!Number.isInteger(record.port)||record.port<1||record.port>65535)continue;
    const token=fs.readFileSync(path.join(recordDirectory,name+'.token'),'utf8').trim();
    const response=await fetch(`http://127.0.0.1:${record.port}/api/status`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(1500)});
    if(response.ok)return {port:record.port,token};
  }catch{}
  return null;
}
async function connect() {
  if (session && socket?.readyState === WebSocket.OPEN) return {ready:true};
  if (connecting) return connecting;
  connecting = (async () => {
    fs.mkdirSync(path.join(root,'logs'),{recursive:true});
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
            {windowsHide:true,env:runtimeEnv,stdio:['pipe','pipe','pipe']});
          let output='';helper.stdout.on('data',chunk=>{output+=chunk.toString();});
          helper.on('error',reject);helper.on('close',code=>{
            if(code!==0)return reject(new Error('Hermes não conseguiu preparar a credencial local.'));
            try{resolve(JSON.parse(output.trim()).path);}catch{reject(new Error('Resposta inválida ao preparar conexão.'));}
          });helper.stdin.end(token);
        });
        backend = spawn(path.join(root,'runtime/bin/hermes.exe'), ['serve','--host','127.0.0.1','--port','0',
          '--ssh-session-token-file',tokenFile,'--ssh-owner-nonce',nonce], {
          cwd:workspace, windowsHide:true, env:runtimeEnv, stdio:['ignore','pipe','pipe']
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
        endpoint = ownEndpoint;
        if (endpoint) break;
        if (backend.exitCode !== null) {
          endpoint=await locate();
          if(endpoint)break;
          throw new Error('Hermes encerrou durante a inicialização: '+backendFailure);
        }
      }
    }
    if (!endpoint) throw new Error('Hermes não ficou pronto. Tente conectar novamente.');
    activeEndpoint=endpoint;
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
        } else if(frame.id&&frame.method&&frame.params?.session_id===session){
          if(['approval','clarify'].includes(frame.method)){
            userRequests.set(String(frame.id),frame);
            emit({type:'user.request',payload:{id:String(frame.id),method:frame.method,params:frame.params}});
          }else emit({type:'session.notice',text:'Esta ação requer um recurso da interface original do Hermes. Interrompa e use -HermesDesktop para continuar.'});
        } else if (frame.method === 'event') {
          const data = frame.params;
          if (data?.session_id && data.session_id !== session) continue;
          if (data?.type === 'message.complete' || data?.type === 'error') busy=false;
          if(data?.type==='request.cancel'){userRequests.delete(String(data.payload?.id));}
          if (data?.type === 'voice.transcript') {
            recording=false;clearTimeout(recordingTimer);
            request('voice.toggle',{action:'off'}).catch(()=>{});
          }
          emit(data);
        }
      }
    });
    socket.addEventListener('close', () => {
      session=null; busy=false;recording=false;userRequests.clear();clearTimeout(recordingTimer);rejectPending('Conexão encerrada.');
      emit({type:'connection.error',text:'Conexão encerrada. Clique em Reconectar.'});
    });
    await request('client.capabilities',{server_requests:true});
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
    for(const frame of result.open_requests||[]){if(['approval','clarify'].includes(frame.method)){userRequests.set(String(frame.id),frame);emit({type:'user.request',payload:{id:String(frame.id),method:frame.method,params:frame.params}});}}
    fs.mkdirSync(path.dirname(stateFile),{recursive:true});
    fs.writeFileSync(stateFile,JSON.stringify({stored_session_id:result.stored_session_id||result.session_key||result.resumed||result.info?.stored_session_id||stored||session}));
    const messages=(result.messages||[]).filter(row=>['user','assistant'].includes(row.role)&&row.display_kind!=='hidden').slice(-80)
      .map(row=>({role:row.role,text:typeof row.content==='string'?row.content:typeof row.text==='string'?row.text:''})).filter(row=>row.text);
    // Private diagnostic marker, without credentials or conversation content.
    fs.writeFileSync(path.join(root,'logs',`jarvis-connection-${process.pid}.json`),JSON.stringify({connected:true,pid:process.pid,workspace,checked_at:new Date().toISOString()}));
    return {ready:true,model:result.info?.model||'Modelo em verificação',messages};
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
ipcMain.handle('jarvis:answer',async(event,id,answer)=>{
  trusted(event);const frame=userRequests.get(id);
  if(!frame||frame.params.session_id!==session)throw new Error('Pedido não está mais disponível.');
  if(frame.method==='approval'){
    const allowed=frame.params.choices||['once','deny'];
    if(!['once','deny'].includes(answer?.choice)||!allowed.includes(answer.choice))throw new Error('Escolha inválida.');
    answer={choice:answer.choice};
  }else{
    const answers={};
    for(const question of frame.params.questions||[]){const value=answer?.answers?.[question.qid];if(value!==null&&(typeof value!=='string'||value.length>2000))throw new Error('Resposta inválida.');answers[question.qid]=value;}
    answer={answers};
  }
  const result=await request('request.answer',{id,result:answer});userRequests.delete(id);return result;
});
async function audioRequest(route,payload) {
  await connect();
  const response=await fetch(`http://127.0.0.1:${activeEndpoint.port}/api/audio/${route}`,{
    method:'POST',headers:{Authorization:`Bearer ${activeEndpoint.token}`,'Content-Type':'application/json'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(120000)
  });
  const result=await response.json();
  if(!response.ok||!result.ok)throw new Error(result.detail||'Falha no áudio local.');
  return result;
}
ipcMain.handle('jarvis:calendar',event=>{trusted(event);const file=path.join(root,'runtime/calendar/snapshot.json');if(!fs.existsSync(file))return {events:[],connected:false};if(fs.statSync(file).size>10000000)throw Error('Agenda excede o limite local.');const data=JSON.parse(fs.readFileSync(file,'utf8'));if(data.version!==1||!Array.isArray(data.events))throw Error('Agenda inválida.');return {...data,connected:true};});
ipcMain.handle('jarvis:voice-status',async event=>{trusted(event);await connect();return request('voice.toggle',{action:'status'});});
ipcMain.handle('jarvis:record',async(event,action)=>{
  trusted(event);if(!['start','stop','cancel'].includes(action))throw new Error('Ação de voz inválida.');
  if(action==='cancel'){recording=false;clearTimeout(recordingTimer);if(socket?.readyState!==WebSocket.OPEN)return {enabled:false};return request('voice.toggle',{action:'off'});}
  await connect();
  if(action==='stop'){recording=false;clearTimeout(recordingTimer);return request('voice.record',{action:'stop',session_id:session});}
  if(busy||recording)throw new Error('Aguarde a tarefa ou a gravação atual.');
  await request('voice.toggle',{action:'on'});
  try{
    const result=await request('voice.record',{action:'start',session_id:session});
    recording=result.status==='recording';
    if(!recording){await request('voice.toggle',{action:'off'});throw new Error('Microfone ocupado.');}
    clearTimeout(recordingTimer);recordingTimer=setTimeout(()=>{
      recording=false;request('voice.toggle',{action:'off'}).catch(()=>{});
      emit({type:'voice.timeout',text:'Gravação encerrada. Tente novamente.'});
    },45000);
    return result;
  }catch(error){recording=false;await request('voice.toggle',{action:'off'}).catch(()=>{});throw error;}
});
ipcMain.handle('jarvis:speak',async(event,text)=>{
  trusted(event);if(typeof text!=='string'||!text.trim()||text.length>4000)throw new Error('Escolha uma resposta de até 4000 caracteres para ouvir.');
  const result=await audioRequest('speak',{text});
  if(typeof result.data_url!=='string'||!/^data:audio\/[\w.+-]+;base64,/.test(result.data_url)||result.data_url.length>30000000)throw new Error('Áudio inválido.');
  return {dataUrl:result.data_url,provider:result.provider};
});
ipcMain.handle('jarvis:transcribe',async(event,dataUrl)=>{
  trusted(event);if(typeof dataUrl!=='string'||!/^data:audio\/[\w.+-]+;base64,/.test(dataUrl)||dataUrl.length>8000000)throw new Error('Áudio inválido ou muito grande.');
  return audioRequest('transcribe',{data_url:dataUrl});
});
ipcMain.handle('jarvis:resources', async event => {
  trusted(event);
  const memory={total:Math.round(os.totalmem()/2**30*10)/10,free:Math.round(os.freemem()/2**30*10)/10};
  const gpu=await new Promise(resolve => execFile('nvidia-smi',['--query-gpu=memory.used,memory.total','--format=csv,noheader,nounits'],
    {windowsHide:true,timeout:3000},(error,stdout) => resolve(error?null:stdout.trim())));
  return {memory,gpu};
});
ipcMain.handle('jarvis:tasks',(event,action,payload)=>{
  trusted(event);
  if(action==='list')return tasks.list();
  if(action==='create')return tasks.create(payload);
  if(action==='complete')return tasks.complete(payload?.id,payload?.done);
  if(action==='notifications'){if(typeof payload?.enabled!=='boolean')throw new Error('Preferência inválida.');notificationsEnabled=payload.enabled;return {enabled:notificationsEnabled};}
  throw new Error('Ação de tarefas inválida.');
});
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if(win){win.restore();win.focus();} });
  app.whenReady().then(() => {
    win=new BrowserWindow({icon:nativeImage.createFromDataURL(require('./icon.cjs')),width:1200,height:800,minWidth:720,minHeight:600,title:'Jarvis',backgroundColor:'#030a15',autoHideMenuBar:true,
      webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.loadFile(path.join(__dirname,'index.html'));
    win.once('ready-to-show',()=>{win.show();win.focus();});
    taskTimer=setInterval(()=>{
      try{
        const due=tasks.due();emit({type:'tasks.due',payload:{count:due.length}});
        if(notificationsEnabled&&Notification.isSupported())for(const item of due.filter(row=>!row.notified_at)){
          const notification=new Notification({title:'Jarvis · lembrete',body:item.text,silent:true});
          notification.show();tasks.markNotified(item.id);
        }
      }catch{} // Invalid files remain intact; the task panel shows the recoverable error.
    },30000);
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', () => {
    clearInterval(taskTimer);
    clearTimeout(recordingTimer);
    if(recording)request('voice.toggle',{action:'off'}).catch(()=>{});
    socket?.close(); rejectPending('Aplicativo encerrado.');
    if(backend && backend.exitCode===null){
      if(process.platform==='win32')execFile('taskkill',['/PID',String(backend.pid),'/T','/F'],{windowsHide:true},()=>{});
      else backend.kill();
    }
  });
}
