import React, { useState } from 'react';
import EmpireBox from '../EmpireBox';

const PortfolioRebalance = () => {
    const [rebalancing, setRebalancing] = useState(false);

    const handleRebalance = () => {
        setRebalancing(true);
        setTimeout(() => setRebalancing(false), 2000);
    };

    return (
        <EmpireBox title="Auto Rebalance" theme={rebalancing ? 'gold' : 'void'} height="h-full">
            <div className="flex flex-col h-full justify-between py-1">
                <div className="flex w-full h-4 rounded overflow-hidden text-[8px] font-bold text-black text-center leading-4">
                    <div className="bg-orange-500 w-1/2">BTC 50%</div>
                    <div className="bg-purple-500 w-[30%]">ETH 30%</div>
                    <div className="bg-green-500 w-[20%]">USDT 20%</div>
                </div>
                
                <div className="text-center text-[10px] text-slate-500 my-1">
                    Target Drift: <span className="text-rose-400 font-mono">2.4%</span>
                </div>

                <button 
                    onClick={handleRebalance}
                    disabled={rebalancing}
                    className={`w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                        rebalancing 
                        ? 'bg-amber-500 text-black animate-pulse cursor-wait' 
                        : 'bg-slate-800 text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 border border-slate-700 hover:border-amber-500/50'
                    }`}
                >
                    {rebalancing ? 'EXECUTING...' : 'REBALANCE NOW'}
                </button>
            </div>
        </EmpireBox>
    );
};

export default PortfolioRebalance;
