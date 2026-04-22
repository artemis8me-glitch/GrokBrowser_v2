import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const DeltaExposureSquare = () => {
    const [delta, setDelta] = useState(0); // -100 to 100 net delta %
    const [exposureUSD, setExposureUSD] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock delta fluctuation
            const newDelta = (Math.random() * 200 - 100).toFixed(1); // -100% to +100%
            setDelta(parseFloat(newDelta));
            setExposureUSD(Math.floor(Math.random() * 500000));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const isExtreme = Math.abs(delta) > 70;
    const isLong = delta > 0;
    const theme = isLong ? 'emerald' : 'ruby';

    return (
        <EmpireBox 
            title="Net Delta Exposure" 
            theme={theme} 
            height="h-full"
            className={isExtreme ? "animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.2)]" : ""}
        >
            <div className="flex flex-col h-full justify-center items-center relative overflow-hidden">
                {/* Background Gauge Effect */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 opacity-20 transition-all duration-1000 ${isLong ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ height: `${Math.abs(delta)}%` }}
                />

                <div className="relative z-10 text-center space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">Current Balance</div>
                    <div className={`text-4xl font-black tracking-tighter transition-colors duration-500 ${isLong ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {delta > 0 ? '+' : ''}{delta}%
                    </div>
                    <div className="text-xs font-mono text-white/50">
                        ${exposureUSD.toLocaleString()} Notional
                    </div>
                    
                    {isExtreme && (
                        <div className="mt-2 text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white animate-bounce">
                            ⚠️ EXPOSURE CRITICAL
                        </div>
                    )}
                </div>
            </div>
        </EmpireBox>
    );
};

export default DeltaExposureSquare;
