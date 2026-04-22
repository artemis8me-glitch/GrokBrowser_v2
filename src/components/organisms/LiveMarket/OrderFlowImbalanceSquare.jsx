import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const OrderFlowImbalanceSquare = () => {
    const [buyVol, setBuyVol] = useState(50);
    const [sellVol, setSellVol] = useState(50);
    const [ratio, setRatio] = useState(1);
    const [imbalanceAlert, setImbalanceAlert] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock volume updates
            const b = Math.random() * 1000;
            const s = Math.random() * 1000;
            
            // Occasionally create imbalance
            const bias = Math.random();
            let finalB = b, finalS = s;
            if (bias > 0.8) finalB *= 3; // Buy Imbalance
            if (bias < 0.2) finalS *= 3; // Sell Imbalance

            const total = finalB + finalS;
            setBuyVol((finalB / total) * 100);
            setSellVol((finalS / total) * 100);
            
            const r = finalB > finalS ? finalB / finalS : finalS / finalB;
            setRatio(r);
            setImbalanceAlert(r > 3);

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const dominant = buyVol > sellVol ? 'BUY' : 'SELL';
    
    return (
        <EmpireBox 
            title="Order Flow Imbalance [5m]" 
            theme="void" 
            height="h-full"
            className={imbalanceAlert ? "animate-pulse" : ""}
        >
            <div className="flex flex-col h-full justify-center space-y-4">
                {/* Visual Bar */}
                <div className="w-full h-8 bg-slate-800 rounded-full overflow-hidden relative flex">
                    {/* Cyan Buys */}
                    <div 
                        className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-500 flex items-center justify-start pl-2"
                        style={{ width: `${buyVol}%` }}
                    >
                        {buyVol > 20 && <span className="text-[10px] font-bold text-black font-mono">{buyVol.toFixed(0)}%</span>}
                    </div>
                    {/* Magenta Sells */}
                    <div 
                        className="h-full bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${sellVol}%` }}
                    >
                         {sellVol > 20 && <span className="text-[10px] font-bold text-black font-mono">{sellVol.toFixed(0)}%</span>}
                    </div>
                    
                    {/* Center Marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white mix-blend-difference" />
                </div>

                {/* Stats */}
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="text-[10px] text-cyan-400 uppercase">Buy Vol</div>
                        <div className="text-lg font-bold text-cyan-500">{buyVol.toFixed(1)}</div>
                    </div>

                    <div className="text-center flex flex-col items-center">
                         <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Ratio</div>
                         <div className={`text-xl font-black font-mono ${dominant === 'BUY' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                            {ratio.toFixed(2)}:1
                         </div>
                    </div>

                    <div className="text-center">
                        <div className="text-[10px] text-fuchsia-400 uppercase">Sell Vol</div>
                        <div className="text-lg font-bold text-fuchsia-500">{sellVol.toFixed(1)}</div>
                    </div>
                </div>

                {imbalanceAlert && (
                     <div className={`text-center text-xs font-bold py-1 rounded ${dominant === 'BUY' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-fuchsia-500/20 text-fuchsia-300'} animate-bounce`}>
                        HEAVY {dominant} IMBALANCE
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default OrderFlowImbalanceSquare;
