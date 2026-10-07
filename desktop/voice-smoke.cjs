// Real audio relay check. Never opens or records the user's microphone.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs');const path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-voice-check'));
require('./main.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const output=process.env.JARVIS_CHECK_OUTPUT;if(!output)throw new Error('JARVIS_CHECK_OUTPUT required');
 fs.mkdirSync(output,{recursive:true});let win;
 for(let i=0;i<10;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(500);}
 for(let i=0;i<120;i++){await sleep(1000);if(await win.webContents.executeJavaScript(`document.body.dataset.state==='ready'`))break;if(i===119)throw new Error('Voice renderer connection failed');}
 const status=await win.webContents.executeJavaScript('window.jarvis.voiceStatus()');
 if(status.enabled)throw new Error('Microphone voice mode should start disabled');
 const started=Date.now();
 const audio=await win.webContents.executeJavaScript(`window.jarvis.speak('Olá, eu sou o Jarvis. Vamos organizar suas tarefas e construir seus projetos.')`);
 if(audio.provider!=='piper')throw new Error('Unexpected TTS provider');
 const bytes=Buffer.from(audio.dataUrl.split(',')[1],'base64');if(bytes.length<1000)throw new Error('Empty audio');
 const sttStarted=Date.now();
 const transcript=await win.webContents.executeJavaScript(`window.jarvis.transcribe(${JSON.stringify(audio.dataUrl)})`);
 if(!transcript.transcript?.toLowerCase().includes('tarefas')||!transcript.transcript.toLowerCase().includes('projetos'))throw new Error('Voice relay transcript mismatch');
 const after=await win.webContents.executeJavaScript('window.jarvis.voiceStatus()');
 if(after.enabled)throw new Error('Audio relay activated microphone');
 const report={success:true,stt:transcript.provider,tts:audio.provider,transcript:transcript.transcript,
  synthesis_seconds:(sttStarted-started)/1000,transcription_seconds:(Date.now()-sttStarted)/1000,microphone_used:false,voice_mode_disabled:true};
 fs.writeFileSync(path.join(output,'voz-desktop-resultado.json'),JSON.stringify(report,null,2));
 // Verify voice controls render and error/disconnect does not leave a fake listening state.
 const ui=await win.webContents.executeJavaScript(`({mic:!!document.getElementById('mic'),listen:!!document.getElementById('listen'),automatic:document.getElementById('auto-speak').checked})`);
 if(!ui.mic||!ui.listen||ui.automatic)throw new Error('Voice controls missing or auto speech on by default');
 fs.writeFileSync(path.join(output,'voz-controles.json'),JSON.stringify(ui,null,2));
 app.quit();
}).catch(error=>{console.error(error.message);app.exit(1);});
