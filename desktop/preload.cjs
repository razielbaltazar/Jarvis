const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('jarvis', Object.freeze({
  connect: () => ipcRenderer.invoke('jarvis:connect'),
  send: text => ipcRenderer.invoke('jarvis:send', text),
  interrupt: () => ipcRenderer.invoke('jarvis:interrupt'),
  resources: () => ipcRenderer.invoke('jarvis:resources'),
  onEvent: callback => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('jarvis:event', listener);
    return () => ipcRenderer.removeListener('jarvis:event', listener);
  }
}));
