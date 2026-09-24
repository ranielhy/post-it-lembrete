const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('postIt', {
  list: () => ipcRenderer.invoke('notes:list'),
  get: (id) => ipcRenderer.invoke('notes:get', id),
  add: (color) => ipcRenderer.invoke('notes:add', color),
  open: (id) => ipcRenderer.invoke('notes:open', id),
  update: (id, changes) => ipcRenderer.invoke('notes:update', id, changes),
  remove: (id) => ipcRenderer.invoke('notes:delete', id),
  closeNote: () => ipcRenderer.invoke('window:close-note'),
  quit: () => ipcRenderer.invoke('app:quit'),
  onChanged: (callback) => ipcRenderer.on('notes:changed', (_event, notes) => callback(notes))
});
