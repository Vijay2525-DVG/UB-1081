"use client";

import { useEffect, useRef } from "react";
import React from "react";

interface TrendChartProps {
  data: number[];
  label: string;
  color: string;
  forecastColor: string;
}

export default function TrendChart({ data, label, color, forecastColor }: TrendChartProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate min/max values
    const minVal = Math.min(...data) - 5;
    const maxVal = Math.max(...data) + 5;

    // Draw grid lines
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    for (let i = 0; i <= 5; i++) {
      const val = maxVal - ((maxVal - minVal) / 5) * i;
      const y = padding.top + (chartHeight / 5) * i;
      ctx.textAlign = "right";
      ctx.fillText(val.toFixed(1), padding.left - 10, y + 4);
    }

    // Draw X-axis labels
    ctx.textAlign = "center";
    const labelInterval = Math.ceil(data.length / 6);
    for (let i = 0; i < data.length; i += labelInterval) {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      ctx.fillText(`D${i + 1}`, x, height - 10);
    }

    // Draw data line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((value, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y = padding.top + chartHeight - ((value - minVal) / (maxVal - minVal)) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    data.forEach((value, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y = padding.top + chartHeight - ((value - minVal) / (maxVal - minVal)) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#1a2332";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw legend
    const legendY = 15;
    ctx.font = "11px Inter, sans-serif";
    
    // Actual
    ctx.fillStyle = color;
    ctx.fillRect(width - 100, legendY, 20, 3);
    ctx.fillStyle = "#f1f5f9";
    ctx.textAlign = "left";
    ctx.fillText("30-Day Trend", width - 75, legendY + 5);

  }, [data, color, forecastColor, label]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center text-text-secondary">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-[250px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
