// Real desktop recovery with isolated chat, no microphone or personal files.
const {app,BrowserWindow}=require('electron');const fs=require('node:fs'),path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-recovery-check'));require('./main.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const marker='jarvis-retomada-20261007';
app.whenReady().then(async()=>{
 let win;for(let i=0;i<20;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(300);}
 const evaluate=code=>win.webContents.executeJavaScript(code);
 for(let i=0;i<60;i++){await sleep(1000);if(await evaluate("document.body.dataset.state==='ready'"))break;if(i===59)throw Error('Conexão excedeu prazo');}
 const turn=Number(process.env.JARVIS_CHECK_ROUND||'1');
 if(turn===1){
 await evaluate(`document.getElementById('input').value='Responda somente: ${marker}';document.getElementById('form').requestSubmit()`);
 await evaluate("document.getElementById('input').value='Responda somente: fila-real-confirmada';document.getElementById('form').requestSubmit()");
 for(let i=0;i<90;i++){await sleep(1000);const check=await evaluate("({ready:document.body.dataset.state==='ready',assistant:Array.from(document.querySelectorAll('#messages .assistant span')).map(x=>x.textContent),queue:document.querySelectorAll('#queue .queued').length})");if(check.ready&&!check.queue&&check.assistant.includes(marker)&&check.assistant.includes('fila-real-confirmada'))break;if(i===89)throw Error('Fila real não concluiu ambos os pedidos');}
 }else{
 const history=await evaluate("Array.from(document.querySelectorAll('#messages .assistant span')).map(x=>x.textContent)");
 if(!history.includes(marker)||!history.includes('fila-real-confirmada'))throw Error('Histórico não foi recuperado');
 const model=await evaluate("document.getElementById('model').textContent");await evaluate("document.getElementById('reconnect').click()");await sleep(200);
 const after=await evaluate("Array.from(document.querySelectorAll('#messages .assistant span')).map(x=>x.textContent)");if(!after.includes(marker)||!after.includes('fila-real-confirmada'))throw Error('Reconectar apagou a conversa');if(await evaluate("document.getElementById('model').textContent")!==model)throw Error('Reconectar alterou o modelo exibido');
 }
 const output=process.env.JARVIS_CHECK_OUTPUT;fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'reabertura-'+turn+'.json'),JSON.stringify({round:turn,restored:turn>1,realQueue:turn===1,connected:true,microphoneUsed:false},null,2));
 app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1);});
