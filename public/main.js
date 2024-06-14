const { app, BrowserWindow } = require('electron')
// 在你文件顶部导入 Node.js 的 path 模块
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 在后续步骤中创建
      contextIsolation: true,
      enableRemoteModule: false,
    },
  })
  win.loadFile(path.join(__dirname, '../my-app/build/index.html'));
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