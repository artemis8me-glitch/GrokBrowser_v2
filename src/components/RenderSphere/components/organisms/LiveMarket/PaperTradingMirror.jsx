import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const PaperTradingMirror = () => {
    const [livePnL, setLivePnL] = useState(120.50);
    const [paperPnL, setPaperPnL] = useState(120.50);
    const [divergence, setDivergence] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLivePnL(prev => prev + (Math.random() - 0.45) * 5); // Slightly better execution?
            setPaperPnL(prev => prev + (Math.random() - 0.45) * 5); // No slippage
            
            // Calc diff
            setDivergence(Math.abs(livePnL - paperPnL));
        }, 1000);
        return () => clearInterval(interval);
    }, [livePnL, paperPnL]);

    return (
        <EmpireBox title="Paper Mirror" description="Compares Live execution vs Paper simulation to detect slippage and latency drag." theme="void" height="h-full">
            <div className="flex flex-col h-full justify-center items-center space-y-2">
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase">Live PnL</div>
                        <div className={`font-mono font-bold ${livePnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${livePnL.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase">Paper PnL</div>
                        <div className={`font-mono font-bold ${paperPnL >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                            ${paperPnL.toFixed(2)}
                        </div>
                    </div>
                </div>
                
                <div className="w-full bg-slate-800 h-px my-2" />
                
                <div className="flex justify-between w-full px-2 items-center">
                    <span className="text-[10px] text-slate-400">Execution Drag</span>
                    <span className={`text-xs font-bold ${divergence > 10 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                        ${divergence.toFixed(2)}
                    </span>
                </div>
            </div>
        </EmpireBox>
    );
};

export default PaperTradingMirror;
