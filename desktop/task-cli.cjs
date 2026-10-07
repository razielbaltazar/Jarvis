// Narrow bridge for the Hermes tool: payload is JSON on stdin, never a shell command.
const fs=require('node:fs');const {createTaskStore}=require('./task-store.cjs');
try{
 const input=fs.readFileSync(0,'utf8');if(input.length>20000)throw new Error('Pedido muito grande.');
 const payload=JSON.parse(input);const store=createTaskStore(process.argv[2]);let result;
 if(payload.action==='list'){const items=store.list();result={success:true,total:items.length,items:items.slice(-30).map(item=>({...item,text:item.text.slice(0,500)}))};}
 else if(payload.action==='create'){const items=store.create(payload);result={success:true,saved:true,total:items.length,record:items.at(-1)};}
 else if(payload.action==='complete'){const items=store.complete(payload.id,payload.done);result={success:true,saved:true,record:items.find(item=>item.id===payload.id)};}
 else throw new Error('Ação inválida.');
 console.log(JSON.stringify(result));
}catch(error){console.log(JSON.stringify({success:false,error:error.message}));process.exitCode=1;}
