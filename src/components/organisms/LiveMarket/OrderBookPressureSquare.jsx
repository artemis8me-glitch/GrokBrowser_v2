import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const OrderBookPressureSquare = () => {
    const [bids, setBids] = useState(100);
    const [asks, setAsks] = useState(100);
    const [wallAlert, setWallAlert] = useState(null); // 'buy' or 'sell'

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock pressure
            let b = Math.random() * 5000;
            let a = Math.random() * 5000;
            
            // Occasional wall
            if (Math.random() > 0.8) b *= 6; // Buy Wall
            if (Math.random() > 0.8) a *= 6; // Sell Wall

            setBids(b);
            setAsks(a);

            if (b > a * 5) setWallAlert('buy');
            else if (a > b * 5) setWallAlert('sell');
            else setWallAlert(null);

        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const total = bids + asks;
    const bidPct = (bids / total) * 100;
    const askPct = (asks / total) * 100;

    return (
        <EmpireBox 
            title="Book Pressure [Top 20]" 
            theme={wallAlert === 'buy' ? 'emerald' : (wallAlert === 'sell' ? 'ruby' : 'void')} 
            height="h-full"
            className={wallAlert ? 'animate-pulse' : ''}
        >
            <div className="flex flex-col h-full justify-center space-y-2">
                
                {/* Visual Stacked Bar - Vertical for "Pressure" feel maybe? Or stick to horizontal for easy comparison. Horizontal is clearer. */}
                <div className="space-y-4">
                    {/* Asks (Sellers) */}
                    <div>
                        <div className="flex justify-between text-[10px] uppercase mb-1">
                            <span className="text-rose-400">Asks</span>
                            <span className="text-rose-400 font-mono">{asks.toFixed(0)}</span>
                        </div>
                        <div className="h-4 w-full bg-slate-800 rounded-sm overflow-hidden flex justify-end">
                            <div 
                                className="h-full bg-rose-500 transition-all duration-500" 
                                style={{ width: `${(asks / Math.max(bids, asks)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Bids (Buyers) */}
                    <div>
                        <div className="h-4 w-full bg-slate-800 rounded-sm overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                style={{ width: `${(bids / Math.max(bids, asks)) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase mt-1">
                            <span className="text-emerald-400">Bids</span>
                            <span className="text-emerald-400 font-mono">{bids.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {wallAlert && (
                    <div className={`text-center text-xs font-bold uppercase tracking-widest py-1 rounded ${wallAlert === 'buy' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {wallAlert} Wall Detected
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default OrderBookPressureSquare;
