// Real desktop chat and recovery check. Uses an isolated test workspace and profile.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-chat-check'));
require('./main.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const output=process.env.JARVIS_CHECK_OUTPUT;
 if(!output)throw new Error('JARVIS_CHECK_OUTPUT required');
 fs.mkdirSync(output,{recursive:true});
 let win;for(let i=0;i<10;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(500);}
 let ready=false;for(let i=0;i<120;i++){await sleep(1000);if(await win.webContents.executeJavaScript('document.body.dataset.state')==='ready'){ready=true;break;}}
 if(!ready)throw new Error('Chat did not connect');
 await sleep(2000);
 if(process.env.JARVIS_CHECK_RESUME==='1'){
  const text=await win.webContents.executeJavaScript(`document.getElementById('messages').textContent`);
  if(!text.includes('azul-cobalto-731'))throw new Error('Chat history not recovered');
  fs.writeFileSync(path.join(output,'chat-retomada.json'),JSON.stringify({connected:true,historyRestored:true},null,2));app.quit();return;
 }
 const turns=[];
 for(const prompt of ['Olá! Responda em português e diga em uma frase como pode me ajudar a construir projetos.','Responda somente com a palavra azul-cobalto-731. Não use ferramentas.']){
  const before=await win.webContents.executeJavaScript(`document.querySelectorAll('#messages .assistant').length`);
  await win.webContents.executeJavaScript(`document.getElementById('input').value=${JSON.stringify(prompt)};document.getElementById('form').requestSubmit();`);
  let answered=false;
  for(let i=0;i<180;i++){await sleep(1000);const result=await win.webContents.executeJavaScript(`({state:document.body.dataset.state,count:document.querySelectorAll('#messages .assistant').length,text:document.querySelector('#messages .assistant:last-child span')?.textContent,logs:document.getElementById('logs').textContent})`);if(i%15===0)console.log(JSON.stringify(result));if(result.state==='ready'&&result.count>before&&result.text?.trim()){turns.push(result.text);answered=true;break;}}
  if(!answered)throw new Error('Chat response timed out');
 }
 const text=await win.webContents.executeJavaScript(`document.getElementById('messages').textContent`);
 if(!turns.at(-1).includes('azul-cobalto-731'))throw new Error('Conversation marker missing in reply');
 fs.writeFileSync(path.join(output,'chat-resultado.json'),JSON.stringify({connected:true,twoTurnsCompleted:true,turns},null,2));app.quit();
}).catch(error=>{console.error(error.message);app.exit(1);});
