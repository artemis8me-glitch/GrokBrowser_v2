import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

const TradeHistory = () => {
    const [trades, setTrades] = useState([]);
    const [status, setStatus] = useState('SYNCING');

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await fetch(getApiUrl('/api/decisions?limit=10'));
                if (!res.ok) throw new Error('Failed to fetch');
                const result = await res.json();
                setTrades(result.data || []);
                setStatus('UPDATED');
            } catch (err) {
                console.error("Trade history error:", err);
                setStatus('ERROR');
            }
        };

        fetchTrades();
        const interval = setInterval(fetchTrades, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl shadow-2xl text-white w-full h-96 flex flex-col hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h3 className="text-lg font-bold text-gray-200 tracking-wider">THE LEDGER</h3>
                <span className="text-[10px] font-mono text-gray-500">{status}</span>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/5 font-mono text-xs text-gray-400 uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Symbol</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Confidence</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Logic</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {trades.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 italic">No trade records found.</td>
                            </tr>
                        ) : (
                            trades.map((trade, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-gray-400">
                                        {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="p-3 font-bold text-blue-300">{trade.symbol}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${trade.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' :
                                            trade.action === 'sell' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {trade.action}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-purple-500 h-1.5 rounded-full"
                                                    style={{ width: `${(trade.confidence || 0) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span>{Math.round((trade.confidence || 0) * 100)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-300">${trade.price ? trade.price.toLocaleString() : '0.00'}</td>
                                    <td className="p-3 text-gray-500 max-w-xs truncate" title={trade.reason}>
                                        {trade.reason || 'Manual override'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeHistory;
