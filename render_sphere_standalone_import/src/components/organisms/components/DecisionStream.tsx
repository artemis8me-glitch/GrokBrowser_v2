import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem, Button, Stack, TextField } from "@mui/material";
import useSWR from "swr";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
const WS_DECISIONS =
  process.env.NEXT_PUBLIC_WS_DECISIONS || API_BASE.replace("http", "ws") + "/ws/decisions";

type DecisionMsg = {
  symbol: string;
  action: string;
  reason?: string;
  confidence?: number;
  price?: number;
  ts?: string;
};

export default function DecisionStream() {
  const [items, setItems] = useState<DecisionMsg[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [symbol, setSymbol] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const { data: plan } = useSWR(`${API_BASE}/api/userplan`, fetcher, {
    refreshInterval: 60_000,
  });
  const fetcher = (url: string) =>
    fetch(url, { headers: API_KEY ? { "X-API-Key": API_KEY } : {} }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    });

  // preload history with pagination/filter
  const historyKey = `${API_BASE}/api/decisions?limit=${pageSize}&offset=${page * pageSize}${
    actionFilter !== "all" ? `&action=${actionFilter}` : ""
  }${search ? `&search=${encodeURIComponent(search)}` : ""}${symbol !== "ALL" ? `&symbol=${encodeURIComponent(symbol)}` : ""}`;
  useSWR(historyKey, fetcher, {
    onSuccess: (resp) => {
      const data = resp?.data || [];
      if (typeof resp?.total === "number") setTotal(resp.total);
      setItems((prev) => {
        const merged = [...data, ...prev];
        const seen = new Set<string>();
        return merged
          .filter((d) => {
            const key = `${d.ts || d.timestamp || ""}-${d.symbol}-${d.action}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 200);
      });
    },
  });

  useEffect(() => {
    let url = WS_DECISIONS;
    if (API_KEY) {
      url += url.includes("?") ? `&api_key=${API_KEY}` : `?api_key=${API_KEY}`;
    }
    const ws = new WebSocket(url);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as DecisionMsg;
        setItems((prev) => [msg, ...prev].slice(0, 200));
      } catch {
        // ignore bad messages
      }
    };
    return () => ws.close();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((d) =>
        (actionFilter === "all" ? true : d.action === actionFilter) &&
        (symbol === "ALL" ? true : d.symbol === symbol)
      ),
    [items, actionFilter, symbol]
  );

  return (
    <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#d6f6ff", mb: 1 }}>
          Decisions (live)
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {plan && (
            <Typography variant="caption" sx={{ color: "#8aa0b5", alignSelf: "center" }}>
              Tier: {plan.tier} • Rate/min: {plan.limits?.rate_per_min} • Delay: {plan.limits?.delay_sec}s
            </Typography>
          )}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="symbol-filter">Symbol</InputLabel>
            <Select
              labelId="symbol-filter"
              value={symbol}
              label="Symbol"
              onChange={(e) => {
                setItems([]);
                setPage(0);
                setSymbol(e.target.value);
              }}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="XBT/USD">XBT/USD</MenuItem>
              <MenuItem value="ETH/USD">ETH/USD</MenuItem>
              <MenuItem value="SOL/USD">SOL/USD</MenuItem>
              <MenuItem value="ADA/USD">ADA/USD</MenuItem>
              <MenuItem value="DOT/USD">DOT/USD</MenuItem>
              <MenuItem value="DOGE/USD">DOGE/USD</MenuItem>
              <MenuItem value="LINK/USD">LINK/USD</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="action-filter">Action</InputLabel>
            <Select
              labelId="action-filter"
              value={actionFilter}
              label="Action"
              onChange={(e) => {
                setItems([]);
                setPage(0);
                setActionFilter(e.target.value);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
              <MenuItem value="hold">Hold</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => {
              setItems([]);
              setPage(0);
              setSearch(e.target.value);
            }}
          />
          <Button variant="outlined" size="small" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
          {total !== null && (
            <Typography variant="caption" sx={{ alignSelf: "center", color: "#8aa0b5" }}>
              {Math.min((page + 1) * pageSize, total)} / {total}
            </Typography>
          )}
        </Stack>
        <List dense>
          {filtered.map((d, idx) => (
            <ListItem key={idx} sx={{ py: 0.5 }}>
              <ListItemText
                primary={`${d.symbol} → ${d.action?.toUpperCase() || "-"}`}
                secondary={`$${d.price ?? "--"} • Conf ${(d.confidence ?? 0) * 100}% • ${d.reason || ""}`}
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
