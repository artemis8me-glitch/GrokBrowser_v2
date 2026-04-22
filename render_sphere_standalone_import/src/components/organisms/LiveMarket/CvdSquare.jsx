import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const CvdSquare = () => {
    const [data, setData] = useState([]);
    const [trend, setTrend] = useState('neutral');

    useEffect(() => {
        // Initial Data
        let currentCvd = 0;
        const initial = Array.from({ length: 60 }, (_, i) => {
            currentCvd += (Math.random() - 0.5) * 1000;
            return { time: i, cvd: currentCvd };
        });
        setData(initial);

        const interval = setInterval(() => {
            setData(prev => {
                const last = prev[prev.length - 1];
                const change = (Math.random() - 0.5) * 2000; // Random walk
                const newCvd = last.cvd + change;
                
                const newData = [...prev.slice(1), { time: last.time + 1, cvd: newCvd }];
                
                // Determine trend based on start vs end of window
                const first = newData[0].cvd;
                setTrend(newCvd > first ? 'buy' : 'sell');
                
                return newData;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const isBuy = trend === 'buy';
    const color = isBuy ? '#06b6d4' : '#d946ef'; // Cyan or Magenta

    return (
        <EmpireBox title="CVD [1H]" theme={isBuy ? 'cyan' : 'ruby'} height="h-full">
            <div className="h-full w-full flex flex-col relative">
                <div className="absolute top-0 right-0 z-10 text-xs font-mono font-bold" style={{ color }}>
                    {data.length > 0 ? data[data.length-1].cvd.toFixed(0) : 0}
                </div>
                
                <div className="flex-1 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCvd" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <YAxis hide domain={['auto', 'auto']} />
                            <Area 
                                type="monotone" 
                                dataKey="cvd" 
                                stroke={color} 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorCvd)" 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-[9px] text-center text-slate-500 uppercase tracking-widest -mt-1">
                    {isBuy ? 'Buyers in Control' : 'Sellers in Control'}
                </div>
            </div>
        </EmpireBox>
    );
};

export default CvdSquare;
