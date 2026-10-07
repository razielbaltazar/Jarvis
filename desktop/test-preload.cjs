const {contextBridge,ipcRenderer}=require('electron');
const records=[],sends=[];
contextBridge.exposeInMainWorld('jarvis',{
 connect:async()=>({model:'test local',messages:[]}),voiceStatus:async()=>({available:true,enabled:false}),tasks:async()=>[],
 resources:async()=>({memory:{free:4,total:8}}),record:async action=>{records.push(action);return {status:'recording'};},
 send:async text=>{sends.push(text);},interrupt:async()=>{},speak:async()=>({dataUrl:'data:audio/wav;base64,dGVzdA=='}),answer:async()=>{},
 onEvent:callback=>ipcRenderer.on('jarvis:test-event',(_event,data)=>callback(data)),
 testState:()=>({records:records.slice(),sends:sends.slice()})
});
