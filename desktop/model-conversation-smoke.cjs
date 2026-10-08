// Real native model switch in an isolated conversation, no global default change.
const {app,BrowserWindow}=require('electron'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-model-check-'+process.pid));
require('./main.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<30;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(200);}
 const evaluate=code=>win.webContents.executeJavaScript(code);
 async function until(condition,seconds){for(let i=0;i<seconds;i++){if(await evaluate(condition))return;await sleep(1000);}throw Error('Timed out: '+condition);}
 await until("document.body.dataset.state==='ready'",90);
 const options=await evaluate('window.jarvis.models()');
 assert.ok(options.models.some(row=>row.id==='gemini-3.5-flash-lite'));
 const before=await evaluate("document.querySelectorAll('#messages .assistant').length");
 const switched=await evaluate("window.jarvis.selectModel('gemini-3.5-flash-lite')");
 assert.equal(switched.model,'gemini-3.5-flash-lite');
 await evaluate("document.getElementById('input').value='Responda apenas MODELO_OK, sem ferramentas.';document.getElementById('form').requestSubmit();true");
 await until("document.body.dataset.state==='ready'&&document.querySelectorAll('#messages .assistant').length>"+before,90);
 const answer=await evaluate("document.querySelector('#messages .assistant:last-child').textContent");
 assert.ok(answer.includes('MODELO_OK'),answer);
 const restored=await evaluate("window.jarvis.selectModel('gemini-3.1-flash-lite')");
 assert.equal(restored.model,'gemini-3.1-flash-lite');
 const restoredBefore=await evaluate("document.querySelectorAll('#messages .assistant').length");
 await evaluate("document.getElementById('input').value='Responda apenas RETORNO_OK, sem ferramentas.';document.getElementById('form').requestSubmit();true");
 await until("document.body.dataset.state==='ready'&&document.querySelectorAll('#messages .assistant').length>"+restoredBefore,90);
 assert.ok((await evaluate("document.querySelector('#messages .assistant:last-child').textContent")).includes('RETORNO_OK'));
 const after=await evaluate('window.jarvis.models()');
 assert.equal(after.current,'gemini-3.1-flash-lite');
 const capabilities=await evaluate('window.jarvis.capabilities()');
 for(const name of ['read_file','memory','session_search','execute_code','web_search','clarify','delegate_task'])assert.ok(capabilities.tools.includes(name),'Missing tool: '+name);
 assert.ok(!capabilities.tools.includes('desktop_preview'),'Unsupported original desktop panes must not be advertised');
 const output=process.env.JARVIS_CHECK_OUTPUT;fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'model-conversation.json'),JSON.stringify({realSwitch:true,actualAlternativeResponse:true,actualRestoredResponse:true,restoredSelection:true,sessionOnly:true,liveCapabilities:true,available:options.models.map(row=>row.id)},null,2));
 app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1);});
