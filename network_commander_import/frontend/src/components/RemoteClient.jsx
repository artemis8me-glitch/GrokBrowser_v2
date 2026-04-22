import { useState } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Folder, File, Terminal, Cpu, Wifi, Activity, Power } from 'lucide-react';

export default function RemoteClient() {
    const [connected, setConnected] = useState(false);
    const [creds, setCreds] = useState({ host: '', username: '', password: '', port: 22 });
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('.');
    const [loading, setLoading] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [cmd, setCmd] = useState('');

    const connect = async () => {
        setLoading(true);
        try {
            const res = await api.post('/remote/connect', creds);
            if (res.status === 'connected') {
                setConnected(true);
                listFiles('.');
            } else {
                alert('Connection failed: ' + res.message);
            }
        } catch (err) {
            alert('Wait, something went wrong.');
        }
        setLoading(false);
    };

    const disconnect = async () => {
        await api.post('/remote/disconnect');
        setConnected(false);
        setFiles([]);
    };

    const listFiles = async (path) => {
        setLoading(true);
        try {
            const res = await api.post('/remote/list', { path });
            if (res.status === 'success') {
                setFiles(res.files);
                setCurrentPath(res.path);
            } else {
                alert('List failed: ' + res.message);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const runCommand = async () => {
        if (!cmd) return;
        setTerminalOutput(prev => prev + `\n$ ${cmd}`);
        try {
            const res = await api.post('/remote/command', { command: cmd });
            if (res.status === 'success') {
                setTerminalOutput(prev => prev + '\n' + res.stdout + res.stderr);
            } else {
                setTerminalOutput(prev => prev + '\nError: ' + res.message);
            }
        } catch (err) {
            setTerminalOutput(prev => prev + '\nRequest failed');
        }
        setCmd('');
    };

    if (!connected) {
        return (
            <Card className="max-w-md mx-auto mt-10">
                <CardHeader><CardTitle>Remote Connect (SSH)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Host IP (e.g. 192.168.1.50)" value={creds.host} onChange={e => setCreds({ ...creds, host: e.target.value })} />
                    <Input placeholder="Username" value={creds.username} onChange={e => setCreds({ ...creds, username: e.target.value })} />
                    <Input type="password" placeholder="Password" value={creds.password} onChange={e => setCreds({ ...creds, password: e.target.value })} />
                    <Button onClick={connect} disabled={loading} className="w-full">
                        {loading ? 'Connecting...' : 'Connect to Remote'}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <Card className="flex flex-col h-[500px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">File Browser: {currentPath}</CardTitle>
                    <div className="flex gap-2">
                        <Button size="xs" variant="outline" onClick={() => listFiles('HOME')}>Home</Button>
                        <Button size="xs" variant="outline" onClick={() => listFiles('..')}>Up</Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    {loading && <div className="text-center py-4 text-blue-400">Loading...</div>}
                    <div className="space-y-1">
                        {files.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
                                onClick={() => f.is_dir ? listFiles(currentPath + '/' + f.name) : null}
                            >
                                {f.is_dir ? <Folder className="w-4 h-4 text-yellow-500" /> : <File className="w-4 h-4 text-gray-400" />}
                                <span className={`text-sm ${f.is_dir ? 'text-white font-medium' : 'text-gray-300'}`}>{f.name}</span>
                                <span className="text-xs text-gray-600 ml-auto">{f.size}b</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col h-[500px]">
                <CardHeader className="flex flex-row justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><Terminal className="w-4 h-4" /> Remote Terminal</CardTitle>
                    <Button variant="destructive" size="xs" onClick={disconnect}>Disconnect</Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 bg-black p-2 rounded font-mono text-xs text-green-500 overflow-auto whitespace-pre-wrap mb-4">
                        {terminalOutput || "Ready for commands..."}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Command..."
                            value={cmd}
                            onChange={e => setCmd(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && runCommand()}
                        />
                        <Button onClick={runCommand}>Run</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
