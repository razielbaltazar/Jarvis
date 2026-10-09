// Visual preview with fictitious content. No model, microphone or personal data.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs');const path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-interface-preview-'+process.pid));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,width:1280,height:800,webPreferences:{preload:path.join(__dirname,'test-preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 await win.loadFile(path.join(__dirname,'index.html'));await sleep(300);
 const run=code=>win.webContents.executeJavaScript(code);
 for(let attempt=0;attempt<20;attempt++){if(await run("document.body.dataset.state==='ready'"))break;await sleep(50);}
 await run("document.getElementById('input').value='Organize os arquivos deste projeto e prepare um resumo executivo.';document.getElementById('form').requestSubmit()");
 await sleep(80);win.webContents.send('jarvis:test-event',{type:'tool.start',payload:{name:'read_file'}});await sleep(50);
 win.webContents.send('jarvis:test-event',{type:'tool.complete',payload:{name:'read_file'}});await sleep(50);
 win.webContents.send('jarvis:test-event',{type:'message.complete',payload:{status:'complete',text:'Analisei o projeto. O resumo está pronto e os próximos passos foram organizados.'}});await sleep(120);
 const output=process.env.JARVIS_CHECK_OUTPUT;if(!output)throw Error('JARVIS_CHECK_OUTPUT required');fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'preview-state.json'),await run("JSON.stringify({sends:window.jarvis.testState().sends,messages:document.querySelectorAll('.message').length,contextColor:getComputedStyle(document.querySelector('.context-title h2')).color,contextOpacity:getComputedStyle(document.getElementById('context-home')).opacity})"));
 fs.writeFileSync(path.join(output,'jarvis-interface-1280.png'),(await win.webContents.capturePage()).toPNG());app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1);});
