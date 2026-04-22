import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const LiquidationHeatmap = () => {
    const [zones, setZones] = useState([
        { price: 41800, vol: 5.2, type: 'long' },
        { price: 42500, vol: 8.1, type: 'short' },
        { price: 43200, vol: 12.4, type: 'short' }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock heatmap shift
            setZones(prev => prev.map(z => ({
                ...z,
                vol: Math.max(0, z.vol + (Math.random() * 2 - 1))
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Liq Heatmap" theme="ruby" height="h-full">
            <div className="flex flex-col h-full space-y-1 relative overflow-hidden">
                {zones.map((z, i) => (
                    <div key={i} className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-mono text-slate-400">${z.price}</span>
                        <div className="flex-1 mx-2 h-4 bg-slate-800/50 rounded overflow-hidden relative">
                            <div 
                                className={`absolute top-0 bottom-0 ${z.type === 'short' ? 'right-0 bg-rose-500/40' : 'left-0 bg-emerald-500/40'} transition-all duration-500`}
                                style={{ width: `${Math.min(100, z.vol * 5)}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
                                {z.vol.toFixed(1)}M {z.type.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
                {/* Heat Effect */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-rose-500/10 to-transparent pointer-events-none animate-pulse" />
            </div>
        </EmpireBox>
    );
};

export default LiquidationHeatmap;
