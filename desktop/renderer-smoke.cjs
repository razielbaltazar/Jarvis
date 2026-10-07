// Exercise the real Chromium renderer with mocked audio/agent, without adding test dependencies.
const {app,BrowserWindow}=require('electron');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,webPreferences:{preload:path.join(__dirname,'test-preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 await win.loadFile(path.join(__dirname,'index.html'));await sleep(300);
 const evaluate=code=>win.webContents.executeJavaScript(code);
 assert.deepEqual(await evaluate('window.jarvis.testState().records'),[]);
 assert.equal(await evaluate("document.getElementById('auto-speak').checked"),false);
 await evaluate("document.getElementById('mic').click()");await sleep(50);
 assert.deepEqual(await evaluate('window.jarvis.testState().records'),['start']);
 win.webContents.send('jarvis:test-event',{type:'voice.transcript',payload:{text:'Anotar uma tarefa'}});await sleep(50);
 assert.equal(await evaluate("document.getElementById('input').value"),'Anotar uma tarefa');assert.deepEqual(await evaluate('window.jarvis.testState().sends'),[]);
 await evaluate(`window.testAudios=[];window.Audio=class{constructor(){this.events={};window.testAudios.push(this);}addEventListener(name,fn){this.events[name]=fn;}play(){this.events.play?.();return Promise.resolve();}pause(){}};true`);
 win.webContents.send('jarvis:test-event',{type:'message.complete',payload:{text:'Resposta para ouvir',status:'complete'}});await sleep(50);
 await evaluate("document.getElementById('listen').click()");await sleep(50);assert.equal(await evaluate('document.body.dataset.state'),'speaking');
 await evaluate("document.getElementById('input').value='Criar projeto';document.getElementById('form').requestSubmit()");await sleep(50);
 await evaluate('window.testAudios[0].events.error()');assert.equal(await evaluate('document.body.dataset.state'),'processing');
 win.webContents.send('jarvis:test-event',{type:'user.request',payload:{id:'test',method:'approval',params:{command:'<img src=x onerror=alert(1)>',choices:['once','deny']}}});await sleep(50);
 assert.equal(await evaluate('document.body.dataset.state'),'waiting');assert.equal(await evaluate("!!document.querySelector('#decision img')"),false);
 assert.equal(await evaluate("document.getElementById('input').disabled"),true);
 win.webContents.send('jarvis:test-event',{type:'request.cancel',payload:{id:'test'}});await sleep(50);assert.equal(await evaluate("document.getElementById('decision').hidden"),true);
 const output=process.env.JARVIS_CHECK_OUTPUT;fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'renderer-resultado.json'),JSON.stringify({microphoneOffAtStartup:true,transcriptNotAutoSubmitted:true,staleAudioCannotResetTask:true,approvalEscaped:true,cancellationHandled:true},null,2));
 win.close();app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1);});
