const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { startServer_PY, stopServer } = require('./startServer.cjs');
const { setupSSHHandlers } = require('./ssh.cjs');
const { setupFileOperationsHandlers } = require('./fileOperations.cjs');

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }
}

function initApp() {
  // startServer_PY();
  createWindow();
}

app.whenReady().then(() => {
  initApp();
  setupSSHHandlers(ipcMain);
  setupFileOperationsHandlers(ipcMain);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  stopServer();
});