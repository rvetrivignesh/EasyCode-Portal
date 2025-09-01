import { ipcMain, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
function createWindow() {
  const preloadPath = path.join(__dirname, "preload.mjs");
  console.log("[main] preload path ->", preloadPath);
  win = new BrowserWindow({
    // fullscreen: true,
    // kiosk: true,
    // frame: false,
    // alwaysOnTop: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
      // devTools: false, // keep false for production; enable for debug (see below)
    }
  });
  if (process.env.DEBUG_ELECTRON === "true") {
    win.webContents.openDevTools({ mode: "detach" });
    console.log("[main] open devtools for debugging");
  }
  win.webContents.on("did-finish-load", () => {
    console.log("[main] did-finish-load");
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("will-navigate", (event) => {
    console.log("[main] prevented navigation to:", event.url ?? "unknown");
    event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    console.log("[main] blocked window.open to:", url);
    return { action: "deny" };
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
ipcMain.on("exit-app", () => {
  console.log("[main] exit-app received — quitting app");
  app.quit();
});
ipcMain.handle("logout", async (event) => {
  console.log("[main] logout invoked from renderer");
  event.sender.send("logout-done", { success: true });
  return { success: true };
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
