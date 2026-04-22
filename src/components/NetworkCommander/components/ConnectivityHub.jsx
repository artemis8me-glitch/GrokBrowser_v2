import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Wifi, Bluetooth, Radio, Network, Activity } from 'lucide-react';

export default function ConnectivityHub() {
    const [interfaces, setInterfaces] = useState([]);
    const [bluetooth, setBluetooth] = useState({ devices: [], status: '' });
    const [peers, setPeers] = useState([]);
    const [scanning, setScanning] = useState(false);

    const fetchData = async () => {
        try {
            const [ifaceData, peerData] = await Promise.all([
                api.get('/connect/interfaces'),
                api.get('/connect/peers')
            ]);
            setInterfaces(ifaceData);
            setPeers(peerData);
        } catch (e) {
            console.error("Connectivity Fetch Error", e);
        }
    };

    const scanBT = async () => {
        setScanning(true);
        setBluetooth({ devices: [], status: 'Scanning...' });
        try {
            const res = await api.get('/connect/bluetooth');
            if (res.error) {
                setBluetooth({ devices: [], status: 'Error: ' + res.error });
            } else {
                setBluetooth({ devices: res.devices || [], status: 'Scan Complete' });
            }
        } catch (e) {
            setBluetooth({ devices: [], status: 'Request Failed' });
        }
        setScanning(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll peers/interfaces
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-auto">

            {/* Peer Discovery Visualizer */}
            <Card className="border-blue-500/30 bg-blue-900/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
                        Discovery Radar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="min-h-[150px] flex flex-col items-center justify-center p-4">
                        {peers.length === 0 ? (
                            <div className="text-center text-slate-500">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 mx-auto mb-2 animate-[spin_10s_linear_infinite]" />
                                <p className="text-xs font-mono uppercase tracking-widest">Scanning for nearby Commandments...</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4 justify-center w-full">
                                {peers.map((peer, i) => (
                                    <div key={i} className="flex flex-col items-center p-4 bg-blue-500/20 rounded-xl border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-in zoom-in duration-300">
                                        <Network className="w-8 h-8 text-white mb-2" />
                                        <span className="font-bold text-white text-sm tracking-wide">{peer.hostname}</span>
                                        <span className="text-xs text-blue-200 font-mono">{peer.ip}</span>
                                        <Badge color="blue" className="mt-2 text-[8px]">Active</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bluetooth Scanner */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bluetooth className="w-5 h-5 text-indigo-400" /> Bluetooth Manager
                    </CardTitle>
                    <Button size="sm" onClick={scanBT} disabled={scanning} variant="outline" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
                        {scanning ? 'Scanning...' : 'Scan Nearby'}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase font-bold">Status</span>
                        <Badge color={scanning ? "orange" : "platinum"}>{bluetooth.status || 'Idle'}</Badge>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-auto custom-scrollbar pr-2">
                        {bluetooth.devices.map((dev, i) => (
                            <div key={i} className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-colors">
                                <span className="text-slate-200 text-sm font-medium">{dev.name || 'Unknown Device'}</span>
                                <span className="text-slate-500 text-xs font-mono">{dev.mac}</span>
                            </div>
                        ))}
                        {bluetooth.devices.length === 0 && !scanning && (
                            <p className="text-slate-600 text-center text-sm py-4 italic">No devices found in range.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Network Interfaces */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" /> Network Interfaces
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {interfaces.map((iface, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="font-bold text-white uppercase tracking-wider text-sm">{iface.name}</span>
                                    <div className={`w-2 h-2 rounded-full ${iface.is_up ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                </div>

                                {iface.ipv4.map((addr, j) => (
                                    <div key={'v4' + j} className="text-xs flex justify-between">
                                        <span className="text-slate-500 font-bold">IPv4</span>
                                        <span className="text-emerald-400 font-mono">{addr.address}</span>
                                    </div>
                                ))}

                                {iface.ipv6.map((addr, j) => (
                                    <div key={'v6' + j} className="text-xs flex justify-between">
                                        <span className="text-slate-500 font-bold">IPv6</span>
                                        <span className="text-slate-400 font-mono truncate max-w-[150px]" title={addr.address}>{addr.address}</span>
                                    </div>
                                ))}

                                {iface.mac && (
                                    <div className="text-xs pt-2 border-t border-slate-800 flex justify-between items-center mt-1">
                                        <span className="text-slate-600 font-bold">MAC</span>
                                        <span className="text-slate-500 font-mono">{iface.mac}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
