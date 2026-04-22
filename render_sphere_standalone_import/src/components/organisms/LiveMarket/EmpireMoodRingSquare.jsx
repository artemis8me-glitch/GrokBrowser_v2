import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const EmpireMoodRingSquare = () => {
    // Moods: printing (green), calm (cyan), chop (magenta), bleeding (red)
    const [mood, setMood] = useState('printing');
    const [pnlVelocity, setPnlVelocity] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock random mood shift
            const r = Math.random();
            let newMood = 'calm';
            if (r > 0.75) newMood = 'printing';
            else if (r > 0.5) newMood = 'bleeding';
            else if (r > 0.25) newMood = 'chop';
            
            setMood(newMood);
            setPnlVelocity((Math.random() - 0.5) * 100);

            // In a real app, this would inject a class into the document body or a global context
            // document.body.setAttribute('data-mood', newMood); 
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getColors = (m) => {
        switch(m) {
            case 'printing': return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'PRINTING', shadow: 'shadow-emerald-500/50' };
            case 'bleeding': return { bg: 'bg-rose-600', text: 'text-rose-500', label: 'BLEEDING', shadow: 'shadow-rose-600/50' };
            case 'chop': return { bg: 'bg-fuchsia-500', text: 'text-fuchsia-400', label: 'CHOPPY', shadow: 'shadow-fuchsia-500/50' };
            default: return { bg: 'bg-cyan-500', text: 'text-cyan-400', label: 'CALM', shadow: 'shadow-cyan-500/50' };
        }
    };

    const style = getColors(mood);

    return (
        <EmpireBox title="Empire Mood" theme="void" height="h-full">
            <div className={`h-full w-full rounded flex items-center justify-center transition-all duration-1000 bg-black relative overflow-hidden`}>
                {/* Glow Background */}
                <div className={`absolute inset-0 opacity-20 ${style.bg} blur-xl animate-pulse`} />
                
                {/* Ring */}
                <div className={`w-16 h-16 rounded-full border-4 ${style.text} ${style.shadow} shadow-[0_0_30px_currentColor] flex items-center justify-center z-10 transition-all duration-1000`}>
                    <div className={`w-12 h-12 rounded-full ${style.bg} opacity-20 animate-ping`} />
                </div>

                <div className="absolute bottom-4 text-center z-10">
                    <div className={`text-xl font-black tracking-widest ${style.text} transition-colors duration-1000`}>
                        {style.label}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                        PnL Velocity: {pnlVelocity.toFixed(1)}/m
                    </div>
                </div>
            </div>
        </EmpireBox>
    );
};

export default EmpireMoodRingSquare;
