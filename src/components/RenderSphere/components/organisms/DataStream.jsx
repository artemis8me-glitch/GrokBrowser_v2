import React, { useState, useEffect, useRef } from 'react';

const DataStream = () => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('CONNECTING');
  const endRef = useRef(null);

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      try {
        ws = new WebSocket('wss://coinbot-empire-2025.uc.r.app/api/ws/alerts');
      } catch (e) {
        console.error('DataStream WebSocket init error:', e);
        setStatus('ERROR');
        return;
      }

      ws.onopen = () => {
        setStatus('LIVE');
      };

      ws.onmessage = (event) => {
        const raw = event.data;
        let line = '';
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const ts = parsed.timestamp || parsed.ts;
            const level = parsed.level || parsed.type || 'INFO';
            const msg = parsed.message || parsed.text || JSON.stringify(parsed);
            const timeLabel =
              typeof ts === 'string'
                ? ts
                : new Date().toISOString().split('T')[1].slice(0, 8);
            line = `[${timeLabel}] ${level.toUpperCase()}: ${msg}`;
          } else {
            line = String(raw);
          }
        } catch {
          line = String(raw);
        }

        setLogs((prev) => {
          const next = [...prev, line];
          if (next.length > 50) next.shift();
          return next;
        });
      };

      ws.onerror = (event) => {
        console.error('DataStream WebSocket error:', event);
        setStatus('ERROR');
      };

      ws.onclose = () => {
        setStatus('OFFLINE');
        reconnectTimer = window.setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl shadow-2xl text-white w-full max-w-2xl mt-6 font-mono text-xs h-64 flex flex-col hover:border-blue-400/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}
          ></div>
          <h3 className="font-bold text-blue-400 tracking-wider">ALERT FEED</h3>
        </div>
        <div className="text-gray-500 text-[10px]">
          CH01 // {status}
        </div>
      </div>

      <div className="overflow-y-hidden flex-1 flex flex-col justify-end space-y-1 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/80 pointer-events-none"></div>
        {logs.map((log, i) => {
          const parts = log.split(']');
          const prefix = parts[0] + (parts.length > 1 ? ']' : '');
          const rest = parts.slice(1).join(']');
          const isWarn = /WARN|WARNING/i.test(rest);
          const isTrade = /TRADE/i.test(rest);
          const color = isWarn
            ? 'text-yellow-400'
            : isTrade
            ? 'text-emerald-400'
            : 'text-gray-300';
          return (
            <div key={i} className="text-blue-100/80 border-l-2 border-blue-500/20 pl-2">
              <span className="opacity-50 mr-2">{prefix}</span>
              <span className={color}>{rest}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default DataStream;
