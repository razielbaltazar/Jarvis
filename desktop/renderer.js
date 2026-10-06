'use strict';
const $=id=>document.getElementById(id);
let ready=false, busy=false, started=0, activeMessage=null;
const labels={connecting:'CONECTANDO',ready:'PRONTO',processing:'PROCESSANDO',executing:'EXECUTANDO',error:'CONEXÃO INDISPONÍVEL'};
function state(value){document.body.dataset.state=value;$('status').textContent=labels[value];$('input').disabled=!ready||busy;$('send').disabled=!ready||busy;$('stop').hidden=!busy;}
function panel(id,show){$(id).hidden=!show;const toggle=$(id==='conversation'?'chat-toggle':id+'-toggle');toggle?.setAttribute('aria-expanded',String(show));if(id==='conversation')$('orb').setAttribute('aria-expanded',String(show));}
for(const [button,id] of [['system-toggle','system'],['activity-toggle','activity'],['chat-toggle','conversation'],['orb','conversation']]) $(button).addEventListener('click',()=>{panel(id,$(id).hidden);if(id==='system'&&!$(id).hidden) resources();});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>panel(button.dataset.close,false)));
let idle;
function interaction(){clearTimeout(idle);idle=setTimeout(()=>{for(const id of ['system','activity'])if(!$(id).contains(document.activeElement))panel(id,false);},20000);}
document.addEventListener('pointerdown',interaction);document.addEventListener('keydown',event=>{interaction();if(event.key==='Escape'){for(const id of ['system','activity'])panel(id,false);}});
function message(role,text){const row=document.createElement('div');row.className='message '+role;const author=document.createElement('b');author.textContent=role==='user'?'VOCÊ':'JARVIS';const content=document.createElement('span');content.textContent=text;row.append(author,content);$('messages').append(row);while($('messages').children.length>80)$('messages').firstChild.remove();$('messages').scrollTop=$('messages').scrollHeight;return content;}
function log(text){if($('logs').children.length===1&&$('logs').firstChild.textContent==='Nenhuma tarefa iniciada.')$('logs').replaceChildren();const item=document.createElement('li');item.textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · '+text;$('logs').prepend(item);while($('logs').children.length>30)$('logs').lastChild.remove();}
function fail(error){ready=false;busy=false;state('error');$('reconnect').hidden=false;$('hint').textContent=error.message||String(error);log('Conexão indisponível');}
async function connect(){state('connecting');$('reconnect').hidden=true;try{const result=await window.jarvis.connect();$('messages').replaceChildren();for(const row of result.messages||[])message(row.role==='user'?'user':'assistant',row.text);ready=true;state('ready');$('model').textContent=result.model||'Qwen3.5 · 2B local';$('hint').textContent='Seu espaço para pensar e construir.';}catch(error){fail(error);}}
async function resources(){try{const info=await window.jarvis.resources();$('resources').textContent='RAM livre: '+info.memory.free+' / '+info.memory.total+' GB'+(info.gpu?'\nGPU: '+info.gpu+' MB (uso / total)':'\nGPU: leitura indisponível');}catch{$('resources').textContent='Recursos indisponíveis.';}}
$('form').addEventListener('submit',async event=>{event.preventDefault();const text=$('input').value.trim();if(!text||busy||!ready)return;busy=true;started=performance.now();message('user',text);activeMessage=null;panel('conversation',true);$('input').value='';state('processing');log('Pedido enviado');try{await window.jarvis.send(text);}catch(error){busy=false;state('ready');message('assistant','O pedido não foi confirmado: '+error.message);log('Falha ao enviar. Não reenviado automaticamente.');}});
$('stop').addEventListener('click',async()=>{try{await window.jarvis.interrupt();log('Interrupção solicitada');}catch(error){log(error.message);}});
$('reconnect').addEventListener('click',connect);
window.jarvis.onEvent(event=>{
 const payload=event.payload||{};
 if(event.type==='connection.error'){fail(new Error(event.text));return;}
 if(event.type==='session.notice')log(event.text);
 if(event.type==='tool.start'){state('executing');log('Executando '+(payload.name||'ferramenta'));}
 if(event.type==='tool.complete'){state('processing');log('Concluído: '+(payload.name||'ferramenta'));}
 if(event.type==='error'){busy=false;state('ready');message('assistant',payload.message||'A tarefa falhou.');log('Falha na tarefa');}
 if(event.type==='message.delta' && typeof payload.text==='string'){if(!activeMessage)activeMessage=message('assistant','');activeMessage.textContent+=payload.text;$('messages').scrollTop=$('messages').scrollHeight;}
 if(event.type==='message.interim'){if(!payload.already_streamed&&payload.text)message('assistant',payload.text);activeMessage=null;}
 if(event.type==='message.complete'){
  if(typeof payload.text==='string'&&payload.text){if(!activeMessage)activeMessage=message('assistant',payload.text);else activeMessage.textContent=payload.text;}
  if(payload.error)message('assistant',String(payload.error));
  busy=false;state('ready');$('latency').textContent=((performance.now()-started)/1000).toFixed(1)+' s';log(payload.status==='error'?'Tarefa terminou com erro':payload.status==='interrupted'?'Tarefa interrompida':'Resposta disponível');activeMessage=null;
 }
});
connect();
