const {contextBridge,ipcRenderer}=require('electron');
const records=[],sends=[];
let pendingStart;
let sendFailure=false;
contextBridge.exposeInMainWorld('jarvis',{
 calendar:async()=>({connected:true,live_sync:true,checked_at:'2026-10-07T00:00:00Z',warnings:[],events:[{title:'<img src=x> Evento de teste',start:'2099-01-01',end:'2099-01-02',all_day:true}]}),
 connect:async()=>({model:'test local',messages:[]}),voiceStatus:async()=>({available:true,enabled:false}),tasks:async()=>[],
 resources:async()=>({memory:{free:4,total:8}}),record:async action=>{records.push(action);if(action==='start'&&pendingStart==='defer')return new Promise(resolve=>{pendingStart=resolve;});return {status:'recording'};},
 send:async text=>{sends.push(text);if(sendFailure){sendFailure=false;throw Error('Test send failure');}},interrupt:async()=>{},speak:async()=>({dataUrl:'data:audio/wav;base64,dGVzdA=='}),answer:async()=>{},
 onEvent:callback=>ipcRenderer.on('jarvis:test-event',(_event,data)=>callback(data)),
 testState:()=>({records:records.slice(),sends:sends.slice()}),
 deferStart:()=>{pendingStart='defer';},
 failNextSend:()=>{sendFailure=true;},
 resolveStart:()=>{if(typeof pendingStart==='function'){const resolve=pendingStart;pendingStart=null;resolve({status:'recording'});}}
});
