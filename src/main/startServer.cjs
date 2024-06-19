const { spawn } = require('child_process');
const path = require('node:path');

function startServer_PY() {
  const pythonProcess = spawn('venv/bin/python', ['py/flask_app.py']);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  process.on('exit', () => {
    pythonProcess.kill();
  });

  process.on('SIGINT', () => {
    pythonProcess.kill();
    process.exit();
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    pythonProcess.kill();
    process.exit(1);
  });
}

function startServer_EXE() {
  let script = path.join(__dirname, 'pydist', 'app', 'app.exe');
  pyProc = require('child_process').execFile(script);
  if (pyProc != null) {
    console.log('flask server start success');
  }
}

function stopServer() {
  // if (pyProc) {
  //   pyProc.kill();
  //   console.log('kill flask server success');
  //   pyProc = null;
  // }
}

module.exports = { startServer_PY, startServer_EXE, stopServer };