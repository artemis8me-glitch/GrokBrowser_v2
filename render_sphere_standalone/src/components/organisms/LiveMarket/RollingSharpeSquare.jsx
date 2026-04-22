import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const RollingSharpeSquare = () => {
    const [sharpe, setSharpe] = useState(1.2);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSharpe(prev => {
                const next = prev + (Math.random() - 0.5) * 0.1;
                // Clamp reasonable range
                const clamped = Math.max(0, Math.min(4, next));
                
                setHistory(h => [...h, clamped].slice(-30)); // Keep last 30 for viz
                return clamped;
            });
        }, 1000); // Live updates
        return () => clearInterval(interval);
    }, []);

    let color = 'text-white';
    let theme = 'void';
    if (sharpe > 2.0) { color = 'text-cyan-400'; theme = 'cyan'; }
    else if (sharpe < 0.5) { color = 'text-rose-400'; theme = 'ruby'; }

    return (
        <EmpireBox 
            title="Rolling Sharpe [24h]" 
            theme={theme} 
            height="h-full"
            className={sharpe > 2.0 ? 'shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}
        >
            <div className="flex flex-col h-full items-center justify-center relative">
                <div className={`text-4xl font-black font-mono tracking-tighter ${color} transition-colors duration-500`}>
                    {sharpe.toFixed(2)}
                </div>
                
                <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">
                    Risk-Adjusted Return
                </div>

                {/* Mini Sparkline Background */}
                <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end opacity-20 gap-[1px]">
                    {history.map((val, i) => (
                        <div 
                            key={i} 
                            className="flex-1 bg-current" 
                            style={{ height: `${(val / 4) * 100}%` }}
                        />
                    ))}
                </div>
            </div>
        </EmpireBox>
    );
};

export default RollingSharpeSquare;
