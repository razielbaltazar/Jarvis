const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {createTaskStore}=require('./task-store.cjs');
const base=process.env.JARVIS_TEST_ROOT;if(!base)throw new Error('Use a private test root');
fs.mkdirSync(base,{recursive:true});
test('records survive reopening; completing one does not remove the other',()=>{
 const root=fs.mkdtempSync(path.join(base,'tasks-'));const store=createTaskStore(root);
 const first=store.create({type:'task',text:'Revisar projeto'})[0];store.create({type:'note',text:'Preservar esta nota'});
 store.complete(first.id,true);const reopened=createTaskStore(root).list();
 assert.equal(reopened.length,2);assert.equal(reopened[0].done,true);assert.equal(reopened[1].text,'Preservar esta nota');
});
test('invalid JSON is preserved instead of replaced by a new record',()=>{
 const root=fs.mkdtempSync(path.join(base,'tasks-'));fs.mkdirSync(path.join(root,'.jarvis'));const file=path.join(root,'.jarvis/tasks.json');fs.writeFileSync(file,'corrupted');
 assert.throws(()=>createTaskStore(root).create({type:'note',text:'test'}));assert.equal(fs.readFileSync(file,'utf8'),'corrupted');
});
test('reminders are due only after their date; completed reminders no longer notify',()=>{
 const root=fs.mkdtempSync(path.join(base,'tasks-'));const store=createTaskStore(root);const due=Date.now()+60000;
 const item=store.create({type:'reminder',text:'Revisão',due_at:new Date(due).toISOString()})[0];
 assert.equal(store.due(due-1).length,0);assert.equal(store.due(due+1).length,1);store.markNotified(item.id);
 assert.ok(store.list()[0].notified_at);store.complete(item.id,true);assert.equal(store.due(due+1).length,0);
});

test('competing writers preserve all records',async()=>{
 const root=fs.mkdtempSync(path.join(base,'concurrent-'));const {spawn}=require('node:child_process');
 const worker=`const {createTaskStore}=require(process.argv[1]);const store=createTaskStore(process.argv[2]);(async()=>{for(let i=0;i<20;i++){let saved=false;for(let attempt=0;attempt<100;attempt++){try{store.create({type:'note',text:process.argv[3]+':'+i});saved=true;break;}catch(error){if(!error.message.includes('Registros em uso'))throw error;await new Promise(r=>setTimeout(r,5));}}if(!saved)throw Error('Timed out');}})().catch(e=>{console.error(e);process.exitCode=1;});`;
 await Promise.all(Array.from({length:4},(_,id)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,['-e',worker,path.join(__dirname,'task-store.cjs'),root,String(id)],{windowsHide:true,stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',d=>error+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(error)));})));
 const rows=createTaskStore(root).list();assert.equal(rows.length,80);assert.equal(new Set(rows.map(x=>x.text)).size,80);assert.equal(fs.existsSync(path.join(root,'.jarvis/tasks.lock')),false);
});
test('existing lock rejects a write without changing records',()=>{
 const root=fs.mkdtempSync(path.join(base,'locked-'));const store=createTaskStore(root);store.create({type:'note',text:'Preservada'});const lock=path.join(root,'.jarvis/tasks.lock');fs.writeFileSync(lock,'{"pid":123}');assert.throws(()=>store.create({type:'note',text:'Não gravar'}),/Registros em uso/);assert.equal(store.list().length,1);assert.equal(fs.readFileSync(lock,'utf8'),' {"pid":123}'.trim());
});
