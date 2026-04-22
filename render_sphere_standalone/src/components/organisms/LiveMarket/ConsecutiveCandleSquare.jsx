import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const ConsecutiveCandleSquare = () => {
    const [streak, setStreak] = useState({ count: 4, type: 'green', tf: '5m' });

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock streaks
            setStreak({
                count: Math.floor(Math.random() * 8 + 2),
                type: Math.random() > 0.5 ? 'green' : 'red',
                tf: ['1m', '5m', '15m', '1h'][Math.floor(Math.random() * 4)]
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const isGreen = streak.type === 'green';
    const color = isGreen ? 'text-emerald-500' : 'text-rose-500';
    const bg = isGreen ? 'bg-emerald-500' : 'bg-rose-500';

    return (
        <EmpireBox title="Streak Scanner" theme={isGreen ? 'emerald' : 'ruby'} height="h-full">
            <div className="flex flex-col h-full justify-center items-center">
                <div className="flex items-center gap-1 mb-2">
                    {/* Visual Candles */}
                    {Array.from({ length: Math.min(streak.count, 8) }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2 rounded-sm ${bg} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            style={{ 
                                height: `${10 + Math.random() * 20}px`,
                                animationDelay: `${i * 100}ms`,
                                opacity: (i + 1) / streak.count + 0.2
                            }} 
                        />
                    ))}
                </div>

                <div className={`text-4xl font-black font-mono ${color}`}>
                    {streak.count}
                </div>
                
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                    {streak.tf} {isGreen ? 'GREEN' : 'RED'} CANDLES
                </div>
                
                {streak.count > 6 && (
                    <div className={`mt-2 text-[9px] font-bold px-2 py-0.5 rounded text-black ${bg} animate-pulse`}>
                        MOMENTUM DETECTED
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default ConsecutiveCandleSquare;
