import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const SmartMoneyFlowSquare = () => {
    const [delta, setDelta] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Delta: Perp Volume - Spot Volume
            // Positive = Perps buying more (Smart Money / Speculation leading)
            setDelta((Math.random() - 0.5) * 50); 
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const isPerpLead = delta > 0;
    const theme = isPerpLead ? 'cyan' : 'ruby'; // Cyan vs Magenta ish

    return (
        <EmpireBox title="Smart Money Flow" theme={theme} height="h-full">
            <div className="flex flex-col h-full justify-between py-2 relative overflow-hidden">
                {/* Flow Background Animation */}
                 <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${isPerpLead ? 'cyan' : 'fuchsia'}-500/10 to-transparent animate-pulse`} />

                <div className="flex justify-between items-end relative z-10 px-2">
                    <div className="text-center">
                        <div className="text-[9px] uppercase text-slate-500">Spot Vol</div>
                        <div className="h-16 w-4 bg-slate-700 rounded-t mx-auto mt-1 relative overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-slate-400 h-1/2 transition-all duration-1000" style={{ height: '45%' }} />
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center pb-4">
                        <div className={`text-2xl font-black font-mono ${isPerpLead ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                            {isPerpLead ? 'PERPS' : 'SPOT'}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-slate-400">
                            LEADING
                        </div>
                        <div className={`mt-1 text-xs font-bold ${isPerpLead ? 'text-cyan-500' : 'text-fuchsia-500'}`}>
                            Δ {Math.abs(delta).toFixed(1)}M
                        </div>
                    </div>

                    <div className="text-center">
                         <div className="text-[9px] uppercase text-slate-500">Perp Vol</div>
                         <div className="h-16 w-4 bg-slate-700 rounded-t mx-auto mt-1 relative overflow-hidden">
                             <div 
                                className={`absolute bottom-0 w-full transition-all duration-1000 ${isPerpLead ? 'bg-cyan-500' : 'bg-fuchsia-500'}`} 
                                style={{ height: isPerpLead ? '75%' : '30%' }} 
                            />
                         </div>
                    </div>
                </div>
            </div>
        </EmpireBox>
    );
};

export default SmartMoneyFlowSquare;
