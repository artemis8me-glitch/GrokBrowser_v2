import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

const ActiveBots = () => {
    const [bots, setBots] = useState([]);
    const [status, setStatus] = useState('CONNECTING...');

    useEffect(() => {
        const fetchBots = async () => {
            try {
                // Connecting to Empire-VM via Localhost Proxy
                const res = await fetch(getApiUrl('/api/bots'));
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setBots(data);
                setStatus('ONLINE');
            } catch (err) {
                console.error("Link broken:", err);
                setStatus('OFFLINE');
                // Keep old data if available, or empty
            }
        };

        fetchBots();
        const interval = setInterval(fetchBots, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl shadow-2xl text-white w-full max-w-md mt-6 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h3 className="text-lg font-bold text-emerald-400 tracking-wider">ACTIVE UNITS</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${status === 'ONLINE' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                    {status}
                </span>
            </div>

            <div className="space-y-3">
                {bots.length === 0 && status === 'ONLINE' && <div className="text-gray-500 text-sm italic">No active units reporting.</div>}

                {bots.map(bot => (
                    <div key={bot.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-sm text-blue-300">{bot.name}</div>
                                {bot.tier === 'Enterprise' && (
                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">ENT</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{bot.strategy} • {bot.pair}</div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono text-sm font-bold ${bot.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {bot.pnl}
                            </div>
                            <div className={`text-[10px] uppercase font-bold tracking-wide ${bot.status === 'RUNNING' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                {bot.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-2 border-t border-white/5 flex justify-between text-[10px] text-gray-600 font-mono">
                <span>FLEET COMMAND</span>
                <span>CAPACITY: 12/24 UNITS</span>
            </div>
        </div>
    );
};

export default ActiveBots;
