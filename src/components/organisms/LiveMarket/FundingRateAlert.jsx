import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const FundingRateAlert = () => {
    const [rates, setRates] = useState([
        { symbol: 'BTC', rate: 0.01 },
        { symbol: 'ETH', rate: -0.02 },
        { symbol: 'SOL', rate: 0.08 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRates(prev => prev.map(r => ({
                ...r,
                rate: r.rate + (Math.random() * 0.02 - 0.01)
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Funding Rates [8H]" theme="emerald" height="h-full">
            <div className="flex flex-col h-full justify-center space-y-2">
                {rates.map(r => (
                    <div key={r.symbol} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">{r.symbol}</span>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${r.rate > 0.05 ? 'text-rose-500 animate-pulse' : (r.rate < 0 ? 'text-emerald-400' : 'text-slate-400')}`}>
                                {r.rate.toFixed(4)}%
                            </span>
                            <div className={`w-16 h-1 bg-slate-800 rounded overflow-hidden`}>
                                <div 
                                    className={`h-full ${r.rate > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${Math.min(100, Math.abs(r.rate * 500))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </EmpireBox>
    );
};

export default FundingRateAlert;
