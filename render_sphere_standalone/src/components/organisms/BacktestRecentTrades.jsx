import React from 'react';

const TRADES = [
  { pair: 'BTC/USDT', side: 'BUY', price: '$28,500', pnl: '+$420' },
  { pair: 'ETH/USDT', side: 'SELL', price: '$1,850', pnl: '-$150' },
  { pair: 'SOL/USDT', side: 'BUY', price: '$95.20', pnl: '+$85' },
];

const BacktestRecentTrades = () => {
  return (
    <div className="w-full h-full empire-glass rounded-3xl border border-white/10 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
        <h2 className="text-sm font-extrabold tracking-[0.25em] text-sky-400 uppercase">
          Recent Trades
        </h2>
        <span className="text-[10px] text-white/40 font-mono">SIM STREAM</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs font-mono text-white/80">
          <tbody className="divide-y divide-white/5">
            {TRADES.map((t, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                <td className="py-2 pr-2">{t.pair}</td>
                <td className="py-2 pr-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] tracking-widest ${
                      t.side === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="py-2 pr-2 text-white/60">{t.price}</td>
                <td
                  className={`py-2 text-right ${
                    t.pnl.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {t.pnl}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BacktestRecentTrades;

