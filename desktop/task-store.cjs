const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
function createTaskStore(workspace){
 const directory=path.join(workspace,'.jarvis');const file=path.join(directory,'tasks.json');
 function guard(){for(const target of [directory,file])if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())throw new Error('Arquivo de tarefas não pode ser um link.');}
 function read(){
  guard();if(!fs.existsSync(file))return {version:1,items:[]};
  if(fs.statSync(file).size>1024*1024)throw new Error('Arquivo de tarefas excede 1 MB.');
  let data;try{data=JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Arquivo de tarefas inválido. Foi preservado para recuperação.');}
  if(data.version!==1||!Array.isArray(data.items)||data.items.length>1000)throw new Error('Formato de tarefas não reconhecido.');
  const ids=new Set();
  for(const item of data.items){
   if(typeof item.id!=='string'||!item.id||ids.has(item.id)||!['task','note','reminder'].includes(item.type)||typeof item.text!=='string'||!item.text.trim()||item.text.length>4000||typeof item.done!=='boolean')throw new Error('Uma tarefa possui formato inválido.');
   if(item.type==='reminder'&&(!item.due_at||!Number.isFinite(Date.parse(item.due_at))))throw new Error('Lembrete sem data válida.');ids.add(item.id);
  }
  return data;
 }
 function write(data){
  guard();fs.mkdirSync(directory,{recursive:true});
  const temporary=path.join(directory,`tasks-${crypto.randomUUID()}.tmp`);
  fs.writeFileSync(temporary,JSON.stringify(data,null,2),{flag:'wx'});
  try{fs.renameSync(temporary,file);}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
  return data.items;
 }
 return {
  list:()=>read().items,
  create(payload){
   const {type,text,due_at}=payload||{};
   if(!['task','note','reminder'].includes(type)||typeof text!=='string'||!text.trim()||text.length>4000)throw new Error('Preencha um texto válido de até 4000 caracteres.');
   if(type==='reminder'&&(!due_at||!Number.isFinite(Date.parse(due_at))))throw new Error('Escolha a data e hora do lembrete.');
   const data=read();if(data.items.length>=1000)throw new Error('Limite local de 1000 registros atingido.');
   data.items.push({id:crypto.randomUUID(),type,text:text.trim(),created_at:new Date().toISOString(),due_at:type==='reminder'?new Date(due_at).toISOString():null,done:false,notified_at:null});return write(data);
  },
  complete(id,done){if(typeof id!=='string'||typeof done!=='boolean')throw new Error('Mudança inválida.');const data=read();const item=data.items.find(row=>row.id===id);if(!item)throw new Error('Registro não encontrado.');item.done=done;return write(data);},
  due(now=Date.now()){return read().items.filter(item=>item.type==='reminder'&&!item.done&&Date.parse(item.due_at)<=now);},
  markNotified(id){const data=read();const item=data.items.find(row=>row.id===id);if(item)item.notified_at=new Date().toISOString();return write(data);}
 };
}
module.exports={createTaskStore};
