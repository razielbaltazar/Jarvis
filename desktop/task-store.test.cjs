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
