'use strict';
// Text models with a published free tier, checked 2026-10-08. No billing changes.
const allowed=new Set(['gemini-3.1-flash-lite','gemini-3.8-flash','gemini-3.5-flash-lite']);
function modelOptions(payload){
 const provider=(payload.providers||[]).find(row=>row.slug==='gemini');
 const ids=(provider?.models||[]).map(row=>typeof row==='string'?row:row.id||row.model||'');
 const current=typeof payload.model==='string'?payload.model:'';
 return {current,models:[...new Set(ids)].filter(id=>allowed.has(id)).map(id=>({id,label:id})),provider:'gemini'};
}
function modelCommand(id,options){
 if(typeof id!=='string'||!allowed.has(id)||!options.models.some(row=>row.id===id))throw Error('Modelo não disponível nesta conta. Atualize a lista.');
 return `${id} --provider gemini --session`;
}
module.exports={modelOptions,modelCommand};
