const { Client } = require('ssh2');

let conn;
let currentStream;

function setupSSHHandlers(ipcMain) {
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
}

module.exports = { setupSSHHandlers };