window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sshConnect: (config) => ipcRenderer.send('ssh-connect', config),
  onSshOutput: (callback) => ipcRenderer.on('ssh-output', callback),
  onSshStatus: (callback) => ipcRenderer.on('ssh-status', callback),
  sshCommand: (command) => ipcRenderer.send('ssh-command', command),
  sshDisconnect: () => ipcRenderer.send('ssh-disconnect'),
  removeSshOutputListener: (callback) => ipcRenderer.removeListener('ssh-output', callback),
  removeSshStatusListener: (callback) => ipcRenderer.removeListener('ssh-status', callback)
});