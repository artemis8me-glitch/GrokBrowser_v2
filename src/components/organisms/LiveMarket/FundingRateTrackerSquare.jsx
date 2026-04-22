import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const FundingRateTrackerSquare = () => {
    const [rates, setRates] = useState([
        { symbol: 'BTC', rate: 0.01 },
        { symbol: 'ETH', rate: 0.01 },
        { symbol: 'SOL', rate: 0.01 }
    ]);
    const [timeLeft, setTimeLeft] = useState('00:00:00');
    const [alertMode, setAlertMode] = useState(false);

    useEffect(() => {
        // Mock rates update
        const rateInterval = setInterval(() => {
            const newRates = rates.map(r => ({
                ...r,
                rate: (Math.random() * 0.08 - 0.01) // Range -0.01% to 0.07%
            }));
            setRates(newRates);
            
            const highFunding = newRates.some(r => r.rate > 0.05);
            setAlertMode(highFunding);
        }, 5000);

        // Countdown timer
        const timerInterval = setInterval(() => {
            const now = new Date();
            const nextFunding = new Date();
            // Funding usually every 8 hours (00, 08, 16 UTC)
            // Just mocking a countdown to next hour for simplicity
            nextFunding.setHours(now.getHours() + 1, 0, 0, 0);
            
            const diff = nextFunding - now;
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => { clearInterval(rateInterval); clearInterval(timerInterval); };
    }, []);

    return (
        <EmpireBox 
            title="Funding Rates [8h]" 
            theme={alertMode ? "ruby" : "emerald"} 
            height="h-full"
            className={alertMode ? "animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.4)]" : ""}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="text-center py-2 border-b border-white/5">
                    <span className="text-[10px] uppercase text-slate-400">Next Payment In</span>
                    <div className="text-2xl font-mono font-bold tracking-widest text-white">{timeLeft}</div>
                </div>

                <div className="space-y-3 mt-2">
                    {rates.map(coin => (
                        <div key={coin.symbol} className="flex justify-between items-center">
                            <span className="font-bold text-slate-300">{coin.symbol}</span>
                            <div className="flex flex-col items-end">
                                <span className={`font-mono font-bold ${coin.rate > 0.05 ? 'text-rose-500' : (coin.rate > 0 ? 'text-emerald-400' : 'text-slate-400')}`}>
                                    {coin.rate.toFixed(4)}%
                                </span>
                                <span className="text-[9px] text-slate-500">
                                    {coin.rate > 0.05 ? 'SHORTS PAY LONGS' : (coin.rate > 0 ? 'LONGS PAY SHORTS' : 'SHORTS PAY LONGS')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {alertMode && (
                     <div className="mt-2 text-center text-xs text-rose-500 font-bold bg-rose-500/10 py-1 rounded animate-bounce">
                        ⚠️ HIGH FUNDING ALERT
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default FundingRateTrackerSquare;
