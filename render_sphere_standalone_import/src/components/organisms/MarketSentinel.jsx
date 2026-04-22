import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

const MarketSentinel = () => {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('CONNECTING...');

    useEffect(() => {
        const fetchSentiment = async () => {
            // Mock Fallout Protocol
            const mockData = {
                global_sentiment: { score: 65 + Math.floor(Math.random() * 10) },
                agents_online: 42,
                ai_consensus: "NETWORK SEVERED. RUNNING SIMULATION. BULLISH DIVERGENCE DETECTED.",
                market_pulse: [
                    { symbol: "BTC", price: 98000 + Math.random() * 500, change_24h: "+2.4%" },
                    { symbol: "ETH", price: 3400 + Math.random() * 50, change_24h: "+1.1%" },
                    { symbol: "SOL", price: 140 + Math.random() * 5, change_24h: "-0.5%" },
                    { symbol: "EMP", price: 1.00, change_24h: "+0.0%" }
                ]
            };

            try {
                // Short timeout to fallback quickly
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1000);

                const res = await fetch(getApiUrl('/api/sentinel'), { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) throw new Error('Failed to fetch');
                const result = await res.json();
                setData(result);
                setStatus('ONLINE');
            } catch (err) {
                console.warn("Sentinel Offline. Engaging Simulation Mode.", err);
                // Fallback to mock
                setData(mockData);
                setStatus('SIMULATION');
            }
        };

        fetchSentiment();
        const interval = setInterval(fetchSentiment, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return (
        <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl shadow-2xl text-white w-full max-w-lg mt-6 h-64 flex items-center justify-center">
            <div className="text-blue-400 animate-pulse font-mono">{status}</div>
        </div>
    );

    const sentimentColor = data.global_sentiment.score > 60 ? 'text-emerald-400' :
        data.global_sentiment.score < 40 ? 'text-red-400' : 'text-yellow-400';

    const barColor = data.global_sentiment.score > 60 ? 'bg-emerald-500' :
        data.global_sentiment.score < 40 ? 'bg-red-500' : 'bg-yellow-500';

    return (
        <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl shadow-2xl text-white w-full max-w-lg mt-6 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-purple-400 tracking-wider">MARKET SENTINEL</h3>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: `${i * 100}ms` }}></div>
                        ))}
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 font-mono text-right">
                    <div>AGENTS: {data.agents_online}</div>
                    <div>GEMINI SWARM</div>
                </div>
            </div>

            <div className="flex items-end justify-between mb-2">
                <div className="text-sm text-gray-400">Global Sentiment</div>
                <div className={`text-2xl font-black ${sentimentColor}`}>
                    {data.global_sentiment.score} <span className="text-xs font-normal opacity-75">/ 100</span>
                </div>
            </div>

            <div className="w-full bg-gray-700/30 rounded-full h-2 mb-6">
                <div className={`h-2 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-1000 ${barColor}`} style={{ width: `${data.global_sentiment.score}%` }}></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {data.market_pulse.map(coin => (
                    <div key={coin.symbol} className="bg-white/5 rounded-md p-2 flex justify-between items-center border border-white/5">
                        <span className="font-bold text-gray-300">{coin.symbol}</span>
                        <div className="text-right">
                            <div className="text-xs text-gray-400">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            <div className={`text-[10px] font-bold ${coin.change_24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {coin.change_24h}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-3 rounded-lg border border-blue-500/10">
                <div className="text-[10px] text-blue-300 font-bold mb-1 uppercase tracking-widest">AI Consensus</div>
                <div className="text-xs text-blue-100 leading-relaxed font-mono">
                    "{data.ai_consensus}"
                </div>
            </div>
        </div>
    );
};

export default MarketSentinel;
