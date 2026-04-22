import React, { useState } from "react";
import { Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio, TextField, Slider, Button } from "@mui/material";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export default function OrderForm() {
  const [side, setSide] = useState("buy");
  const [symbol] = useState("XBT/USD");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  const submit = async () => {
    await fetch(`${API_BASE}/api/log`, {
      method: "GET",
      headers: API_KEY ? { "X-API-Key": API_KEY } : {},
    });
    // Placeholder: wire to real trading API later
    alert(`Submitted ${side} ${amount} ${symbol} @ ${price || "market"}`);
  };

  return (
    <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#d6f6ff", mb: 1 }}>
          Spot Trade
        </Typography>
        <RadioGroup row value={side} onChange={(e) => setSide(e.target.value)}>
          <FormControlLabel value="buy" control={<Radio size="small" />} label="Buy" />
          <FormControlLabel value="sell" control={<Radio size="small" />} label="Sell" />
        </RadioGroup>
        <TextField label="Symbol" fullWidth size="small" margin="dense" value={symbol} disabled />
        <TextField label="Price" fullWidth size="small" margin="dense" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Market" />
        <TextField label="Amount" fullWidth size="small" margin="dense" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Typography variant="caption" sx={{ color: "#8aa0b5" }}>
          TP/SL
        </Typography>
        <Slider defaultValue={50} size="small" />
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 1 }} onClick={submit}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
