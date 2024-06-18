const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs');
// 在你文件顶部导入 Node.js 的 path 模块
const path = require('node:path')
const { Client } = require('ssh2');
// 导入安装 DevTools 的函数
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

async function createWindow() {
  const isDev = (await import('electron-is-dev')).default;

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 在后续步骤中创建
      contextIsolation: true,
      nodeIntegration: false, // 确保禁用 nodeIntegration 以增加安全性
      enableRemoteModule: false,
      // 禁用eval功能
      sandbox: true,
    },
  })

  // win.loadFile(path.join(__dirname, '../my-app/build/index.html'));
  win.loadURL(
    isDev
      ? 'http://localhost:9089'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();

    // 安装 React DevTools
    try {
      await installExtension(REACT_DEVELOPER_TOOLS);
      console.log('React DevTools installed');
    } catch (err) {
      console.log('Unable to install React DevTools:', err);
    }
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

let conn;

ipcMain.on('ssh-connect', (event, { host, port, username, password }) => {
  if (conn) {
    conn.end();
  }

  conn = new Client();
  conn.on('ready', () => {
    event.reply('ssh-status', 'connected');
    conn.shell((err, stream) => {
      if (err) {
        event.reply('ssh-output', `Error: ${err.message}`);
        return;
      }
      currentStream = stream;
      stream.on('close', () => {
        conn.end();
        event.reply('ssh-status', 'Disconnected');
      }).on('data', (data) => {
        event.reply('ssh-output', data.toString());
      }).stderr.on('data', (data) => {
        event.reply('ssh-output', data.toString());
      });
    });
  }).on('error', (err) => {
    event.reply('ssh-status', `Error: ${err.message}`);
  }).connect({
    host,
    port,
    username,
    password
  });
});

ipcMain.on('ssh-command', (event, command) => {
  if (currentStream) {
    currentStream.write(command);
  } else {
    event.reply('ssh-output', 'Error: Not connected');
  }
});

ipcMain.on('ssh-disconnect', (event) => {
  if (conn) {
    conn.end();
    event.reply('ssh-status', 'Disconnected');
  } else {
    event.reply('ssh-status', 'Error: Not connected');
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle('read-file', async (event, filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return data;
});