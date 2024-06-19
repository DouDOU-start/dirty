const fs = require('fs');
const path = require('node:path');
const { PythonShell } = require('python-shell');
const { dialog } = require('electron')

function setupFileOperationsHandlers(ipcMain) {
  ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  });

  ipcMain.handle('showOpenDialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }],
    });
    return result.filePaths[0];
  });

  ipcMain.handle('processExcel', async (event, filePath) => {
    return new Promise((resolve, reject) => {
      let options = {
        mode: 'json',
        pythonPath: '/Users/allen/anaconda3/bin/python',
        pythonOptions: ['-u'],
        scriptPath: path.join(__dirname, 'python'),
        args: [filePath],
      };

      PythonShell.run('process_excel.py', options, (err, results) => {
        console.log('Python script error:', err);
        console.log('Python script results:', results);
        if (err) {
          console.error('Error executing Python script:', err);
          reject(err);
        } else if (results && results.length > 0) {
          console.log('Python script executed successfully, results:', results[0]);
          resolve(results[0]);
        } else {
          const error = new Error('No results returned from Python script');
          console.error(error);
          reject(error);
        }
      });
    });
  });
}

module.exports = { setupFileOperationsHandlers };