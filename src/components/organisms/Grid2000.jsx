import React, { useMemo } from 'react';

const Grid2000 = ({ theme = 'dark' }) => {
  // Generate 2000 items once
  const squares = useMemo(() => Array.from({ length: 2000 }, (_, i) => i), []);

  // Theme-based colors
  const colors = {
    dark: 'bg-emerald-500/20 hover:bg-emerald-400',
    emerald: 'bg-emerald-400/30 hover:bg-emerald-200',
    cyber: 'bg-pink-500/20 hover:bg-pink-400',
    void: 'bg-white/10 hover:bg-white/40',
  };

  const activeColor = colors[theme] || colors.dark;

  return (
    <div className="w-full h-full flex flex-col p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
          Empire Grid [2000 Units]
        </h2>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-500 font-mono">ONLINE</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(10px,1fr))] gap-0.5">
          {squares.map((i) => (
            <div
              key={i}
              className={`aspect-square rounded-[1px] transition-colors duration-500 ${activeColor} ${
                Math.random() > 0.95 ? 'animate-pulse bg-white/60' : ''
              }`}
              title={`Unit ${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid2000;
