import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export default function OrderEntry({ theme = 'emerald' }) {
  const [side, setSide] = useState('buy');
  const [size, setSize] = useState(0.5);
  const [leverage, setLeverage] = useState(1);
  const [symbol, setSymbol] = useState('BTC/USD');
  const [status, setStatus] = useState('IDLE');
  const [error, setError] = useState('');

  const accentBorder =
    theme === 'cyber'
      ? 'border-orange-500/50 shadow-orange-900/20'
      : theme === 'dark'
        ? 'border-slate-800 shadow-black/40'
        : 'border-emerald-500/30 shadow-emerald-900/20';

  return (
    <div
      className={`p-0 flex flex-col h-full w-full empire-glass rounded-3xl border ${accentBorder}`}
    >
      <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
        <h2 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
          <Activity size={16} className="text-orange-400" />
          Order Entry
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Market:</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none"
          >
            <option>BTC/USD</option>
            <option>ETH/USD</option>
            <option>SOL/USD</option>
            <option>XRP/USD</option>
          </select>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`py-2 rounded-md text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
              side === 'buy'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={14} />
            Buy / Long
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`py-2 rounded-md text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
              side === 'sell'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown size={14} />
            Sell / Short
          </button>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 block">
            Position Size (BTC)
          </label>
          <div className="relative group">
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">BTC</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Leverage
            </label>
            <span className="text-xs text-orange-400 font-bold font-mono">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value, 10) || 1)}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>100x</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!size || size <= 0) return;
            setStatus('SENDING');
            setError('');
            try {
              const res = await fetch(
                'https://coinbot-empire-2025.uc.r.app/api/trade',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    symbol,
                    side,
                    amount: size,
                    type: 'market',
                  }),
                }
              );
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
              }
              setStatus('CONFIRMED');
            } catch (e) {
              console.error('OrderEntry trade error:', e);
              setStatus('ERROR');
              setError(
                e instanceof Error ? e.message.slice(0, 160) : 'Unknown error'
              );
            }
          }}
          className={`mt-auto w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
            side === 'buy'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
              : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
          }`}
        >
          <DollarSign size={16} />
          {status === 'SENDING' ? 'Sending…' : `Place ${side.toUpperCase()} Order`}
        </button>

        <div className="mt-2 text-[10px] font-mono text-slate-500">
          Status: <span className="font-semibold">{status}</span>
          {error && (
            <div className="mt-1 text-rose-400 break-all">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
