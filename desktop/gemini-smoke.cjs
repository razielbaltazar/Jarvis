// End-to-end: Electron bridge -> Hermes -> configured cloud model, isolated workspace.
const {app,BrowserWindow}=require('electron');const fs=require('node:fs');const path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-gemini-check'));require('./main.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<20;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(300);}
 const evaluate=code=>win.webContents.executeJavaScript(code);
 for(let i=0;i<60;i++){await sleep(1000);if(await evaluate("document.body.dataset.state==='ready'"))break;if(i===59)throw Error('Conexão não ficou pronta');}
 const model=await evaluate("document.getElementById('model').textContent");
 await evaluate("document.getElementById('input').value='Responda somente: Gemini conectado ao Jarvis.';document.getElementById('form').requestSubmit()");
 if(await evaluate("document.getElementById('input').disabled"))throw Error('Caixa bloqueada durante execução');
 for(let i=0;i<90;i++){await sleep(1000);const result=await evaluate("({state:document.body.dataset.state,text:document.getElementById('messages').textContent})");if(result.state==='ready'){
 if(!result.text.includes('Gemini conectado ao Jarvis.')||result.text.includes('tarefa falhou')||result.text.includes('pedido não foi confirmado'))throw Error('Resposta da API não confirmada: '+result.text.slice(-400));
 fs.mkdirSync(process.env.JARVIS_CHECK_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.JARVIS_CHECK_OUTPUT,'gemini-resultado.json'),JSON.stringify({model,inputAvailable:true,response:result.text},null,2));app.quit();return;}}
 throw Error('Resposta excedeu prazo');
}).catch(error=>{console.error(error.stack);app.exit(1);});
