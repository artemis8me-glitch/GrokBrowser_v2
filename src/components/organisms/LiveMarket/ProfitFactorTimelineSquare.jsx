import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';
import { LineChart, Line, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

const ProfitFactorTimelineSquare = () => {
    const [data, setData] = useState([]);
    const [currentPf, setCurrentPf] = useState(1.8);

    useEffect(() => {
        // Init mock history
        const history = [];
        let val = 1.8;
        for(let i=0; i<30; i++) {
            val += (Math.random() - 0.5) * 0.4;
            val = Math.max(0.5, val);
            history.push({ day: i, pf: val });
        }
        setData(history);
        setCurrentPf(val);

        const interval = setInterval(() => {
            setData(prev => {
                const last = prev[prev.length-1];
                let newVal = last.pf + (Math.random() - 0.5) * 0.2;
                newVal = Math.max(0.5, newVal);
                setCurrentPf(newVal);
                return [...prev.slice(1), { day: last.day + 1, pf: newVal }];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const isHealthy = currentPf >= 1.5;
    const isBleeding = currentPf < 1.0;
    const color = isHealthy ? '#10b981' : (isBleeding ? '#f43f5e' : '#fbbf24'); // Emerald, Rose, Amber

    return (
        <EmpireBox title="Profit Factor [30D]" theme={isHealthy ? 'emerald' : (isBleeding ? 'ruby' : 'gold')} height="h-full">
            <div className="flex flex-col h-full relative">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black font-mono tracking-tighter" style={{ color }}>
                        {currentPf.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">
                        {isHealthy ? 'HEALTHY' : (isBleeding ? 'BLEEDING' : 'CAUTION')}
                    </span>
                </div>

                <div className="flex-1 -ml-4 -mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <YAxis hide domain={[0, 'auto']} />
                            <ReferenceLine y={1} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
                            <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                            <Line 
                                type="monotone" 
                                dataKey="pf" 
                                stroke={color} 
                                strokeWidth={3} 
                                dot={false} 
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </EmpireBox>
    );
};

export default ProfitFactorTimelineSquare;
