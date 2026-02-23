"use client";

import React, { useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ClickCoord {
  x: number;
  y: number;
  weight: number;
}

export function ViewsChart({ data }: { data: any[] }) {
  return (
    <div className="h-[350px] w-full bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
      <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp size={16} className="text-blue-500" />
        Visualizações vs Visitantes
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#4b5563"
            fontSize={12}
            tickFormatter={(str) => str.split("-").slice(1).join("/")}
          />
          <YAxis stroke="#4b5563" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Visualizações"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorViews)"
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="Visitantes"
            stroke="#10b981"
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HeatmapViewer({ clicks }: { clicks: ClickCoord[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap dots
    clicks.forEach((click) => {
      const x = (click.x / 100) * canvas.width;
      const y = (click.y / 100) * canvas.height;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.4)");
      gradient.addColorStop(0.5, "rgba(255, 255, 0, 0.1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [clicks]);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col items-center justify-center">
        <span className="text-gray-500 text-xs">
          PREVIEW DA PÁGINA (ESTÁTICO)
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={1200}
        className="w-full h-auto cursor-crosshair"
      />
    </div>
  );
}

export function AttentionMap({ segments }: { segments: number[] }) {
  const maxTime = Math.max(...segments, 1);
  const segmentLabels = [
    "Hero",
    "Intro",
    "Demo",
    "Solução",
    "Steps",
    "Depoimentos",
    "Preços",
    "FAQ",
    "CTA Final",
    "Footer",
  ];

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
      <h3 className="text-sm font-medium text-gray-400 mb-6 font-black uppercase tracking-widest">
        Mapa de Atenção (Stop-points)
      </h3>
      <div className="space-y-3">
        {segments.map((time, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[10px] text-gray-500 w-20 truncate">
              {segmentLabels[i]}
            </span>
            <div className="flex-grow h-4 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  time / maxTime > 0.7
                    ? "bg-red-500"
                    : time / maxTime > 0.3
                      ? "bg-orange-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${(time / maxTime) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 w-12 text-right">
              {Math.round(time)}s
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] text-gray-500 italic">
        * Segmentos de 10% da vertical da página. Tons quentes indicam maior
        tempo de permanência.
      </p>
    </div>
  );
}
