import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const SlippageMonitorSquare = () => {
    const [orders, setOrders] = useState([]);
    const [avgSlippage, setAvgSlippage] = useState(0);
    const [worstOffender, setWorstOffender] = useState(null);

    useEffect(() => {
        // Mock data generator
        const generateOrder = () => {
            const coins = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'];
            const coin = coins[Math.floor(Math.random() * coins.length)];
            const expected = 100 + Math.random() * 1000;
            // Slippage usually small, occasionally big
            const slipPct = Math.random() > 0.9 ? (Math.random() * 2) : (Math.random() * 0.1); 
            const actual = expected * (1 + (slipPct / 100)); // Slippage always hurts for this demo (paying more)
            
            return {
                id: Date.now(),
                coin,
                slip: slipPct,
                time: new Date().toLocaleTimeString().split(' ')[0]
            };
        };

        const interval = setInterval(() => {
            setOrders(prev => {
                const newOrder = generateOrder();
                const updated = [newOrder, ...prev].slice(0, 20);
                
                // Recalc stats
                const sum = updated.reduce((acc, curr) => acc + curr.slip, 0);
                setAvgSlippage(sum / updated.length);
                
                const worst = updated.reduce((max, curr) => curr.slip > max.slip ? curr : max, updated[0]);
                setWorstOffender(worst);
                
                return updated;
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Slippage Monitor [L20]" theme="void" height="h-full">
            <div className="flex flex-col h-full">
                {/* Stats Header */}
                <div className="flex justify-between items-end mb-3 border-b border-white/5 pb-2">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase">Avg Slippage</div>
                        <div className={`text-xl font-bold font-mono ${avgSlippage > 0.5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {avgSlippage.toFixed(3)}%
                        </div>
                    </div>
                    {worstOffender && (
                        <div className="text-right">
                             <div className="text-[10px] text-slate-500 uppercase">Worst Offender</div>
                             <div className="text-xs text-rose-400 font-bold">
                                {worstOffender.coin} ate {worstOffender.slip.toFixed(2)}%
                             </div>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-hidden space-y-1 relative">
                    {/* Gradient Fade for bottom list */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent z-10" />
                    
                    {orders.map((order, i) => (
                        <div key={order.id} className="flex justify-between items-center text-xs text-slate-400 odd:bg-white/5 px-1 py-0.5 rounded">
                            <span className="font-mono opacity-50">{order.time}</span>
                            <span className="font-bold text-slate-300">{order.coin}</span>
                            <span className={`${order.slip > 0.5 ? 'text-rose-500' : 'text-slate-400'} font-mono`}>
                                -{order.slip.toFixed(3)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </EmpireBox>
    );
};

export default SlippageMonitorSquare;
