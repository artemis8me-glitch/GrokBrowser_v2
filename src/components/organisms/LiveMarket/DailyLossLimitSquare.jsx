import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const DailyLossLimitSquare = () => {
    const [loss, setLoss] = useState(-1337);
    const limit = -2500;
    const [flatted, setFlatted] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (flatted) return;

            // Mock PnL swings
            setLoss(prev => {
                const next = prev - Math.random() * 50; // Slowly bleeding for demo
                if (next <= limit) {
                    setFlatted(true);
                    return limit; // Cap visualization
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [flatted]);

    const pct = Math.min(100, (Math.abs(loss) / Math.abs(limit)) * 100);

    return (
        <EmpireBox 
            title="Daily Loss Limit" 
            theme={flatted ? 'ruby' : 'void'} 
            height="h-full"
            className={flatted ? 'border-rose-500 shadow-[0_0_50px_red] bg-black' : ''}
        >
            <div className="flex flex-col h-full justify-center items-center text-center relative overflow-hidden">
                {flatted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 flex-col">
                        <div className="text-4xl animate-bounce">🛑</div>
                        <div className="text-rose-500 font-black text-xl tracking-widest mt-2">KILLED</div>
                        <div className="text-rose-300 text-[10px] font-mono">ALL POSITIONS FLATTENED</div>
                        <div className="text-slate-500 text-[9px] mt-2">Resets in 23:14:02</div>
                    </div>
                )}

                <div className={`text-2xl font-black font-mono tracking-tighter ${flatted ? 'text-rose-600' : 'text-rose-400'}`}>
                    -${Math.abs(loss).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mb-2">
                    / -${Math.abs(limit).toLocaleString()}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-rose-600 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                    />
                    {/* Tick Marks */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20" />
                    <div className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-white/20" />
                </div>
                
                <div className="text-[9px] text-rose-500/50 mt-1 uppercase tracking-widest">
                    {pct.toFixed(1)}% CONSUMED
                </div>
            </div>
        </EmpireBox>
    );
};

export default DailyLossLimitSquare;
