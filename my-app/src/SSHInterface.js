import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const SSHInterface = () => {
    const [host, setHost] = useState('');
    const [port, setPort] = useState(22);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(null);

    useEffect(() => {
        terminal.current = new Terminal();
        fitAddon.current = new FitAddon();
        terminal.current.loadAddon(fitAddon.current);
        terminal.current.open(terminalRef.current);
        fitAddon.current.fit();

        const handleResize = () => {
            fitAddon.current.fit();
        };

        window.addEventListener('resize', handleResize);

        const handleSshOutput = (event, data) => {
            terminal.current.write(data);
        };

        const handleSshStatus = (event, status) => {
            setStatus(status);
            if (status === 'connected') {
                terminal.current.write('\x1b[32mConnected to SSH server\x1b[0m\r\n');
            } else if (status === 'Disconnected') {
                terminal.current.write('\x1b[31mDisconnected from SSH server\x1b[0m\r\n');
            } else {
                terminal.current.write(`\x1b[31m${status}\x1b[0m\r\n`);
            }
        };

        window.electron.onSshOutput(handleSshOutput);
        window.electron.onSshStatus(handleSshStatus);

        terminal.current.onData((data) => {
            window.electron.sshCommand(data);
        });

        return () => {
            window.electron.removeSshOutputListener(handleSshOutput);
            window.electron.removeSshStatusListener(handleSshStatus);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleConnect = () => {
        setStatus('Connecting...');
        terminal.current.clear();
        window.electron.sshConnect({ host, port, username, password });
    };

    const handleDisconnect = () => {
        window.electron.sshDisconnect();
        setStatus('Disconnected');
    };

    const handleReconnect = () => {
        handleDisconnect();
        handleConnect();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ padding: '10px', flex: '0 0 auto' }}>
                <h2>SSH Interface</h2>
                <input type="text" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
                <input type="number" placeholder="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleConnect}>Connect</button>
                <button onClick={handleDisconnect} disabled={status !== 'connected'}>Disconnect</button>
                <button onClick={handleReconnect} disabled={status === 'connected'}>Reconnect</button>
                <p>Status: {status}</p>
            </div>
            <div ref={terminalRef} style={{ flexGrow: 1, overflow: 'hidden', backgroundColor: 'black' }}></div>
        </div>
    );
};

export default SSHInterface;