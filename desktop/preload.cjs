const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('jarvis', Object.freeze({
  calendar: () => ipcRenderer.invoke('jarvis:calendar'),
  connect: () => ipcRenderer.invoke('jarvis:connect'),
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
