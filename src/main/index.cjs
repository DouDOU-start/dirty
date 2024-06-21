const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { startServer_PY, stopServer, startServer_EXE } = require('./startServer.cjs');
const { setupSSHHandlers } = require('./ssh.cjs');
const { setupFileOperationsHandlers } = require('./fileOperations.cjs');
const log = require('electron-log');

// 配置日志文件路径
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/main.log');

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

let mainWindow;
let loadingWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
    show: false, // 在准备好之前不显示
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    loadingWindow.close();
    mainWindow.show();
  });
}

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  loadingWindow.loadFile(path.join(__dirname, '../../dist/loading.html'));
  loadingWindow.show();
}

async function initApp() {
  createLoadingWindow();
  if (process.env.NODE_ENV === 'development') {
    startServer_PY();
  } else {
    try {
      await startServer_EXE();
    } catch (error) {
      log.error('Failed to start server:', error);
      app.quit();
    }
  }
  createWindow();
}

app.whenReady().then(() => {
  log.info('App is ready');
  try {
    initApp();
    setupSSHHandlers(ipcMain);
    setupFileOperationsHandlers(ipcMain);
    log.info('Server started');
  } catch (error) {
    log.error('Failed to start server:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

app.on('quit', () => {
  stopServer();
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('exit', () => {
  stopServer();
});