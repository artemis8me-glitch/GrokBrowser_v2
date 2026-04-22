import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const FomoMeterSquare = () => {
    const [score, setScore] = useState(50);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock Score Calculation
            // Base random walk
            setScore(prev => {
                const move = Math.random() * 10 - 5;
                let next = prev + move;
                next = Math.max(0, Math.min(100, next));
                
                setHistory(h => [...h, next].slice(-20)); // Keep last 20 points for sparkline
                return next;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getEmoji = (s) => {
        if (s > 90) return '💀'; // Extreme Greed / Rekt imminent
        if (s > 75) return '🤑'; // Greed
        if (s > 50) return '😐'; // Neutral
        if (s > 25) return '😨'; // Fear
        return '🥶'; // Extreme Fear
    };

    const getLabel = (s) => {
        if (s > 90) return 'EXTREME GREED';
        if (s > 75) return 'GREED';
        if (s > 50) return 'NEUTRAL';
        if (s > 25) return 'FEAR';
        return 'EXTREME FEAR';
    };

    const getColor = (s) => {
        if (s > 90) return 'text-rose-500'; // Short it
        if (s > 75) return 'text-emerald-500'; // People buying
        if (s > 25) return 'text-slate-400';
        if (s <= 25) return 'text-cyan-500'; // Buy the dip
        return 'text-white';
    };

    return (
        <EmpireBox title="FOMO Meter" theme={score > 90 ? 'ruby' : 'void'} height="h-full">
            <div className="flex flex-col h-full items-center justify-center relative">
                {/* Background Text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
                    <span className="text-[120px] font-black">{score.toFixed(0)}</span>
                </div>

                {/* Main Gauge */}
                <div className="z-10 text-center space-y-2">
                    <div className="text-6xl animate-bounce-slow filter drop-shadow-lg">
                        {getEmoji(score)}
                    </div>
                    
                    <div className={`text-3xl font-black tracking-tighter ${getColor(score)} transition-colors duration-500`}>
                        {score.toFixed(0)}
                    </div>
                    
                    <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                        {getLabel(score)}
                    </div>

                    {score > 90 && (
                        <div className="text-[10px] text-rose-500 font-bold bg-black/50 px-2 py-1 rounded border border-rose-500/30">
                            CONSIDER SHORTING
                        </div>
                    )}
                </div>

                {/* Mini Sparkline at bottom */}
                <div className="absolute bottom-2 left-2 right-2 h-6 flex items-end gap-0.5 opacity-30">
                    {history.map((val, i) => (
                        <div 
                            key={i} 
                            className="flex-1 bg-white" 
                            style={{ height: `${val}%` }}
                        />
                    ))}
                </div>
            </div>
        </EmpireBox>
    );
};

export default FomoMeterSquare;
