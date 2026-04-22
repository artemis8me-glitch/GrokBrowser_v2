import React, { useState, useMemo } from 'react';
import EmpireBox from './EmpireBox';

const emptyRow = () => ({
  id: Math.random().toString(36).slice(2),
  date: '',
  symbol: '',
  side: 'BUY',
  quantity: '',
  price: '',
});

const parseNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const TaxLotCalculatorSquare = () => {
  const [rows, setRows] = useState([emptyRow()]);

  const summary = useMemo(() => {
    const perSymbol = {};

    rows
      .filter((r) => r.symbol && r.quantity && r.price)
      .forEach((row) => {
        const symbol = row.symbol.toUpperCase();
        if (!perSymbol[symbol]) {
          perSymbol[symbol] = {
            lots: [],
            realizedPnl: 0,
            realizedQty: 0,
          };
        }
        const qty = parseNumber(row.quantity);
        const price = parseNumber(row.price);
        const symbolState = perSymbol[symbol];

        if (row.side === 'BUY') {
          symbolState.lots.push({ qty, price });
        } else if (row.side === 'SELL') {
          let remaining = qty;
          let pnl = 0;

          while (remaining > 0 && symbolState.lots.length > 0) {
            const lot = symbolState.lots[0];
            const take = Math.min(remaining, lot.qty);
            pnl += (price - lot.price) * take;
            lot.qty -= take;
            remaining -= take;
            if (lot.qty <= 0.0000001) {
              symbolState.lots.shift();
            }
          }

          symbolState.realizedPnl += pnl;
          symbolState.realizedQty += qty - remaining;
        }
      });

    const result = Object.entries(perSymbol).map(([symbol, data]) => {
      const remainingQty = data.lots.reduce((sum, l) => sum + l.qty, 0);
      const remainingValue = data.lots.reduce(
        (sum, l) => sum + l.qty * l.price,
        0,
      );
      const avgCost = remainingQty > 0 ? remainingValue / remainingQty : 0;
      return {
        symbol,
        realizedPnl: data.realizedPnl,
        remainingQty,
        avgCost,
      };
    });

    return result.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [rows]);

  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  return (
    <EmpireBox title="Tax Lot Calculator" theme="void" height="h-full">
      <div className="flex flex-col h-full gap-3">
        <div className="text-[10px] text-white/40 font-mono">
          FIFO lots by symbol. Enter fills, see realized PnL and remaining basis.
        </div>

        <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
          <div className="overflow-auto border border-white/5 rounded-lg bg-black/30">
            <table className="w-full text-[11px] font-mono text-white/80">
              <thead className="bg-black/60 sticky top-0">
                <tr className="text-white/50">
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Symbol</th>
                  <th className="px-2 py-1 text-left">Side</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.date}
                        onChange={(e) =>
                          handleRowChange(row.id, 'date', e.target.value)
                        }
                        placeholder="2025-12-07 14:32"
                        className="w-full bg-transparent border border-white/10 rounded px-1 py-0.5 text-[10px] outline-none focus:border-cyan-400/60"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.symbol}
                        onChange={(e) =>
                          handleRowChange(row.id, 'symbol', e.target.value)
                        }
                        placeholder="BTC/USD"
                        className="w-full bg-transparent border border-white/10 rounded px-1 py-0.5 text-[10px] outline-none focus:border-cyan-400/60 uppercase"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={row.side}
                        onChange={(e) =>
                          handleRowChange(row.id, 'side', e.target.value)
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-1 py-0.5 text-[10px] outline-none focus:border-cyan-400/60"
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </td>
                    <td className="px-2 py-1 text-right">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleRowChange(row.id, 'quantity', e.target.value)
                        }
                        className="w-full bg-transparent border border-white/10 rounded px-1 py-0.5 text-[10px] text-right outline-none focus:border-cyan-400/60"
                      />
                    </td>
                    <td className="px-2 py-1 text-right">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          handleRowChange(row.id, 'price', e.target.value)
                        }
                        className="w-full bg-transparent border border-white/10 rounded px-1 py-0.5 text-[10px] text-right outline-none focus:border-cyan-400/60"
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-[9px] text-white/40 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="text-[10px] text-white/40 uppercase tracking-[0.18em]">
                Symbol Summary
              </div>
              <button
                type="button"
                onClick={addRow}
                className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-200 text-[10px] font-mono border border-cyan-500/40 hover:bg-cyan-500/30"
              >
                + Add Fill
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-white/5 rounded-lg bg-black/30">
              {summary.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[10px] text-white/30 font-mono">
                  Enter fills above to compute lots.
                </div>
              ) : (
                <table className="w-full text-[11px] font-mono text-white/80">
                  <thead className="bg-black/60 sticky top-0 text-white/50">
                    <tr>
                      <th className="px-2 py-1 text-left">Symbol</th>
                      <th className="px-2 py-1 text-right">Realized PnL</th>
                      <th className="px-2 py-1 text-right">Remaining Qty</th>
                      <th className="px-2 py-1 text-right">Avg Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((row) => (
                      <tr key={row.symbol} className="border-t border-white/5">
                        <td className="px-2 py-1">{row.symbol}</td>
                        <td
                          className={`px-2 py-1 text-right ${
                            row.realizedPnl >= 0
                              ? 'text-emerald-300'
                              : 'text-rose-300'
                          }`}
                        >
                          {row.realizedPnl.toFixed(2)}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {row.remainingQty.toFixed(6)}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {row.avgCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </EmpireBox>
  );
};

export default TaxLotCalculatorSquare;

