import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Shield, AlertTriangle, CheckCircle, Globe, Lock, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SecurityDashboard() {
    const [logs, setLogs] = useState([]);
    const [selectedIP, setSelectedIP] = useState(null);
    const [ipInfo, setIpInfo] = useState(null);
    const [stats, setStats] = useState({ auth_fail: 0, auth_success: 0, firewall: 0 });
    const logContainerRef = useRef(null);

    const fetchLogs = async () => {
        try {
            const data = await api.get('/security/logs');
            // Sort by time desc
            const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
            setLogs(sorted);

            // Calc stats
            const newStats = { auth_fail: 0, auth_success: 0, firewall: 0 };
            sorted.forEach(l => {
                if (l.type === 'auth_fail') newStats.auth_fail++;
                if (l.type === 'auth_success') newStats.auth_success++;
                if (l.type === 'firewall' || l.type === 'port_scan') newStats.firewall++;
            });
            setStats(newStats);

        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleIPClick = async (ip) => {
        if (!ip) return;
        setSelectedIP(ip);
        setIpInfo(null);
        try {
            const info = await api.post('/security/ip-info', { ip });
            setIpInfo(info);
        } catch (e) {
            setIpInfo({ error: "Lookup Failed" });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

            {/* Left Column: Stats & Log Stream */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full">

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 shrink-0">
                    <Card className="bg-red-950/20 border-red-900/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase">Threats Detected</p>
                                <p className="text-2xl font-bold text-red-400">{stats.auth_fail + stats.firewall}</p>
                            </div>
                            <AlertTriangle className="text-red-500/50 w-8 h-8" />
                        </CardContent>
                    </Card>
                    <Card className="bg-green-950/20 border-green-900/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase">Successful Logins</p>
                                <p className="text-2xl font-bold text-green-400">{stats.auth_success}</p>
                            </div>
                            <CheckCircle className="text-green-500/50 w-8 h-8" />
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-950/20 border-blue-900/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase">Active Monitoring</p>
                                <p className="text-lg font-bold text-blue-400 animate-pulse">LIVE</p>
                            </div>
                            <Shield className="text-blue-500/50 w-8 h-8" />
                        </CardContent>
                    </Card>
                </div>

                {/* Live Log Stream */}
                <Card className="flex-1 min-h-0 flex flex-col border-gray-800 bg-black">
                    <CardHeader className="py-3 border-b border-gray-800">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            Live Security Events Stream
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0 font-mono text-xs">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 sticky top-0">
                                <tr>
                                    <th className="p-2 w-24">Time</th>
                                    <th className="p-2 w-20">Type</th>
                                    <th className="p-2">Event</th>
                                    <th className="p-2 w-32">Source IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/30 transition-colors">
                                        <td className="p-2 text-gray-500">{new Date(log.timestamp * 1000).toLocaleTimeString()}</td>
                                        <td className="p-2">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                                                log.type === 'auth_fail' ? "bg-red-900/50 text-red-400" :
                                                    log.type === 'auth_success' ? "bg-green-900/50 text-green-400" :
                                                        "bg-gray-800 text-gray-300"
                                            )}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-2 text-gray-300">{log.message}</td>
                                        <td
                                            className="p-2 text-blue-400 cursor-pointer hover:underline hover:text-blue-300"
                                            onClick={() => handleIPClick(log.ip)}
                                        >
                                            {log.ip}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-600">No events detected yet. Waiting for stream...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: IP Intelligence */}
            <div className="h-full">
                <Card className="h-full flex flex-col border-gray-800 bg-[#0c0c11]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4" /> IP Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {!selectedIP ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <Search className="w-12 h-12 opacity-20" />
                                <p className="text-center text-sm">Select an IP from the log<br />to analyze its origin.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="text-center pb-6 border-b border-gray-800">
                                    <h3 className="text-3xl font-mono text-white mb-1">{selectedIP}</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Target Analysis</p>
                                </div>

                                {ipInfo ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/40 p-3 rounded border border-gray-800">
                                                <p className="text-gray-500 text-xs">Hostname</p>
                                                <p className="font-mono text-sm text-green-400 truncate">{ipInfo.hostname}</p>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded border border-gray-800">
                                                <p className="text-gray-500 text-xs">Network Type</p>
                                                <p className="font-mono text-sm text-blue-400">{ipInfo.type}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                                <span className="text-gray-400 text-sm">Country</span>
                                                <span className="text-white">{ipInfo.country}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                                <span className="text-gray-400 text-sm">City</span>
                                                <span className="text-white">{ipInfo.city}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                                <span className="text-gray-400 text-sm">ISP</span>
                                                <span className="text-white truncated">{ipInfo.isp}</span>
                                            </div>

                                            {ipInfo.lat && (
                                                <div className="pt-4">
                                                    <p className="text-xs text-gray-500 mb-2">Geolocation Signal</p>
                                                    <div className="h-32 bg-gray-900 rounded flex items-center justify-center text-gray-600 text-xs">
                                                        [MAP VISUALIZATION PLACEHOLDER]<br />
                                                        {ipInfo.lat}, {ipInfo.lon}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto pb-4"></div>
                                        <p className="text-sm text-gray-400 mt-4">Scanning Global Databases...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
