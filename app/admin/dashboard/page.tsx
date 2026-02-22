"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  CreditCard,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";

type DashboardStats = {
  totalUsers: number;
  activePro: number;
  totalPDFs: number;
  recentUsers: any[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      const users = data.users || [];

      setStats({
        totalUsers: users.length,
        activePro: users.filter((u: any) => u.plan === "pro").length,
        totalPDFs: users.reduce(
          (acc: number, curr: any) => acc + (curr.pdfs_generated_count || 0),
          0,
        ),
        recentUsers: users.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading)
    return <div className="p-8 text-white">Carregando overview...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Painel de Controle
        </h1>
        <p className="text-gray-400 text-sm">
          Resumo operacional da plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Usuários"
          value={stats?.totalUsers.toString() || "0"}
          icon={Users}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Assinaturas Pro"
          value={stats?.activePro.toString() || "0"}
          icon={CreditCard}
          trend="+5%"
          trendUp={true}
        />
        <StatsCard
          title="Total de Atividades"
          value={stats?.totalPDFs.toString() || "0"}
          icon={FileText}
          trend="+22%"
          trendUp={true}
        />
        <StatsCard
          title="Taxa de Conversão"
          value="8.4%"
          icon={TrendingUp}
          trend="+1.2%"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Users List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              Usuários Recentes
            </h2>
            <Link
              href="/admin/dashboard/users"
              className="text-blue-500 text-xs font-bold hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-800">
            {stats?.recentUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.email}</p>
                    <p className="text-[10px] text-gray-500">ID: {user.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gray-500">Criado em</p>
                    <p className="text-xs text-gray-300">
                      {user.createdAt?._seconds
                        ? new Date(
                            user.createdAt._seconds * 1000,
                          ).toLocaleDateString("pt-BR")
                        : user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                          : "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                      user.plan === "pro"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {user.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
