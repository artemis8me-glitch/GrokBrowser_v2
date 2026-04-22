import React, { useEffect, useState } from 'react';
import EmpireBox from './EmpireBox';
import { getApiUrl } from '../../config/api';

const MirrorReflectionSquare = () => {
  const [state, setState] = useState(null);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(getApiUrl('/api/mirror/state'));
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        setState(data);
        setStatus('ONLINE');
      } catch (e) {
        console.error('MirrorReflectionSquare error:', e);
        setStatus('OFFLINE');
      }
    };

    fetchState();
    const id = setInterval(fetchState, 7000);
    return () => clearInterval(id);
  }, []);

  const level = state?.level || 'calm';

  let theme = 'void';
  if (level === 'fomo') theme = 'ruby';
  else if (level === 'zen') theme = 'gold';
  else if (level === 'calm') theme = 'cyan';

  const label =
    level === 'fomo'
      ? 'FOMO'
      : level === 'zen'
      ? 'ZEN'
      : 'CALM';

  const accentClass =
    level === 'fomo'
      ? 'text-rose-400'
      : level === 'zen'
      ? 'text-amber-300'
      : 'text-cyan-300';

  return (
    <EmpireBox title="Mirror Reflection" theme={theme} height="h-full">
      <div className="relative flex flex-col items-center justify-center h-full gap-4">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,#22d3ee_0,transparent_50%),radial-gradient(circle_at_bottom,#f97316_0,transparent_55%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`text-xs font-mono uppercase tracking-[0.3em] text-white/40`}>
            The Mirror Sees
          </div>
          <div className={`text-4xl md:text-5xl font-black tracking-tight ${accentClass}`}>
            {label}
          </div>
          <div className="text-[10px] text-white/40 font-mono">
            sentiment: {state?.sentiment_score != null ? state.sentiment_score.toFixed?.(2) ?? state.sentiment_score : 'n/a'} •
            bpm: {state?.typing_bpm != null ? state.typing_bpm.toFixed?.(1) ?? state.typing_bpm : 'n/a'}
          </div>
          <div className="text-[9px] text-white/30 font-mono">
            {status}
          </div>
        </div>
      </div>
    </EmpireBox>
  );
};

export default MirrorReflectionSquare;

