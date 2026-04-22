import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const WhaleWatcher = () => {
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setAlert({
                    coin: ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)],
                    amount: (Math.random() * 5000000 + 500000).toLocaleString(),
                    side: Math.random() > 0.5 ? 'BUY' : 'SELL'
                });
                setTimeout(() => setAlert(null), 3000);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Whale Watcher" theme="void" height="h-full">
            <div className="flex flex-col h-full justify-center items-center relative overflow-hidden">
                {alert ? (
                    <div className="text-center z-10 animate-bounce-slow">
                        <div className="text-4xl mb-1">🐋</div>
                        <div className={`text-lg font-black ${alert.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {alert.side}
                        </div>
                        <div className="text-sm font-bold text-white font-mono">
                            ${alert.amount}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-1">
                            {alert.coin} MOVEMENT
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-600 text-xs italic animate-pulse">Scanning deep waters...</div>
                )}
                {/* Ocean BG */}
                <div className="absolute inset-0 bg-blue-900/10 z-0" />
            </div>
        </EmpireBox>
    );
};

export default WhaleWatcher;
