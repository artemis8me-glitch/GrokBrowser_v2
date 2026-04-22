import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const PnlSplitSquare = () => {
    const [realized, setRealized] = useState(1250);
    const [unrealized, setUnrealized] = useState(450);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock updates
            setRealized(p => p + (Math.random() > 0.7 ? Math.random() * 50 : 0)); // Only goes up mostly
            setUnrealized(p => p + (Math.random() * 100 - 40)); // Fluctuates
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const total = Math.abs(realized) + Math.abs(unrealized);
    const rPct = (Math.abs(realized) / total) * 100;
    
    // Golden ratio bar if realized > unrealized
    const isSecured = realized > unrealized;

    return (
        <EmpireBox title="PnL Split" theme={isSecured ? 'gold' : 'void'} height="h-full">
            <div className="flex flex-col h-full justify-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                         <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Realized</div>
                         <div className="text-xl font-black text-amber-400 font-mono">
                            ${realized.toFixed(0)}
                         </div>
                    </div>
                    <div className="text-center">
                         <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Floating</div>
                         <div className={`text-xl font-black font-mono ${unrealized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {unrealized > 0 ? '+' : ''}{unrealized.toFixed(0)}
                         </div>
                    </div>
                </div>

                {/* Ratio Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-500 ${isSecured ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`}
                        style={{ width: `${rPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                    <span>LOCKED</span>
                    <span>AT RISK</span>
                </div>
            </div>
        </EmpireBox>
    );
};

export default PnlSplitSquare;
