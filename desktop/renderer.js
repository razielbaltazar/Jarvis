'use strict';
const $=id=>document.getElementById(id);
let ready=false, busy=false, started=0, activeMessage=null, recording=false, micPending=false, transcribing=false, voiceAvailable=false, lastResponse='', playback=null, speechGeneration=0, synthesizing=false;
let voiceMode=false, voiceEpoch=0;
const decisions=new Map();
const labels={connecting:'CONECTANDO',ready:'PRONTO',processing:'PROCESSANDO',executing:'EXECUTANDO',waiting:'AGUARDANDO SUA RESPOSTA',listening:'OUVINDO',transcribing:'TRANSCREVENDO',speaking:'FALANDO',error:'CONEXÃO INDISPONÍVEL'};
function state(value){if(decisions.size&&value!=='error')value='waiting';document.body.dataset.state=value;$('status').textContent=labels[value];$('input').disabled=!ready||busy||recording||transcribing||micPending||!!decisions.size;$('send').disabled=$('input').disabled;$('stop').hidden=!busy&&!decisions.size;$('mic').disabled=!ready||(!voiceMode&&(busy||transcribing||micPending||!voiceAvailable||!!decisions.size));$('mic').setAttribute('aria-pressed',String(voiceMode));$('mic').textContent=voiceMode?'■':'◉';$('mic').setAttribute('aria-label',voiceMode?'Encerrar conversa por voz':'Iniciar conversa por voz');$('listen').hidden=!lastResponse;$('listen').disabled=busy||recording||transcribing||micPending||!!decisions.size;$('listen').textContent=playback||synthesizing?'Parar áudio':'Ouvir resposta';}
function renderDecision(){
 const item=decisions.values().next().value;$('decision').hidden=!item;$('decision-content').replaceChildren();if(!item)return;
 const container=$('decision-content');const add=(tag,text)=>{const element=document.createElement(tag);element.textContent=text;container.append(element);return element;};
 const respond=async answer=>{container.querySelectorAll('button').forEach(button=>button.disabled=true);try{await window.jarvis.answer(item.id,answer);decisions.delete(item.id);renderDecision();state(busy?'processing':'ready');}catch(error){log(error.message);container.querySelectorAll('button').forEach(button=>button.disabled=false);}};
 if(item.method==='approval'){
  add('p',item.params.description||'O Hermes pediu autorização para esta ação.');add('pre',item.params.command||item.params.tool_name||'Ação solicitada');
  for(const [choice,label] of [['once','Permitir uma vez'],['deny','Recusar']])if((item.params.choices||['once','deny']).includes(choice)){const button=add('button',label);button.addEventListener('click',()=>respond({choice}));}
 }else{
  const answers={};for(const question of item.params.questions||[]){add('p',question.question);const input=document.createElement('input');input.maxLength=2000;input.setAttribute('aria-label',question.question);container.append(input);answers[question.qid]=input;
   if(question.choices?.length)add('small',question.choices.join(' · '));}
  const button=add('button','Responder');button.addEventListener('click',()=>respond({answers:Object.fromEntries(Object.entries(answers).map(([id,input])=>[id,input.value||null]))}));
 }
}
function stopAudio(){speechGeneration++;synthesizing=false;if(playback){playback.pause();playback.src='';playback=null;}}
async function speak(text){
 stopAudio();const generation=speechGeneration;synthesizing=true;state('processing');
 try{const audio=await window.jarvis.speak(text);if(generation!==speechGeneration)return;synthesizing=false;playback=new Audio(audio.dataUrl);
  playback.addEventListener('play',()=>{if(generation===speechGeneration)state('speaking');});
  playback.addEventListener('ended',()=>{if(generation===speechGeneration){playback=null;state('ready');if(voiceMode)beginListening();}});
  playback.addEventListener('error',()=>{if(generation===speechGeneration){playback=null;state('ready');endVoice();log('Não foi possível reproduzir o áudio.');}});
  await playback.play();
 }catch(error){if(generation!==speechGeneration)return;endVoice();state('ready');log('Voz: '+error.message);}
}
function panel(id,show){if(show&&id==='tasks')panel('conversation',false);if(show&&id==='conversation')panel('tasks',false);$(id).hidden=!show;const toggle=$(id==='conversation'?'chat-toggle':id+'-toggle');toggle?.setAttribute('aria-expanded',String(show));if(id==='conversation')$('orb').setAttribute('aria-expanded',String(show));}
for(const [button,id] of [['system-toggle','system'],['activity-toggle','activity'],['chat-toggle','conversation'],['orb','conversation'],['tasks-toggle','tasks']]) $(button).addEventListener('click',()=>{panel(id,$(id).hidden);if(id==='system'&&!$(id).hidden) resources();if(id==='tasks'&&!$(id).hidden)refreshTasks();});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>panel(button.dataset.close,false)));
let idle;
function interaction(){clearTimeout(idle);idle=setTimeout(()=>{for(const id of ['system','activity'])if(!$(id).contains(document.activeElement))panel(id,false);},20000);}
document.addEventListener('pointerdown',interaction);document.addEventListener('keydown',event=>{interaction();if(event.key==='Escape'){for(const id of ['system','activity'])panel(id,false);}});
function message(role,text){const row=document.createElement('div');row.className='message '+role;const author=document.createElement('b');author.textContent=role==='user'?'VOCÊ':'JARVIS';const content=document.createElement('span');content.textContent=text;row.append(author,content);$('messages').append(row);while($('messages').children.length>80)$('messages').firstChild.remove();$('messages').scrollTop=$('messages').scrollHeight;return content;}
function log(text){if($('logs').children.length===1&&$('logs').firstChild.textContent==='Nenhuma tarefa iniciada.')$('logs').replaceChildren();const item=document.createElement('li');item.textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · '+text;$('logs').prepend(item);while($('logs').children.length>30)$('logs').lastChild.remove();}
function fail(error){endVoice();stopAudio();decisions.clear();renderDecision();ready=false;busy=false;recording=false;transcribing=false;state('error');$('reconnect').hidden=false;$('hint').textContent='Não foi possível conectar. Use Reconectar para tentar novamente.';log(error.message||String(error));}
async function connect(){state('connecting');$('reconnect').hidden=true;try{const result=await window.jarvis.connect();$('messages').replaceChildren();for(const row of result.messages||[]){message(row.role==='user'?'user':'assistant',row.text);if(row.role==='assistant')lastResponse=row.text;}ready=true;state('ready');$('model').textContent=result.model||'Qwen3.5 · 2B local';$('hint').textContent='Seu espaço para pensar e construir.';try{const voice=await window.jarvis.voiceStatus();voiceAvailable=!!voice.available;$('voice-info').textContent=voiceAvailable?'Voz local em português · microfone desligado':'Voz indisponível: '+(voice.details||'confira a configuração');state(busy?'processing':'ready');}catch{$('voice-info').textContent='Não foi possível verificar a voz.';}}catch(error){fail(error);}}
async function resources(){try{const info=await window.jarvis.resources();$('resources').textContent='RAM livre: '+info.memory.free+' / '+info.memory.total+' GB'+(info.gpu?'\nGPU: '+info.gpu+' MB (uso / total)':'\nGPU: leitura indisponível');}catch{$('resources').textContent='Recursos indisponíveis.';}}
$('form').addEventListener('submit',async event=>{event.preventDefault();const text=$('input').value.trim();if(!text||busy||!ready||recording||transcribing)return;if(/^((ative|ativar|ligue|habilite|inicie)( o)? modo( de)? voz|ligar( o)? modo( de)? voz|quero (falar|conversar) por voz|vamos (falar|conversar) por voz)[.!?]*$/i.test(text)){$('input').value='';await toggleVoice();return;}stopAudio();busy=true;started=performance.now();message('user',text);activeMessage=null;panel('conversation',true);$('input').value='';state('processing');log('Pedido enviado');try{await window.jarvis.send(text);}catch(error){busy=false;state('ready');message('assistant','O pedido não foi confirmado: '+error.message);log('Falha ao enviar. Não reenviado automaticamente.');}});
$('stop').addEventListener('click',async()=>{stopAudio();try{await window.jarvis.interrupt();log('Interrupção solicitada');}catch(error){log(error.message);}});
$('listen').addEventListener('click',()=>{if(playback||synthesizing){stopAudio();state('ready');}else speak(lastResponse);});
async function endVoice(){voiceMode=false;voiceEpoch++;recording=false;transcribing=false;micPending=false;stopAudio();try{await window.jarvis.record('cancel');}catch{}state(busy?'processing':'ready');}
async function beginListening(){
 if(!voiceMode||busy||playback||synthesizing||decisions.size)return;
 const epoch=voiceEpoch;micPending=true;state('processing');
 try{await window.jarvis.record('start');if(!voiceMode||epoch!==voiceEpoch){await window.jarvis.record('cancel');return;}recording=true;state('listening');}
 catch(error){endVoice();log('Microfone: '+error.message);}
 finally{if(epoch===voiceEpoch){micPending=false;state(recording?'listening':busy?'processing':'ready');}}
}
async function toggleVoice(){
 if(voiceMode){await endVoice();log('Conversa por voz encerrada.');return;}
 if(!voiceAvailable){log('Voz local indisponível.');return;}
 voiceMode=true;voiceEpoch++;log('Conversa por voz ativada. Fale e faça uma pausa; clique novamente para encerrar.');await beginListening();
}
$('mic').addEventListener('click',toggleVoice);
$('reconnect').addEventListener('click',connect);
async function refreshTasks(){
 try{
  const items=await window.jarvis.tasks('list');$('task-error').textContent='';$('task-items').replaceChildren();
  for(const item of items.slice().reverse()){
   const row=document.createElement('div');row.className='task-item'+(item.done?' done':'');const text=document.createElement('span');text.textContent=item.text;
   const details=document.createElement('small');details.textContent=({task:'Tarefa',note:'Nota',reminder:'Lembrete'})[item.type]+(item.due_at?' · '+new Date(item.due_at).toLocaleString('pt-BR'):'');
   const button=document.createElement('button');button.textContent=item.done?'Reabrir':item.type==='note'?'Arquivar':'Concluir';button.addEventListener('click',async()=>{try{await window.jarvis.tasks('complete',{id:item.id,done:!item.done});refreshTasks();}catch(error){$('task-error').textContent=error.message;}});row.append(details,text,button);$('task-items').append(row);
  }
  if(!items.length)$('task-items').textContent='Seus registros aparecerão aqui.';
 }catch(error){$('task-error').textContent=error.message;}
}
$('task-type').addEventListener('change',()=>{$('task-due').hidden=$('task-type').value!=='reminder';});
$('task-form').addEventListener('submit',async event=>{
 event.preventDefault();try{
  const type=$('task-type').value;const due=$('task-due').value;
  if(type==='reminder'&&!due)throw new Error('Escolha a data e a hora.');
  await window.jarvis.tasks('create',{type,text:$('task-text').value,due_at:type==='reminder'?new Date(due).toISOString():null});
  $('task-text').value='';await refreshTasks();log('Registro salvo localmente.');
 }catch(error){$('task-error').textContent=error.message;}
});
$('task-notifications').addEventListener('change',async()=>{try{await window.jarvis.tasks('notifications',{enabled:$('task-notifications').checked});}catch(error){$('task-notifications').checked=false;log(error.message);}});
window.jarvis.onEvent(event=>{
 const payload=event.payload||{};
 if(event.type==='connection.error'){fail(new Error(event.text));return;}
 if(event.type==='session.notice')log(event.text);
 if(event.type==='tasks.due')$('tasks-toggle').textContent=payload.count?'Tarefas · '+payload.count+' pendente(s)':'Tarefas';
 if(event.type==='user.request'){stopAudio();decisions.set(payload.id,payload);renderDecision();state('waiting');log('Pedido de resposta pendente.');}
 if(event.type==='request.cancel'){decisions.delete(String(payload.id));renderDecision();state(busy?'processing':'ready');}
 if(event.type==='voice.status'&&['transcribing','processing'].includes(payload.state)){recording=false;transcribing=true;state('transcribing');}
 if(event.type==='voice.transcript'){
  recording=false;transcribing=false;state('ready');
  if(payload.text&&!payload.stop_phrase){$('input').value=payload.text;$('input').focus();if(voiceMode)$('form').requestSubmit();else log('Transcrição disponível para revisar e enviar.');}
  else{endVoice();log('Conversa por voz encerrada: silêncio ou pedido de parada.');}
 }
 if(event.type==='voice.timeout'){endVoice();recording=false;transcribing=false;state('ready');log(event.text);}
 if(event.type==='tool.start'){state('executing');log('Executando '+(payload.name||'ferramenta'));}
 if(event.type==='tool.complete'){state('processing');log('Concluído: '+(payload.name||'ferramenta'));}
 if(event.type==='error'){endVoice();busy=false;state('ready');message('assistant',payload.message||'A tarefa falhou.');log('Falha na tarefa');}
 if(event.type==='message.delta' && typeof payload.text==='string'){if(!activeMessage)activeMessage=message('assistant','');activeMessage.textContent+=payload.text;$('messages').scrollTop=$('messages').scrollHeight;}
 if(event.type==='message.interim'){if(!payload.already_streamed&&payload.text)message('assistant',payload.text);activeMessage=null;}
 if(event.type==='message.complete'){
  if(typeof payload.text==='string'&&payload.text){if(!activeMessage)activeMessage=message('assistant',payload.text);else activeMessage.textContent=payload.text;}
  if(payload.error)message('assistant',String(payload.error));
  if(typeof payload.text==='string'&&payload.text)lastResponse=payload.text;
  busy=false;state('ready');$('latency').textContent=((performance.now()-started)/1000).toFixed(1)+' s';log(payload.status==='error'?'Tarefa terminou com erro':payload.status==='interrupted'?'Tarefa interrompida':'Resposta disponível');activeMessage=null;
  if((voiceMode||$('auto-speak').checked)&&payload.status!=='error'&&payload.status!=='interrupted'&&lastResponse)speak(lastResponse.slice(0,4000));
  else if(voiceMode){if(payload.status==='error'||payload.status==='interrupted')endVoice();else beginListening();}
  if(!$('tasks').hidden)refreshTasks();
 }
});
connect();
