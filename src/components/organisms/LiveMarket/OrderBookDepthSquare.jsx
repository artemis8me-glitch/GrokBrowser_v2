import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const OrderBookDepthSquare = () => {
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
    const [spread, setSpread] = useState(0);

    // Mock Data Generator
    useEffect(() => {
        const generateData = () => {
            const currentPrice = 42000 + Math.random() * 100;
            const bids = Array.from({ length: 10 }, (_, i) => ({
                price: currentPrice - (i + 1) * 5,
                volume: Math.random() * 5,
                cumulative: 0 
            }));
            const asks = Array.from({ length: 10 }, (_, i) => ({
                price: currentPrice + (i + 1) * 5,
                volume: Math.random() * 5,
                cumulative: 0
            }));
            
            // Calculate cumulative
            let bCum = 0;
            bids.forEach(b => { bCum += b.volume; b.cumulative = bCum; });
            let aCum = 0;
            asks.forEach(a => { aCum += a.volume; a.cumulative = aCum; });

            setOrderBook({ bids, asks });
            setSpread(asks[0].price - bids[0].price);
        };

        generateData();
        const interval = setInterval(generateData, 3000); // Update every 3s
        return () => clearInterval(interval);
    }, []);

    const maxVol = Math.max(
        ...orderBook.bids.map(b => b.cumulative),
        ...orderBook.asks.map(a => a.cumulative),
        1 // prevent divide by zero
    );

    return (
        <EmpireBox title="Order Book Depth [BTC/USD]" theme="emerald" height="h-full">
            <div className="flex flex-col h-full text-xs font-mono relative">
                {/* Spread Highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-8 -mt-4 bg-emerald-500/10 border-y border-emerald-500/30 flex items-center justify-center z-10 pointer-events-none">
                     <span className="text-emerald-400 font-bold bg-black/50 px-2 rounded">Spread: ${spread.toFixed(2)}</span>
                </div>

                {/* Asks (Sell Orders) - Red - Inverted to show lowest ask at bottom */}
                <div className="flex-1 flex flex-col justify-end gap-0.5 pb-2">
                    {orderBook.asks.slice().reverse().map((ask, i) => (
                        <div key={i} className="flex justify-between items-center relative pr-2">
                            <div 
                                className="absolute top-0 right-0 bottom-0 bg-rose-500/20 transition-all duration-300" 
                                style={{ width: `${(ask.cumulative / maxVol) * 100}%` }} 
                            />
                            <span className="text-rose-400 z-10 pl-2">{ask.price.toFixed(1)}</span>
                            <span className="text-slate-400 z-10">{ask.volume.toFixed(3)}</span>
                        </div>
                    ))}
                </div>

                {/* Bids (Buy Orders) - Green */}
                <div className="flex-1 flex flex-col gap-0.5 pt-2">
                    {orderBook.bids.map((bid, i) => (
                        <div key={i} className="flex justify-between items-center relative pr-2">
                             <div 
                                className="absolute top-0 right-0 bottom-0 bg-emerald-500/20 transition-all duration-300" 
                                style={{ width: `${(bid.cumulative / maxVol) * 100}%` }} 
                            />
                            <span className="text-emerald-400 z-10 pl-2">{bid.price.toFixed(1)}</span>
                            <span className="text-slate-400 z-10">{bid.volume.toFixed(3)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </EmpireBox>
    );
};

export default OrderBookDepthSquare;
