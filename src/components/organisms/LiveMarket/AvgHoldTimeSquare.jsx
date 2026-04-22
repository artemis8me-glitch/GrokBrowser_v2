import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const AvgHoldTimeSquare = () => {
    // Mock Data
    const [holdTime, setHoldTime] = useState(272); // Minutes (4h 32m)

    useEffect(() => {
        const interval = setInterval(() => {
            // Slight fluctuations
            setHoldTime(prev => Math.max(1, prev + (Math.random() * 2 - 1)));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const hours = Math.floor(holdTime / 60);
    const minutes = Math.floor(holdTime % 60);
    
    const isScalper = holdTime < 5;

    return (
        <EmpireBox title="Avg Hold Time" theme={isScalper ? 'emerald' : 'void'} height="h-full">
            <div className="flex flex-col h-full justify-center items-center text-center space-y-2">
                <div className={`text-4xl ${isScalper ? 'animate-pulse text-emerald-500' : 'text-slate-600'}`}>
                    ⏱️
                </div>
                
                <div className="text-2xl font-bold font-mono text-white">
                    {hours}h {minutes}m
                </div>

                <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {isScalper ? '⚡ SCALPER MODE ACTIVE' : 'SWING TRADING'}
                </div>
            </div>
        </EmpireBox>
    );
};

export default AvgHoldTimeSquare;
