// preload.mjs
import { contextBridge, ipcRenderer } from 'electron'

// Expose a safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  exitApp: () => ipcRenderer.send('exit-app'),
  // logout returns a promise (ipcRenderer.invoke => ipcMain.handle)
  logout: () => ipcRenderer.invoke('logout'),
  // callback registration for logout-done confirmation
  onLogoutDone: (cb) => {
    ipcRenderer.on('logout-done', (event, payload) => cb(payload))
  },
  // optional: receive messages from main
  onMainMessage: (cb) => {
    ipcRenderer.on('main-process-message', (event, msg) => cb(msg))
  }
})
