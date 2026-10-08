const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('jarvis', Object.freeze({
  calendar: options => ipcRenderer.invoke('jarvis:calendar',options),
  connect: () => ipcRenderer.invoke('jarvis:connect'),
  fullInterface: () => ipcRenderer.invoke('jarvis:full-interface'),
  models: () => ipcRenderer.invoke('jarvis:models'),
  capabilities: () => ipcRenderer.invoke('jarvis:capabilities'),
  control: action => ipcRenderer.invoke('jarvis:control',action),
  selectModel: id => ipcRenderer.invoke('jarvis:model-select',id),
  send: text => ipcRenderer.invoke('jarvis:send', text),
  interrupt: () => ipcRenderer.invoke('jarvis:interrupt'),
  resources: () => ipcRenderer.invoke('jarvis:resources'),
  voiceStatus: () => ipcRenderer.invoke('jarvis:voice-status'),
  record: action => ipcRenderer.invoke('jarvis:record', action),
  speak: text => ipcRenderer.invoke('jarvis:speak', text),
  transcribe: dataUrl => ipcRenderer.invoke('jarvis:transcribe', dataUrl),
  answer: (id,answer) => ipcRenderer.invoke('jarvis:answer', id, answer),
  tasks: (action,payload) => ipcRenderer.invoke('jarvis:tasks', action, payload),
  onEvent: callback => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('jarvis:event', listener);
    return () => ipcRenderer.removeListener('jarvis:event', listener);
  }
}));
