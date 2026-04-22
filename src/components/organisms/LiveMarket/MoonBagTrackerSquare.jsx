import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const MoonBagTrackerSquare = () => {
    // Mock Bag
    const bag = { coin: 'SOL', entry: 1.70, current: 142.50 };
    const [multiplier, setMultiplier] = useState(0);

    useEffect(() => {
        // Mock price tick
        const interval = setInterval(() => {
            // Price moves slightly
            bag.current += (Math.random() - 0.4) * 0.5; // slight upward drift
            setMultiplier(bag.current / bag.entry);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const nextTarget = multiplier < 100 ? 100 : (multiplier < 500 ? 500 : 1000);
    const progress = ((multiplier % 100) / 100) * 100; // Crude progress bar logic for demo

    return (
        <EmpireBox title="Moon Bag" theme="gold" height="h-full">
            <div className="flex flex-col h-full justify-center items-center relative overflow-hidden">
                {/* Fire Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 to-transparent pointer-events-none" />
                
                <div className="z-10 text-center">
                    <div className="text-4xl animate-bounce-slow mb-1">🔥</div>
                    <div className="text-sm font-bold text-amber-100 mb-1">
                        {multiplier.toFixed(1)}x {bag.coin}
                    </div>
                    <div className="text-[10px] text-amber-500/80 font-mono mb-3">
                        ${bag.entry.toFixed(2)} ➔ ${bag.current.toFixed(2)}
                    </div>
                    
                    {/* Target Countdown */}
                    <div className="w-full bg-black/50 rounded-full h-4 relative overflow-hidden border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-400" 
                            style={{ width: `${progress}%` }}
                        />
                         <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white shadow-black drop-shadow-md">
                            NEXT: {nextTarget}x
                        </span>
                    </div>
                </div>
            </div>
        </EmpireBox>
    );
};

export default MoonBagTrackerSquare;
