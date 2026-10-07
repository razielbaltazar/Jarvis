const {app,BrowserWindow}=require('electron');const fs=require('node:fs');const path=require('node:path');
app.setPath('userData',path.join(app.getPath('temp'),'jarvis-daily-check'));require('./main.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const output=process.env.JARVIS_CHECK_OUTPUT;fs.mkdirSync(output,{recursive:true});let win;
 for(let i=0;i<10;i++){win=BrowserWindow.getAllWindows()[0];if(win)break;await sleep(500);}
 for(let i=0;i<120;i++){await sleep(1000);if(await win.webContents.executeJavaScript(`document.body.dataset.state==='ready'`))break;if(i===119)throw new Error('Daily renderer did not connect');}
 await win.webContents.executeJavaScript(`document.getElementById('tasks-toggle').click();document.getElementById('task-text').value='Revisar o projeto de teste';document.getElementById('task-form').requestSubmit();`);
 await sleep(500);
 let items=await win.webContents.executeJavaScript(`window.jarvis.tasks('list')`);if(!items.some(item=>item.text==='Revisar o projeto de teste'))throw new Error('Task UI did not save');
 const first=items.find(item=>item.text==='Revisar o projeto de teste');
 await win.webContents.executeJavaScript(`window.jarvis.tasks('complete',{id:${JSON.stringify(first.id)},done:true})`);
 await win.webContents.executeJavaScript(`document.getElementById('input').value='Anote uma nota local com o texto exato "Continuidade do projeto validada." Preserve as tarefas existentes e confirme que salvou.';document.getElementById('form').requestSubmit();`);
 let confirmed=false;
 for(let i=0;i<180;i++){
  await sleep(1000);const state=await win.webContents.executeJavaScript('document.body.dataset.state');
  if(state==='ready'){
   const answer=await win.webContents.executeJavaScript("document.querySelector('#messages .assistant:last-child span')?.textContent||''");
   if(/erro|n[aã]o (posso|consigo|consegui)|conflito/i.test(answer)||!answer)throw new Error('Agent did not confirm successful save: '+answer.slice(0,300));
   const store=JSON.parse(fs.readFileSync(path.join(process.env.JARVIS_WORKSPACE,'.jarvis/tasks.json'),'utf8'));
   const note=store.items.find(item=>item.type==='note'&&item.text==='Continuidade do projeto validada.');
   if(!note)throw new Error('Agent did not save the note');if(!store.items.find(item=>item.id===first.id)?.done)throw new Error('Agent lost existing task');
   confirmed=true;break;
  }
 }
 if(!confirmed)throw new Error('Daily action timed out');
 await win.webContents.executeJavaScript(`document.getElementById('tasks-toggle').click()`);await sleep(500);
 const screenshot=await win.webContents.capturePage();if(!screenshot.isEmpty())fs.writeFileSync(path.join(output,'jarvis-tarefas.png'),screenshot.toPNG());
 fs.writeFileSync(path.join(output,'tarefas-resultado.json'),JSON.stringify({uiSaved:true,agentSavedNote:true,existingTaskPreserved:true,notificationsEnabled:false},null,2));app.quit();
}).catch(error=>{console.error(error.message);app.exit(1);});
