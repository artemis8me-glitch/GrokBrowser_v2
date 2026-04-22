import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: "#9cd8ff", fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#d6f6ff" }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#8aa0b5" }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
