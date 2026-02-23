"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  ArrowRight,
  Clock,
  BarChart3,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import {
  ViewsChart,
  AttentionMap,
  DeviceChart,
  DeadClickChart,
} from "@/components/admin/AnalyticsCharts";
import TrafficMonitor from "@/components/admin/TrafficMonitor";

type DashboardStats = {
  totalUsers: number;
  activePro: number;
  totalPDFs: number;
  recentUsers: {
    id: string;
    email: string;
    plan: string;
    createdAt?: { _seconds: number } | string;
  }[];
};

type AnalyticsStats = {
  viewsOverTime: { date: string; views: number; visitors: number }[];
  avgSessionDuration: number;
  funnel: { name: string; value: number; drop: number }[];
  totalVisitors: number;
  heatmap: { x: number; y: number; weight: number }[];
  attentionSegments: number[];
  devices: { desktop: number; mobile: number };
  behavior: {
    deadClicks: number;
    totalClicks: number;
    confusionRate: number;
    deadClickInsights: { name: string; value: number }[];
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "stats" | "funnel" | "ux" | "traffic"
  >("stats");

  const fetchData = async (date?: string) => {
    try {
      setLoading(true);
      const analyticsUrl = date
        ? `/api/admin/analytics/stats?date=${date}`
        : `/api/admin/analytics/stats?days=7`;

      const [usersRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch(analyticsUrl),
      ]);

      const usersData = await usersRes.json();
      const analyticsData = await analyticsRes.json();

      const users = usersData.users || [];
      setStats({
        totalUsers: users.length,
        activePro: users.filter((u: { plan: string }) => u.plan === "pro")
          .length,
        totalPDFs: users.reduce(
          (acc: number, curr: { pdf_generated_count?: number }) =>
            acc + (curr.pdf_generated_count || 0),
          0,
        ),
        recentUsers: users.slice(0, 5),
      });

      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchData(date);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}m ${sec}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Painel de Inteligência
          </h1>
          <p className="text-gray-400 text-sm">
            Análise 100% nativa de comportamento e conversão.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-xl border border-gray-700">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg p-1.5"
          />
          <button
            onClick={() => {
              setSelectedDate("");
              fetchData();
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300"
          >
            Limpar
          </button>
          <div className="h-4 w-px bg-gray-700 mx-1"></div>
          <button
            onClick={() => fetchData(selectedDate)}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50"
            title="Atualizar Dados"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "stats" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab("funnel")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "funnel" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
        >
          Funil & Atenção
        </button>
        <button
          onClick={() => setActiveTab("ux")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "ux" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
        >
          Dispositivos & Micro-UX
        </button>
        <button
          onClick={() => setActiveTab("traffic")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "traffic" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
        >
          Tráfego Real
        </button>
      </div>

      {activeTab === "stats" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Usuários"
              value={stats?.totalUsers.toString() || "0"}
              icon={Users}
              trend="+12%"
              trendUp={true}
            />
            <StatsCard
              title="Tempo Sessão"
              value={formatDuration(analytics?.avgSessionDuration || 0)}
              icon={Clock}
              trend="Engajado"
              trendUp={true}
            />
            <StatsCard
              title="Cliques Mortos"
              value={analytics?.behavior?.deadClicks.toString() || "0"}
              icon={Activity}
              trend={
                (analytics?.behavior?.deadClicks || 0) > 20 ? "Alto" : "Normal"
              }
              trendUp={(analytics?.behavior?.deadClicks || 0) < 20}
            />
            <StatsCard
              title="Taxa Confusão"
              value={`${analytics?.behavior?.confusionRate || 0}%`}
              icon={AlertCircle}
              trend="Micro-UX"
              trendUp={true}
            />
          </div>
          <ViewsChart data={analytics?.viewsOverTime || []} />
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold text-white mb-4">
              Usuários Recentes
            </h3>
            <div className="space-y-4">
              {stats?.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-gray-300 font-bold">{u.email}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${u.plan === "pro" ? "bg-blue-500/10 text-blue-400" : "bg-gray-800 text-gray-500"}`}
                  >
                    {u.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "funnel" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-500">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-sm font-black text-gray-400 mb-8 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              Funil de Conversão & Quedas
            </h3>
            <div className="space-y-6">
              {analytics?.funnel.map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-white">
                      {step.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-black">
                      {step.value} users
                    </span>
                  </div>
                  <div className="h-6 bg-gray-800 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-linear-to-r from-blue-600 to-indigo-600"
                      style={{
                        width: `${(step.value / (analytics.funnel[0].value || 1)) * 100}%`,
                      }}
                    />
                    {step.drop > 0 && (
                      <div className="absolute top-0 right-2 h-full flex items-center">
                        <span className="text-[9px] font-black text-red-400 bg-red-400/10 px-1.5 rounded">
                          -{step.drop}% Drop
                        </span>
                      </div>
                    )}
                  </div>
                  {i < analytics.funnel.length - 1 && (
                    <div className="flex justify-center -mb-2 py-1">
                      <ArrowRight
                        size={14}
                        className="rotate-90 text-gray-700"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <AttentionMap segments={analytics?.attentionSegments || []} />
        </div>
      )}

      {activeTab === "ux" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500 items-stretch">
          <DeviceChart data={analytics?.devices || { desktop: 0, mobile: 0 }} />
          <DeadClickChart
            insights={analytics?.behavior?.deadClickInsights || []}
          />

          <div className="lg:col-span-2 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Insight de Navegação
            </h4>
            <div className="text-xs text-gray-300 leading-relaxed font-bold">
              {(analytics?.behavior?.confusionRate || 0) > 15 ? (
                <p className="flex items-center gap-2 text-amber-400">
                  <AlertCircle size={14} />A <strong>Taxa de Confusão</strong>{" "}
                  está alta ({analytics?.behavior.confusionRate}%). Isso indica
                  que usuários estão clicando em elementos não-interativos.
                  Considere destacar melhor os botões reais.
                </p>
              ) : (
                <p className="flex items-center gap-2 text-emerald-400">
                  <Activity size={14} />
                  Experiência de uso saudável. Os usuários estão encontrando e
                  clicando nos elementos corretos com boa precisão.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "traffic" && <TrafficMonitor />}
    </div>
  );
}
