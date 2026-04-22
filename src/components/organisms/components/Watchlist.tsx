import React from "react";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText } from "@mui/material";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const fetcher = (url: string) =>
  fetch(url, { headers: API_KEY ? { "X-API-Key": API_KEY } : {} }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });

export default function Watchlist() {
  const { data: symbols } = useSWR<string[]>(`${API_BASE}/api/symbols`, fetcher, { refreshInterval: 30_000 });
  const [lastPriceMap, setLastPriceMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;
    let wsUrl = (process.env.NEXT_PUBLIC_WS_URL as string) || API_BASE.replace("http", "ws") + "/ws/prices";
    if (API_KEY) {
      wsUrl += wsUrl.includes("?") ? `&api_key=${API_KEY}` : `?api_key=${API_KEY}`;
    }
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.symbol && msg.close) {
          setLastPriceMap((prev) => ({ ...prev, [msg.symbol]: msg.close }));
        }
      } catch (err) {
        // ignore parse errors
      }
    };
    return () => ws.close();
  }, [symbols]);

  const items = (symbols || []).slice(0, 6).map((sym) => ({ symbol: sym, price: lastPriceMap[sym] ?? "--" }));

  return (
    <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#d6f6ff", mb: 1 }}>
          Watchlist
        </Typography>
        <List dense>
          {items.map((row) => (
            <ListItem key={row.symbol} sx={{ py: 0.5 }}>
              <ListItemText
                primary={row.symbol}
                secondary={`$${row.price}`}
                primaryTypographyProps={{ color: "#e8f1f2" }}
                secondaryTypographyProps={{ color: "#8aa0b5" }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
