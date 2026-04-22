import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const GasFeeTracker = () => {
    const [gwei, setGwei] = useState(15);

    useEffect(() => {
        const interval = setInterval(() => {
            setGwei(Math.floor(Math.random() * 30 + 10));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    let status = 'Low';
    let color = 'text-emerald-400';
    if (gwei > 30) { status = 'High'; color = 'text-rose-400'; }
    else if (gwei > 20) { status = 'Med'; color = 'text-amber-400'; }

    return (
        <EmpireBox title="ETH Gas [Gwei]" theme="void" height="h-full">
            <div className="flex flex-col h-full justify-center items-center">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-mono">{gwei}</span>
                    <span className="text-[10px] text-slate-500">BASE</span>
                </div>
                <div className={`mt-2 text-xs font-bold uppercase px-2 py-1 rounded bg-white/5 border border-white/10 ${color}`}>
                    {status} Traffic
                </div>
            </div>
        </EmpireBox>
    );
};

export default GasFeeTracker;
