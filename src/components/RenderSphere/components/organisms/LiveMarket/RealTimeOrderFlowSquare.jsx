import React, { useState, useEffect, useRef } from 'react';
import EmpireBox from '../EmpireBox';

const RealTimeOrderFlowSquare = () => {
    const [trades, setTrades] = useState([]);
    const [connected, setConnected] = useState(false);
    
    // Mock WebSocket behavior since we can't connect to the real one
    useEffect(() => {
        setConnected(true);
        const interval = setInterval(() => {
            const side = Math.random() > 0.5 ? 'buy' : 'sell';
            const price = 42000 + Math.random() * 50;
            // Size distribution: mostly small, rarely big
            let size = Math.random() * 0.5;
            if (Math.random() > 0.95) size = Math.random() * 2; // > 0.95 chance for > 1 BTC potential
            if (Math.random() > 0.99) size = Math.random() * 6; // > 0.99 chance for > 5 BTC potential

            const newTrade = {
                id: Date.now() + Math.random(),
                price: price.toFixed(1),
                size: size.toFixed(4),
                side,
                time: new Date().toLocaleTimeString().split(' ')[0],
                isWhale: size > 5,
                isLarge: size > 1
            };

            setTrades(prev => [newTrade, ...prev].slice(0, 50));
        }, 200); // Fast updates

        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Order Flow Tape [Kraken]" theme="void" height="h-full">
            <div className="flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <div className="flex justify-between text-[9px] text-slate-500 uppercase border-b border-white/5 pb-1 mb-1">
                    <span>Price</span>
                    <span>Size (BTC)</span>
                    <span>Time</span>
                </div>

                {/* Tape */}
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5">
                    {trades.map((t) => {
                        let colorClass = t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400';
                        if (t.isWhale) colorClass = 'text-amber-400 animate-pulse font-bold'; // Gold pulsing
                        else if (t.isLarge) colorClass = 'text-amber-200 font-bold'; // Goldish

                        return (
                            <div key={t.id} className={`flex justify-between items-center text-xs font-mono ${t.isWhale ? 'bg-amber-900/20' : ''}`}>
                                <span className={colorClass}>{t.price}</span>
                                <span className={`${colorClass} ${t.isWhale ? 'text-sm' : ''}`}>{t.size}</span>
                                <span className="text-slate-600 text-[10px]">{t.time}</span>
                            </div>
                        );
                    })}
                </div>
                
                {/* Connection Status Indicator */}
                <div className="absolute bottom-0 right-0 p-1">
                     <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                </div>
            </div>
        </EmpireBox>
    );
};

export default RealTimeOrderFlowSquare;
