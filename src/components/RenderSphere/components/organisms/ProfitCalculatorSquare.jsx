import React, { useState, useMemo } from 'react';
import EmpireBox from './EmpireBox';

const ProfitCalculatorSquare = () => {
  const [entryPrice, setEntryPrice] = useState('30000');
  const [exitPrice, setExitPrice] = useState('31000');
  const [size, setSize] = useState('0.5');
  const [feesPct, setFeesPct] = useState('0.08');
  const [direction, setDirection] = useState<'long' | 'short'>('long');

  const parsed = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const qty = parseFloat(size) || 0;
    const feePct = (parseFloat(feesPct) || 0) / 100;

    const notionalEntry = entry * qty;
    const notionalExit = exit * qty;
    const gross =
      direction === 'long'
        ? notionalExit - notionalEntry
        : notionalEntry - notionalExit;
    const fees = (notionalEntry + notionalExit) * feePct;
    const net = gross - fees;
    const roi =
      notionalEntry > 0 ? (net / notionalEntry) * 100 : 0;

    const breakeven =
      direction === 'long'
        ? entry + (fees / qty || 0)
        : entry - (fees / qty || 0);

    return {
      gross,
      fees,
      net,
      roi,
      breakeven,
    };
  }, [entryPrice, exitPrice, size, feesPct, direction]);

  const badgeColor =
    parsed.net >= 0
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  return (
    <EmpireBox title="Profit Calculator" theme="emerald" height="h-full">
      <div className="flex flex-col h-full gap-4">
        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
              Direction
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirection('long')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                  direction === 'long'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-black/40 border-white/10 text-white/40'
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setDirection('short')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                  direction === 'short'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                    : 'bg-black/40 border-white/10 text-white/40'
                }`}
              >
                Short
              </button>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
              Position Size
            </div>
            <div className="relative">
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-xs text-white outline-none focus:border-cyan-400/60"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-white/40">
                BTC
              </span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
              Entry Price
            </div>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-xs text-white outline-none focus:border-cyan-400/60"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
              Exit Price
            </div>
            <input
              type="number"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-xs text-white outline-none focus:border-cyan-400/60"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
              Fees (% per side)
            </div>
            <div className="relative">
              <input
                type="number"
                value={feesPct}
                onChange={(e) => setFeesPct(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-xs text-white outline-none focus:border-cyan-400/60"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-white/40">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              P&L Snapshot
            </div>
            <div
              className={`px-2 py-1 rounded-full border text-[10px] font-mono ${badgeColor}`}
            >
              {parsed.net >= 0 ? 'Profit' : 'Loss'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="bg-black/40 border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-white/40 uppercase mb-1">
                Gross P&L
              </div>
              <div
                className={`text-lg font-bold ${
                  parsed.gross >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {parsed.gross.toFixed(2)}
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-white/40 uppercase mb-1">
                Fees (both sides)
              </div>
              <div className="text-lg font-bold text-cyan-300">
                {parsed.fees.toFixed(2)}
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-white/40 uppercase mb-1">
                Net P&L
              </div>
              <div
                className={`text-lg font-bold ${
                  parsed.net >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {parsed.net.toFixed(2)}
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-white/40 uppercase mb-1">
                ROI
              </div>
              <div className="text-lg font-bold text-sky-300">
                {parsed.roi.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-auto bg-black/40 border border-emerald-500/30 rounded-lg p-3 text-[10px] font-mono flex items-center justify-between">
            <div className="text-white/50 uppercase tracking-[0.2em]">
              Breakeven
            </div>
            <div className="text-emerald-300 text-xs font-bold">
              {direction === 'long' ? 'Exit ≥ ' : 'Exit ≤ '}
              {Number.isFinite(parsed.breakeven)
                ? parsed.breakeven.toFixed(2)
                : '—'}
            </div>
          </div>
        </div>
      </div>
    </EmpireBox>
  );
};

export default ProfitCalculatorSquare;

