import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const ExchangeLatencyRadarSquare = () => {
    const [pings, setPings] = useState({ Kraken: 45, Binance: 120, Bybit: 80 });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock Ping Updates
            const newPings = {
                Kraken: Math.floor(Math.random() * 100 + 20),
                Binance: Math.floor(Math.random() * 250 + 50),
                Bybit: Math.floor(Math.random() * 150 + 30),
            };
            setPings(newPings);

            const degraded = Object.keys(newPings).find(k => newPings[k] > 200);
            setAlert(degraded ? `${degraded} Route Degraded` : null);

        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getMax = () => Math.max(...Object.values(pings), 300);

    return (
        <EmpireBox 
            title="Latency Radar" 
            theme={alert ? 'ruby' : 'emerald'} 
            height="h-full"
            className={alert ? 'animate-pulse' : ''}
        >
            <div className="flex flex-col h-full items-center justify-center relative">
                {/* Radar Visual */}
                <div className="relative w-24 h-24 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="absolute w-16 h-16 border border-white/10 rounded-full" />
                    <div className="absolute w-8 h-8 border border-white/5 rounded-full" />
                    <div className="absolute w-full h-[1px] bg-white/10 rotate-90" />
                    <div className="absolute w-full h-[1px] bg-white/10" />

                    {/* Scanner Sweep Animation */}
                    <div className="absolute w-full h-full rounded-full border-r border-emerald-500/50 bg-gradient-to-r from-transparent to-emerald-500/10 animate-spin-slow" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}/>

                    {/* Dots */}
                    {Object.entries(pings).map(([ex, ms], i) => {
                        const angle = i * 120; // 3 points
                        const dist = (ms / 300) * 45; // Max 45px radius
                        const rad = (angle * Math.PI) / 180;
                        const x = Math.cos(rad) * dist;
                        const y = Math.sin(rad) * dist;

                        return (
                            <div 
                                key={ex}
                                className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${ms > 200 ? 'bg-rose-500 shadow-[0_0_10px_red]' : 'bg-emerald-400 shadow-[0_0_5px_lime]'}`}
                                style={{ 
                                    left: `calc(50% + ${x}px)`, 
                                    top: `calc(50% + ${y}px)` 
                                }}
                                title={`${ex}: ${ms}ms`}
                            />
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="w-full mt-4 space-y-1">
                    {Object.entries(pings).map(([ex, ms]) => (
                        <div key={ex} className="flex justify-between text-[10px] items-center">
                            <span className="text-slate-400 uppercase">{ex}</span>
                            <div className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${ms > 200 ? 'bg-rose-500' : (ms < 100 ? 'bg-emerald-500' : 'bg-amber-500')}`} />
                                <span className="font-mono text-white">{ms}ms</span>
                            </div>
                        </div>
                    ))}
                </div>

                 {alert && (
                    <div className="absolute top-2 left-0 right-0 text-center text-[9px] font-bold text-rose-500 bg-black/80 py-1">
                        ⚠️ {alert.toUpperCase()}
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default ExchangeLatencyRadarSquare;
