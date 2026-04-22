import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const ActiveOrdersLadderSquare = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Mock fetching orders
        const mockOrders = [
            { id: 1, side: 'buy', price: 41500, qty: 0.5 },
            { id: 2, side: 'buy', price: 41200, qty: 1.2 },
            { id: 3, side: 'sell', price: 42800, qty: 0.3 },
            { id: 4, side: 'sell', price: 43500, qty: 0.1 },
        ];
        setOrders(mockOrders);
    }, []);

    const handleCancelAll = () => {
        setOrders([]);
        // In real app: POST /api/cancel_all
    };

    return (
        <EmpireBox title="Active Orders" theme="emerald" height="h-full">
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto space-y-1 pr-1">
                    {orders.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                            No Active Orders
                        </div>
                    ) : (
                        orders.map(o => (
                            <div key={o.id} className="flex justify-between items-center text-xs bg-white/5 p-1 rounded border border-white/5">
                                <span className={`font-bold uppercase ${o.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {o.side}
                                </span>
                                <span className="font-mono text-slate-300">{o.price.toLocaleString()}</span>
                                <span className="font-mono text-slate-500">{o.qty} BTC</span>
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={handleCancelAll}
                    className="mt-2 w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
                >
                    Cancel All
                </button>
            </div>
        </EmpireBox>
    );
};

export default ActiveOrdersLadderSquare;
