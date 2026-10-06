// Integration check: real Electron renderer -> protected bridge -> local Hermes.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs');const path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-hud-check'));
require('./main.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const output=process.env.JARVIS_CHECK_OUTPUT;
 if(!output)throw new Error('JARVIS_CHECK_OUTPUT required');
 fs.mkdirSync(output,{recursive:true});
 let win;
 for(let i=0;i<10;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(500);}
 for(let i=0;i<120;i++){
  await sleep(1000);
  const state=await win.webContents.executeJavaScript('document.body.dataset.state');
  if(state==='ready')break;
  if(i===119)throw new Error('Renderer did not connect');
 }
 win.showInactive();await sleep(500);
 if(process.env.JARVIS_CHECK_RESUME==='1'){
  const history=await win.webContents.executeJavaScript(`document.getElementById('messages').textContent`);
  if(!history.includes('verificacao-hud')||!history.includes('Interface Jarvis conectada.'))throw new Error('Previous conversation was not restored');
  fs.writeFileSync(path.join(output,'retomada.json'),JSON.stringify({restored:true},null,2));app.quit();return;
 }
 const initial=await win.webContents.capturePage();if(!initial.isEmpty())fs.writeFileSync(path.join(output,'jarvis-inicial.png'),initial.toPNG());
 const accessibility=await win.webContents.executeJavaScript(`(()=>{
  document.getElementById('system-toggle').click();
  const opened=!document.getElementById('system').hidden;
  document.querySelector('[data-close="system"]').click();
  const closed=document.getElementById('system').hidden;
  return {opened,closed,nodeExposed:typeof window.require!=='undefined',tokenExposed:'token' in window.jarvis};
 })()`);
 if(!accessibility.opened||!accessibility.closed||accessibility.nodeExposed||accessibility.tokenExposed)throw new Error('Panel/bridge check failed');
 const filename=`verificacao-hud-${process.pid}.txt`;
 await win.webContents.executeJavaScript(`document.getElementById('input').value=${JSON.stringify('Crie o arquivo '+filename+' na pasta atual com exatamente: Interface Jarvis conectada. Depois confirme em uma frase.')};document.getElementById('form').requestSubmit();`);
 for(let i=0;i<180;i++){
  await sleep(1000);
  const result=await win.webContents.executeJavaScript(`({state:document.body.dataset.state,text:document.getElementById('messages').textContent,logs:document.getElementById('logs').textContent})`);
  if(result.state==='ready'&&result.text.includes('JARVIS')){
   const target=path.join(process.env.JARVIS_WORKSPACE,filename);
   if(!fs.existsSync(target)||fs.readFileSync(target,'utf8').trim()!=='Interface Jarvis conectada.')throw new Error('File action failed');
   await sleep(500);const screenshot=await win.webContents.capturePage();if(!screenshot.isEmpty())fs.writeFileSync(path.join(output,'jarvis-conversa.png'),screenshot.toPNG());
   fs.writeFileSync(path.join(output,'resultado.json'),JSON.stringify({accessibility,...result,fileAction:true},null,2));
   app.quit();return;
  }
 }
 throw new Error('Task timed out');
}).catch(error=>{console.error(error.message);app.exit(1);});
