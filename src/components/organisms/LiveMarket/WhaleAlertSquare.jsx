import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const WhaleAlertSquare = () => {
    const [whales, setWhales] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Chance to spawn a whale
            if (Math.random() > 0.3) {
                const coin = ['BTC', 'ETH'][Math.floor(Math.random() * 2)];
                const price = coin === 'BTC' ? 42000 + Math.random() * 500 : 2200 + Math.random() * 50;
                const sizeBTC = (Math.random() * 100 + 10).toFixed(2); // 10 to 110 BTC
                const valueUSD = (sizeBTC * price).toLocaleString(undefined, { maximumFractionDigits: 0 });
                
                const newWhale = {
                    id: Date.now(),
                    coin,
                    size: sizeBTC,
                    price: price.toFixed(0),
                    value: valueUSD,
                    side: Math.random() > 0.5 ? 'BUY' : 'SELL'
                };
                
                setWhales(prev => [newWhale, ...prev].slice(0, 10));
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Whale Radar [> $500k]" theme="cyan" height="h-full">
            <div className="space-y-2 relative h-full overflow-hidden">
                 {/* Ocean Background Hint */}
                 <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-blue-900/20 pointer-events-none" />

                {whales.map(whale => (
                    <div key={whale.id} className="flex items-start gap-2 text-xs border-b border-white/5 pb-2 animate-in slide-in-from-right duration-500 relative z-10">
                        <span className="text-2xl">🐳</span>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className={`font-bold ${whale.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {whale.side} {whale.size} {whale.coin}
                                </span>
                                <span className="text-slate-400 text-[10px] self-center">
                                    @ ${whale.price}
                                </span>
                            </div>
                            <div className="text-cyan-200/70 font-mono text-[10px]">
                                Total Value: ${whale.value}
                            </div>
                        </div>
                    </div>
                ))}

                {whales.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-cyan-500/30">
                        <span className="text-4xl animate-pulse">🌊</span>
                        <span className="text-xs mt-2 uppercase tracking-widest">Scanning Deep Waters...</span>
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default WhaleAlertSquare;
