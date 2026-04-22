import React from "react";
import useSWR from "swr";
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
const fetcher = (url: string) =>
  fetch(url, { headers: API_KEY ? { "X-API-Key": API_KEY } : {} }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });

export default function OrderBook() {
  const symbol = "XBT/USD";
  const { data } = useSWR(`${API_BASE}/api/decision/${encodeURIComponent(symbol)}`, fetcher, { refreshInterval: 5000 });
  const price = data?.price ? data.price.toFixed(2) : "--";
  const mockRows = Array.from({ length: 5 }, (_, i) => ({
    price: price,
    qty: (0.1 + i * 0.1).toFixed(2),
    total: data?.price ? (data.price * (0.1 + i * 0.1)).toFixed(2) : "--",
  }));

  return (
    <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#d6f6ff", mb: 1 }}>
          Order Book
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Price</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.qty}</TableCell>
                <TableCell>{row.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
