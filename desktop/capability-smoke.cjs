// Real desktop connection and disconnected-calendar contract, without model calls.
const {app,BrowserWindow}=require('electron');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-capability-check-'+process.pid));
require('./main.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<20;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(300);}
 assert.ok(win);const evaluate=code=>win.webContents.executeJavaScript(code);
 for(let i=0;i<90;i++){if(await evaluate("document.body.dataset.state==='ready'"))break;await sleep(1000);}
 assert.equal(await evaluate("document.body.dataset.state"),'ready');
 const calendar=await evaluate('window.jarvis.calendar()');
 assert.equal(calendar.connected,false);assert.deepEqual(calendar.events,[]);
 assert.equal(await evaluate("document.getElementById('input').disabled"),false);
 const capabilities=await evaluate('window.jarvis.capabilities()');
 for(const name of ['read_file','memory','session_search','execute_code','web_search','clarify','delegate_task'])assert.ok(capabilities.tools.includes(name),'Missing tool: '+name+'; '+capabilities.tools);
 assert.equal(typeof capabilities.control.revision,'string');
 assert.equal(capabilities.control.goal,null);
 assert.equal(capabilities.control.loop,null);
 assert.equal(capabilities.control.heartbeat,null);
 const control=await evaluate("window.jarvis.control('heartbeat.pause')");
 assert.equal(control.control.heartbeat,null);
 assert.equal(control.control.revision,capabilities.control.revision);
 assert.ok(await evaluate("window.jarvis.control('invalid').then(()=>false,()=>true)"));
 fs.mkdirSync(process.env.JARVIS_CHECK_OUTPUT,{recursive:true});
 fs.writeFileSync(path.join(process.env.JARVIS_CHECK_OUTPUT,'capabilities.json'),JSON.stringify({connected:true,inputAvailable:true,calendarDisconnectedWithoutSnapshot:true,liveToolList:true,emptyControlRead:true,idleControlRoundTrip:true,invalidControlRejected:true,tools:capabilities.tools}));
 app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1);});
