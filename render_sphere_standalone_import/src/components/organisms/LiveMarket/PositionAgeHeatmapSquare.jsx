import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const PositionAgeHeatmapSquare = () => {
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        // Mock Positions
        const coins = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'DOGE', 'XRP', 'ADA'];
        const mocks = coins.map(coin => ({
            coin,
            ageHours: Math.random() * 8, // 0 to 8 hours
            pnl: (Math.random() - 0.4) * 5 // Random PnL
        })).sort((a, b) => b.ageHours - a.ageHours); // Oldest first
        
        setPositions(mocks);
    }, []);

    const getColor = (age) => {
        if (age < 1) return 'bg-emerald-500 hover:bg-emerald-400'; // Fresh
        if (age < 6) return 'bg-amber-500 hover:bg-amber-400'; // Aging
        return 'bg-rose-500 hover:bg-rose-400 animate-pulse'; // Stale/Rotting
    };

    const handleClose = (coin) => {
        setPositions(prev => prev.filter(p => p.coin !== coin));
        // Real app: API call to close
    };

    return (
        <EmpireBox title="Position Age Map" theme="void" height="h-full">
            <div className="grid grid-cols-4 gap-2 h-full content-start overflow-y-auto pr-1">
                {positions.map(p => (
                    <button
                        key={p.coin}
                        onClick={() => handleClose(p.coin)}
                        className={`aspect-square rounded flex flex-col items-center justify-center p-1 text-center transition-all shadow-lg group relative overflow-hidden ${getColor(p.ageHours)}`}
                        title={`Age: ${p.ageHours.toFixed(1)}h | PnL: ${p.pnl.toFixed(1)}%`}
                    >
                        <span className="text-[10px] font-bold text-black group-hover:opacity-0 transition-opacity">
                            {p.coin}
                        </span>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-white">✖</span>
                        </div>

                        {/* Age Indicator */}
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-black/70 group-hover:opacity-0">
                            {p.ageHours.toFixed(0)}h
                        </span>
                    </button>
                ))}
            </div>
        </EmpireBox>
    );
};

export default PositionAgeHeatmapSquare;
