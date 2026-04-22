import React, { useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, Typography } from "@mui/material";
import dynamic from "next/dynamic";

// Lazy-load Plotly for Next.js
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
const fetcher = (url: string) =>
  fetch(url, { headers: API_KEY ? { "X-API-Key": API_KEY } : {} }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });

export default function ChartPanel() {
  const symbol = "XBT/USD";
  const { data } = useSWR(`${API_BASE}/api/ohlc/${encodeURIComponent(symbol)}?limit=200`, fetcher, { refreshInterval: 5000 });

  const { x, y } = useMemo(() => {
    if (!Array.isArray(data)) return { x: [], y: [] };
    const xs: number[] = [];
    const ys: number[] = [];
    data.forEach((row: any) => {
      xs.push(row.timestamp);
      ys.push(row.close);
    });
    return { x: xs, y: ys };
  }, [data]);

  return (
    <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#d6f6ff", mb: 1 }}>
          {symbol} Price
        </Typography>
        <Plot
          data={[{ x, y, type: "scatter", mode: "lines", marker: { color: "#22ecb9" } }]}
          layout={{ autosize: true, height: 360, margin: { l: 20, r: 20, t: 10, b: 30 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)" }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </CardContent>
    </Card>
  );
}
