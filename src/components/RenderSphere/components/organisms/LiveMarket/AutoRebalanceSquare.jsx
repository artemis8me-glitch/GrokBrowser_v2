import React, { useState } from 'react';
import EmpireBox from '../EmpireBox';

const AutoRebalanceSquare = () => {
    const [status, setStatus] = useState('idle'); // idle, calculating, rebalancing, done
    const [alloc, setAlloc] = useState({ btc: 45, alts: 55 }); // Current skewed

    const handleRebalance = () => {
        if (status !== 'idle') return;
        setStatus('calculating');
        
        setTimeout(() => {
            setStatus('rebalancing');
            setTimeout(() => {
                setAlloc({ btc: 60, alts: 40 });
                setStatus('done');
                setTimeout(() => setStatus('idle'), 3000);
            }, 1500);
        }, 1000);
    };

    return (
        <EmpireBox title="Auto Rebalance" theme="void" height="h-full">
            <div className="flex flex-col h-full justify-between py-2">
                {/* Visual Bars */}
                <div className="flex w-full h-8 rounded overflow-hidden text-[9px] font-bold text-black text-center leading-8">
                    <div className="bg-orange-500 transition-all duration-1000" style={{ width: `${alloc.btc}%` }}>
                        BTC {alloc.btc}%
                    </div>
                    <div className="bg-purple-500 transition-all duration-1000" style={{ width: `${alloc.alts}%` }}>
                        ALTS {alloc.alts}%
                    </div>
                </div>

                {/* Status / Action */}
                <div className="text-center">
                    {status === 'idle' && (
                        <button 
                            onClick={handleRebalance}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-xs font-bold uppercase tracking-widest text-white transition-colors"
                        >
                            Rebalance 60/40
                        </button>
                    )}
                    
                    {status === 'calculating' && (
                        <div className="text-xs text-slate-400 animate-pulse">Calculating Deltas...</div>
                    )}
                    
                    {status === 'rebalancing' && (
                        <div className="space-y-1">
                             <div className="text-[10px] text-rose-400">CLOSING EXCESS ALTS...</div>
                             <div className="text-[10px] text-emerald-400">BUYING BTC...</div>
                        </div>
                    )}
                    
                    {status === 'done' && (
                        <div className="text-xs text-emerald-400 font-bold">REBALANCE COMPLETE</div>
                    )}
                </div>

                <div className="text-[9px] text-slate-600 text-center uppercase">
                    Target: 60% BTC / 40% ALTS
                </div>
            </div>
        </EmpireBox>
    );
};

export default AutoRebalanceSquare;
