import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

export default function PortManager() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const data = await api.get('/system/connections');
            setConnections(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch connections');
        }
        setLoading(false);
    };

    const killProcess = async (pid) => {
        if (!confirm(`Are you sure you want to kill process ${pid}?`)) return;
        try {
            await api.post('/system/kill', { pid });
            fetchConnections();
        } catch (err) {
            alert('Failed to kill process');
        }
    };

    useEffect(() => {
        fetchConnections();
        const interval = setInterval(fetchConnections, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Port Commander</CardTitle>
                <Button onClick={fetchConnections} variant="outline" size="sm">Refresh</Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm">
                            <th className="p-2">Process</th>
                            <th className="p-2">PID</th>
                            <th className="p-2">Local Address</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {connections.map((conn, idx) => (
                            <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 font-mono text-blue-400">{conn.process_name}</td>
                                <td className="p-2 text-gray-500">{conn.pid}</td>
                                <td className="p-2 font-mono text-green-400">{conn.laddr}</td>
                                <td className="p-2 text-xs">
                                    <span className={`px-2 py-1 rounded-full ${conn.status === 'LISTEN' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                        {conn.status}
                                    </span>
                                </td>
                                <td className="p-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => killProcess(conn.pid)}
                                    >
                                        Kill
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {connections.length === 0 && !loading && (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No active connections found (try running as root?)</td></tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
