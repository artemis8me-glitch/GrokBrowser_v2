import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const VwapDeviationSquare = () => {
    const [price, setPrice] = useState(42000);
    const [vwap, setVwap] = useState(42000);
    const [pctDiff, setPctDiff] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock movements
            setPrice(p => p + (Math.random() - 0.5) * 50);
            setVwap(v => v + (Math.random() - 0.5) * 10); // VWAP moves slower
            
            // Calculate deviation
            const diff = ((price - vwap) / vwap) * 100;
            setPctDiff(diff);
        }, 1000);
        return () => clearInterval(interval);
    }, [price, vwap]);

    const isOpportunity = Math.abs(pctDiff) > 2;
    const isOversold = pctDiff < -2;
    const isOverbought = pctDiff > 2;

    return (
        <EmpireBox 
            title="VWAP Deviation" 
            theme={isOpportunity ? 'gold' : 'void'} 
            height="h-full"
            className={isOpportunity ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' : ''}
        >
            <div className="flex flex-col h-full justify-center items-center relative">
                <div className="text-3xl font-black font-mono tracking-tighter mb-1 text-white">
                    {pctDiff > 0 ? '+' : ''}{pctDiff.toFixed(2)}%
                </div>
                
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">
                    Distance from Session VWAP
                </div>

                {/* Visual Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                    {/* Center Marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />
                    
                    {/* Deviation Bar */}
                    <div 
                        className={`absolute top-0 bottom-0 transition-all duration-300 ${isOpportunity ? 'bg-amber-400 animate-pulse' : 'bg-blue-500'}`}
                        style={{
                            left: pctDiff < 0 ? '50%' : '50%',
                            width: `${Math.min(Math.abs(pctDiff) * 10, 50)}%`, // Scale for visibility
                            transform: pctDiff < 0 ? 'translateX(-100%)' : 'none'
                        }}
                    />
                </div>

                {/* Labels */}
                <div className="w-full flex justify-between text-[9px] text-slate-600 mt-1 px-1">
                    <span className={isOversold ? 'text-amber-400 font-bold' : ''}>-2% BUY ZONE</span>
                    <span className={isOverbought ? 'text-amber-400 font-bold' : ''}>+2% SHORT ZONE</span>
                </div>
            </div>
        </EmpireBox>
    );
};

export default VwapDeviationSquare;
