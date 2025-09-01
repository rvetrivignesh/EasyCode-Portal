// main.ts (or main.mjs) - full main process file
import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// Vite / build layout
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.mjs')
  console.log('[main] preload path ->', preloadPath)

  win = new BrowserWindow({
    // fullscreen: true,
    // kiosk: true,
    // frame: false,
    // alwaysOnTop: true,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      // devTools: false, // keep false for production; enable for debug (see below)
    },
  })

  // Debug helper: enable dev tools if DEBUG_ELECTRON env var is 'true'
  if (process.env.DEBUG_ELECTRON === 'true') {
    win.webContents.openDevTools({ mode: 'detach' })
    console.log('[main] open devtools for debugging')
  }

  win.webContents.on('did-finish-load', () => {
    console.log('[main] did-finish-load')
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Prevent navigation
  win.webContents.on('will-navigate', (event) => {
    console.log('[main] prevented navigation to:', (event as any).url ?? 'unknown')
    event.preventDefault()
  })

  // Block window.open
  win.webContents.setWindowOpenHandler(({ url }) => {
    console.log('[main] blocked window.open to:', url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

/* ---------------- IPC handlers ---------------- */

ipcMain.on('exit-app', () => {
  console.log('[main] exit-app received — quitting app')
  // any main-process cleanup can be done here
  app.quit()
})

ipcMain.handle('logout', async (event) => {
  console.log('[main] logout invoked from renderer')
  // main-process cleanup (if required) — e.g. clear files, close DB, etc.
  // send confirmation back to renderer
  event.sender.send('logout-done', { success: true })
  return { success: true }
})

/* ---------------- app lifecycle ---------------- */

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.whenReady().then(createWindow)
