import React, { useState, useEffect } from 'react';
import { getApiUrl, EMPIRE_MACHINE_URL } from '../../config/api';

const ServerStatus = () => {
    const [status, setStatus] = useState('LOADING');
    const [metrics, setMetrics] = useState(null);
    const [machineStatus, setMachineStatus] = useState('UNKNOWN');

    useEffect(() => {
        const formatUptime = (seconds) => {
            if (seconds == null) return 'N/A';
            const total = Number(seconds) || 0;
            const hours = Math.floor(total / 3600);
            const minutes = Math.floor((total % 3600) / 60);
            if (!hours && !minutes) return '0m';
            return `${hours}h ${minutes}m`;
        };

        const fetchStatus = async () => {
            try {
                const res = await fetch(getApiUrl('/health'));
                if (!res.ok) throw new Error('Health check failed');
                const data = await res.json();

                const cpuPercent = typeof data.cpu_percent === 'number' ? data.cpu_percent : null;
                const memPercent = typeof data.memory_percent === 'number' ? data.memory_percent : null;

                setStatus('ONLINE');
                setMetrics({
                    cpu: cpuPercent != null ? `${cpuPercent.toFixed(0)}%` : 'N/A',
                    ram: memPercent != null ? `${memPercent.toFixed(0)}%` : 'N/A',
                    uptime: formatUptime(data.uptime_seconds),
                    active_bots: data.active_bots ?? 0
                });
            } catch (e) {
                console.error('ServerStatus error:', e);
                setStatus('OFFLINE');
                setMetrics(null);
            }
        };

        const fetchMachineStatus = async () => {
            try {
                const res = await fetch(EMPIRE_MACHINE_URL + '/');
                if (!res.ok) throw new Error('Empire Machine offline');
                setMachineStatus('ONLINE');
            } catch (_) {
                setMachineStatus('OFFLINE');
            }
        };

        fetchStatus();
        fetchMachineStatus();

        const interval = setInterval(() => {
            fetchStatus();
            fetchMachineStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl shadow-2xl text-white font-sans w-full max-w-sm hover:border-white/20 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    EMPIRE CLOUD
                </h2>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                    {status}
                </div>
            </div>

            {metrics && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>CPU Load</span>
                            <span>{metrics.cpu}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: metrics.cpu && metrics.cpu.endsWith('%') ? metrics.cpu : '0%' }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>RAM Usage</span>
                            <span>{metrics.ram}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                            <div
                                className="bg-purple-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                style={{ width: metrics.ram && metrics.ram.endsWith('%') ? metrics.ram : '0%' }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <div className="text-xs text-gray-500 uppercase">Uptime</div>
                            <div className="text-lg font-mono text-blue-300">{metrics.uptime}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <div className="text-xs text-gray-500 uppercase">Active Bots</div>
                            <div className="text-lg font-mono text-emerald-300">{metrics.active_bots}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-mono text-center space-y-1">
                <div>CORE: {status}</div>
                <div>EMPIRE MACHINE: {machineStatus}</div>
            </div>
        </div>
    );
};

export default ServerStatus;
