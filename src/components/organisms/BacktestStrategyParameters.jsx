import React, { useState } from 'react';
import NeonSlider from '../atoms/NeonSlider';
import GlassInput from '../atoms/GlassInput';

const exchanges = ['Binance', 'FTX', 'Coinbase Pro'];
const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];

const BacktestStrategyParameters = ({ theme = 'emerald' }) => {
  const [params, setParams] = useState({
    lookback: 120,
    entryThreshold: 1.5,
    exitThreshold: -0.8,
    stopLoss: 2.0,
    takeProfit: 4.5,
    capital: 100000,
    exchange: exchanges[0],
    pair: pairs[0],
  });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    let pct = 0;
    const id = setInterval(() => {
      pct += 5;
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        setRunning(false);
      }
    }, 120);
  };

  const headerAccent =
    theme === 'cyber'
      ? 'text-cyan-400'
      : theme === 'void'
        ? 'text-white'
        : 'text-emerald-400';

  return (
    <div className="w-full h-full flex flex-col empire-glass rounded-3xl border border-white/10 p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <h2 className={`text-sm font-extrabold tracking-[0.25em] uppercase ${headerAccent}`}>
          Strategy Parameters
        </h2>
        <span className="text-[10px] font-mono text-white/40">BACKTEST MODE</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div>
          <div className="flex justify-between text-[10px] text-white/40 uppercase mb-1">
            <span>Lookback Period (candles)</span>
            <span className="font-mono text-emerald-300">{params.lookback}</span>
          </div>
          <NeonSlider
            label=""
            value={params.lookback}
            min={10}
            max={500}
            onChange={(e) => handleChange('lookback', Number(e.target.value))}
          />
        </div>

        <NeonSlider
          label="Entry Threshold (%)"
          value={params.entryThreshold}
          min={0.1}
          max={5}
          step={0.1}
          onChange={(e) => handleChange('entryThreshold', Number(e.target.value))}
        />

        <NeonSlider
          label="Exit Threshold (%)"
          value={params.exitThreshold}
          min={-5}
          max={0}
          step={0.1}
          onChange={(e) => handleChange('exitThreshold', Number(e.target.value))}
        />

        <NeonSlider
          label="Stop Loss (%)"
          value={params.stopLoss}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(e) => handleChange('stopLoss', Number(e.target.value))}
        />

        <NeonSlider
          label="Take Profit (%)"
          value={params.takeProfit}
          min={0.5}
          max={15}
          step={0.1}
          onChange={(e) => handleChange('takeProfit', Number(e.target.value))}
        />

        <GlassInput
          label="Initial Capital (USDT)"
          type="number"
          value={params.capital}
          onChange={(e) => handleChange('capital', Number(e.target.value))}
          placeholder="100000"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
              Exchange
            </span>
            <select
              value={params.exchange}
              onChange={(e) => handleChange('exchange', e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400/60"
            >
              {exchanges.map((ex) => (
                <option key={ex}>{ex}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
              Trading Pair
            </span>
            <select
              value={params.pair}
              onChange={(e) => handleChange('pair', e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400/60"
            >
              {pairs.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={runSimulation}
          disabled={running}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-bold text-xs tracking-[0.28em] uppercase shadow-[0_0_30px_rgba(56,189,248,0.6)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {running ? 'Running Simulation…' : 'Run Simulation'}
        </button>
        <div className="mt-2 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] text-white/40 font-mono text-right">
          {running ? `Calculating… ${progress}%` : progress === 100 ? 'Complete' : 'Idle'}
        </div>
      </div>
    </div>
  );
};

export default BacktestStrategyParameters;

