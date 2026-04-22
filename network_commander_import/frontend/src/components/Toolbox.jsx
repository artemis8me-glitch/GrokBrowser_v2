import { useState } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Terminal, Globe, Wifi, Activity } from 'lucide-react';

export default function Toolbox() {
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState('');
    const [port, setPort] = useState('');

    const runCommand = async (type) => {
        setLoading(true);
        let res;
        try {
            if (type === 'ping') {
                res = await api.post('/exec/ping', { host: target, count: 3 });
            } else if (type === 'curl') {
                res = await api.post('/exec/curl', { url: target });
            } else if (type === 'check_port') {
                res = await api.post('/exec/check_port', { host: target, port: parseInt(port) });
            } else if (type === 'listen') {
                res = await api.post('/exec/listen', { port: parseInt(port) });
            }

            setOutput(JSON.stringify(res, null, 2));
        } catch (e) {
            setOutput(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Terminal className="text-primary" />
                        Network Tools
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-gray-400">Target (Host/URL)</label>
                        <Input
                            placeholder="example.com or 8.8.8.8"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-gray-400">Port (Optional)</label>
                        <Input
                            placeholder="80, 443, 5260..."
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button onClick={() => runCommand('ping')} isLoading={loading}>
                            Ping Host
                        </Button>
                        <Button onClick={() => runCommand('curl')} variant="secondary" isLoading={loading}>
                            Curl URL
                        </Button>
                        <Button onClick={() => runCommand('check_port')} variant="ghost">
                            Check Port
                        </Button>
                        <Button onClick={() => runCommand('listen')} variant="destructive" isLoading={loading}>
                            Listen on Port
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="text-accent" />
                        Output Console
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 h-[300px] overflow-auto whitespace-pre-wrap border border-white/10">
                        {output || '// Ready for command...'}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
