const { spawn, execFile } = require('child_process');
const path = require('node:path');
const log = require('electron-log');
const http = require('http');

function startServer_PY() {
  const pythonProcess = spawn('venv/bin/python', ['py/flask_app.py']);

  pythonProcess.stdout.on('data', (data) => {
    log.info(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    log.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    log.info(`child process exited with code ${code}`);
  });

  process.on('exit', () => {
    pythonProcess.kill();
  });

  process.on('SIGINT', () => {
    pythonProcess.kill();
    process.exit();
  });

  process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err);
    pythonProcess.kill();
    process.exit(1);
  });
}

let pyProc = null;

function startServer_EXE() {
  return new Promise((resolve, reject) => {
    let script;
    if (process.platform === 'win32') {
      script = path.join(__dirname, '../..', 'py', 'dist', 'flask_app.exe');
    } else {
      script = path.join(__dirname, '../..', 'py', 'dist', 'flask_app');
    }

    const env = Object.assign({}, process.env);

    pyProc = execFile(script, { env }, (error, stdout, stderr) => {
      if (error) {
        log.error(`Error: ${error.message}`);
        reject(error);
      }
      if (stderr) {
        log.error(`stderr: ${stderr}`);
      }
      if (stdout) {
        log.info(`stdout: ${stdout}`);
      }
    });

    if (pyProc != null) {
      log.info('Flask server start success');
    } else {
      log.info('Failed to start Flask server');
      reject(new Error('Failed to start Flask server'));
    }

    const checkServer = () => {
      http.get('http://localhost:5001', (res) => {
        if (res.statusCode === 200) {
          log.info('Flask server is running');
          resolve();
        } else {
          setTimeout(checkServer, 1000);
        }
      }).on('error', () => {
        setTimeout(checkServer, 1000);
      });
    };

    checkServer();

    process.on('exit', () => {
      if (pyProc) pyProc.kill();
    });

    process.on('SIGINT', () => {
      if (pyProc) pyProc.kill();
      process.exit();
    });

    process.on('uncaughtException', (err) => {
      log.error('Uncaught Exception:', err);
      if (pyProc) pyProc.kill();
      process.exit(1);
    });
  });
}

function stopServer() {
  if (pyProc != null) {
    pyProc.kill('SIGTERM');
    log.info('Flask server stopped');
  } else {
    log.info('No Flask server to stop');
  }
}

module.exports = { startServer_PY, startServer_EXE, stopServer };