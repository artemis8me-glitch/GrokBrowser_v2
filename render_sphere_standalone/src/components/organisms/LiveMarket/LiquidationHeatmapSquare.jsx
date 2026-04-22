import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const LiquidationHeatmapSquare = () => {
    const [liquidations, setLiquidations] = useState([]);

    useEffect(() => {
        // Mock WebSocket connection
        const interval = setInterval(() => {
            const isLong = Math.random() > 0.5;
            const size = (Math.random() * 50000 + 1000).toFixed(0);
            const symbol = ['BTC', 'ETH', 'SOL', 'XRP'][Math.floor(Math.random() * 4)];
            
            const newLiq = {
                id: Date.now(),
                symbol,
                size,
                side: isLong ? 'Long' : 'Short',
                color: isLong ? 'text-rose-500' : 'text-emerald-500', // Longs liquidated = Price drop (Red), Shorts = Price up (Green) usually, or Red for Rekt
                // Let's stick to standard: Long liquidation (forced sell) -> Red context. Short liquidation (forced buy) -> Green context.
            };

            setLiquidations(prev => [newLiq, ...prev].slice(0, 20)); // Keep last 20
        }, 800); // Fast updates

        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Liquidation Heatmap [Kraken]" theme="ruby" height="h-full">
            <div className="h-full overflow-hidden relative">
                {/* Visual Background Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-black to-black opacity-50" />
                
                <div className="relative z-10 space-y-1 p-2">
                    {liquidations.map((liq) => (
                        <div key={liq.id} className="flex justify-between items-center text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${liq.side === 'Long' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                                <span className="font-bold text-slate-300">{liq.symbol}</span>
                            </div>
                            <span className={`${liq.color} font-mono`}>
                                {liq.side === 'Long' ? 'REKT' : 'SQUEEZE'} ${parseInt(liq.size).toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {liquidations.length === 0 && <div className="text-center text-slate-500 mt-10">Waiting for volatility...</div>}
                </div>
            </div>
        </EmpireBox>
    );
};

export default LiquidationHeatmapSquare;
