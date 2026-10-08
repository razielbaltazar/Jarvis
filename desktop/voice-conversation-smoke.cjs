// Actual STT -> model -> TTS with injected capture and silent playback; no user mic.
const {app,BrowserWindow,ipcMain}=require('electron');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-voice-conversation-check-'+process.pid));
require('./main.cjs');
const records=[];ipcMain.removeHandler('jarvis:record');
ipcMain.handle('jarvis:record',(_event,action)=>{records.push(action);return {status:'recording'};});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<30;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(300);}
 const evaluate=code=>win.webContents.executeJavaScript(code);
 async function until(condition,seconds){for(let i=0;i<seconds;i++){if(await evaluate(condition))return;await sleep(1000);}throw Error('Timed out: '+condition);}
 await until("document.body.dataset.state==='ready'",90);
 await evaluate(`window.Audio=class{constructor(){this.events={};}addEventListener(name,fn){this.events[name]=fn;}play(){this.events.play?.();setTimeout(()=>this.events.ended?.(),20);return Promise.resolve();}pause(){}};true`);
 const audio=await evaluate("window.jarvis.speak('Olá Jarvis, responda apenas pronto.')");
 const transcript=await evaluate(`window.jarvis.transcribe(${JSON.stringify(audio.dataUrl)})`);
 assert.ok(transcript.transcript?.trim());
 await evaluate("document.getElementById('mic').click()");await until("document.body.dataset.state==='listening'",10);
 const started=Date.now();
 for(let turn=0;turn<2;turn++){
  const before=records.filter(x=>x==='start').length;
  win.webContents.send('jarvis:event',{type:'voice.status',payload:{state:'transcribing'}});
  win.webContents.send('jarvis:event',{type:'voice.transcript',payload:{text:transcript.transcript}});
  await sleep(200);
  await until("document.body.dataset.state==='listening'",150);
  assert.equal(records.filter(x=>x==='start').length,before+1);
  const response=await evaluate("document.querySelector('#messages .assistant:last-child')?.textContent||''");
  assert.ok(response.length>6);assert.ok(!/falhou|não foi confirmado|HTTP 503/i.test(response));
 }
 await evaluate("document.getElementById('mic').click()");
 const output=process.env.JARVIS_CHECK_OUTPUT;fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'voice-conversation.json'),JSON.stringify({twoRealVoiceTurns:true,actualTranscription:true,actualModelResponses:true,actualSynthesis:true,automaticRearm:true,microphoneUsed:false,speakerUsed:false,seconds:(Date.now()-started)/1000}));
 app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1);});
