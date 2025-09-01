"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  exitApp: () => electron.ipcRenderer.send("exit-app"),
  // logout returns a promise (ipcRenderer.invoke => ipcMain.handle)
  logout: () => electron.ipcRenderer.invoke("logout"),
  // callback registration for logout-done confirmation
  onLogoutDone: (cb) => {
    electron.ipcRenderer.on("logout-done", (event, payload) => cb(payload));
  },
  // optional: receive messages from main
  onMainMessage: (cb) => {
    electron.ipcRenderer.on("main-process-message", (event, msg) => cb(msg));
  }
});
