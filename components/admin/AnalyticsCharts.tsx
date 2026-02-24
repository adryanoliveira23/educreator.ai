"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Monitor, MousePointerClick } from "lucide-react";

const DEVICE_COLORS = {
  desktop: "#3b82f6",
  mobile: "#6366f1",
};

export function ViewsChart({
  data,
}: {
  data: Array<{ date: string; views: number; visitors: number }>;
}) {
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

export function DeviceChart({
  data,
}: {
  data: { desktop: number; mobile: number };
}) {
  const chartData = [
    { name: "Desktop", value: data.desktop, key: "desktop" },
    { name: "Mobile", value: data.mobile, key: "mobile" },
  ];

  return (
    <div className="h-full bg-gray-900/50 p-6 rounded-2xl border border-gray-800 flex flex-col">
      <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <Monitor size={16} className="text-blue-500" />
        Distribuição por Dispositivo
      </h3>
      <div className="grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={DEVICE_COLORS[entry.key as keyof typeof DEVICE_COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "none",
                borderRadius: "12px",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DeadClickChart({
  insights,
}: {
  insights: { name: string; value: number }[];
}) {
  return (
    <div className="h-full bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
      <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <MousePointerClick size={16} className="text-red-500" />
        Cliques Mortos por Elemento
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={insights}
          layout="vertical"
          margin={{ left: 40, right: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            horizontal={true}
            vertical={false}
          />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#9ca3af"
            fontSize={10}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: "#111827",
              border: "none",
              borderRadius: "12px",
            }}
          />
          <Bar
            dataKey="value"
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AttentionMap({ segments }: { segments: number[] }) {
  const maxTime = Math.max(...segments, 1);
  const totalTime = segments.reduce((a, b) => a + b, 0);
  const segmentLabels = [
    "Topo (Início)",
    "Vídeo/Apresentação",
    "Demonstração da IA",
    "Benefícios Principais",
    "Como Funciona",
    "Prova Social",
    "Tabela de Preços",
    "FAQ (Dúvidas)",
    "Chamada Final",
    "Rodapé",
  ];

  return (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-4 bg-blue-500 rounded-sm"></div>
          Mapa de Atenção
        </h3>
        <p className="text-[10px] text-gray-500 mt-1 font-medium">
          Onde os visitantes passam mais tempo lendo seu site.
        </p>
      </div>

      <div className="space-y-4">
        {segments.map((time, i) => {
          const percentage = totalTime > 0 ? (time / totalTime) * 100 : 0;
          const relativeStrength = time / maxTime;

          return (
            <div key={i} className="group">
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                  {segmentLabels[i]}
                </span>
                <span className="text-[10px] font-medium text-gray-500">
                  {percentage.toFixed(1)}% do tempo
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-grow h-3 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${
                      relativeStrength > 0.7
                        ? "bg-linear-to-r from-red-600 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : relativeStrength > 0.3
                          ? "bg-linear-to-r from-orange-500 to-yellow-400"
                          : "bg-linear-to-r from-blue-600 to-indigo-500"
                    }`}
                    style={{ width: `${relativeStrength * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-gray-300 w-10 text-right">
                  {Math.round(time)}s
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-gray-500">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div> Baixa
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div> Média
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-2 rounded-full bg-red-500"></div> Alta
        </div>
      </div>
    </div>
  );
}
