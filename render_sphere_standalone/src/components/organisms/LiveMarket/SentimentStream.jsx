import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const SentimentStream = () => {
    const [sentiment, setSentiment] = useState(50);
    const [trend, setTrend] = useState('Neutral');

    useEffect(() => {
        const interval = setInterval(() => {
            const next = Math.min(100, Math.max(0, sentiment + (Math.random() * 10 - 5)));
            setSentiment(next);
            if (next > 60) setTrend('Bullish');
            else if (next < 40) setTrend('Bearish');
            else setTrend('Neutral');
        }, 2500);
        return () => clearInterval(interval);
    }, [sentiment]);

    let color = 'text-slate-400';
    if (trend === 'Bullish') color = 'text-emerald-400';
    if (trend === 'Bearish') color = 'text-rose-400';

    return (
        <EmpireBox title="Social Sentiment" theme="cyan" height="h-full">
            <div className="flex flex-col h-full items-center justify-center text-center">
                <div className={`text-3xl font-black ${color} transition-colors duration-500`}>
                    {sentiment.toFixed(0)}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                    Score
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${trend === 'Bullish' ? 'bg-emerald-500' : (trend === 'Bearish' ? 'bg-rose-500' : 'bg-slate-500')}`}
                        style={{ width: `${sentiment}%` }}
                    />
                </div>
                <div className="mt-2 text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {trend.toUpperCase()}
                </div>
            </div>
        </EmpireBox>
    );
};

export default SentimentStream;
