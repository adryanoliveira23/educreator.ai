"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  CreditCard,
  MoreHorizontal,
  Search,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  plan?: string;
  banned?: boolean;
  pdfs_generated_count?: number;
  createdAt?: any;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (id: string, currentStatus?: boolean) => {
    if (
      !confirm(
        `Tem certeza que deseja ${currentStatus ? "desbanir" : "banir"} este usuário?`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !currentStatus }),
      });
      if (res.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  };

  const toggleRole = async (id: string, currentRole?: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      !confirm(
        `Tem certeza que deseja mudar este usuário para ${newRole === "admin" ? "Administrador" : "Usuário"}?`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      alert("Erro ao atualizar role");
    }
  };

  // Derived metrics
  const totalUsers = users.length;
  const activeSubs = users.filter(
    (u) => u.plan === "pro" || u.plan === "premium",
  ).length;
  const totalPDFs = users.reduce(
    (acc, curr) => acc + (curr.pdfs_generated_count || 0),
    0,
  );

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm),
  );

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-8 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title="Total de Usuários"
          value={totalUsers.toString()}
          icon={Users}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Assinaturas Ativas"
          value={activeSubs.toString()}
          icon={CreditCard}
          trend="+5%"
          trendUp={true}
        />
        <StatsCard
          title="PDFs Gerados"
          value={totalPDFs.toString()}
          icon={FileText}
          trend="+24%"
          trendUp={true}
        />
      </div>

      {/* Users Table Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-800 p-6 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-white">
            Usuários Recentes
          </h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="p-6 font-medium">Usuário</th>
                <th className="p-6 font-medium">Plano</th>
                <th className="p-6 font-medium">Role</th>
                <th className="p-6 font-medium">Uso (PDFs)</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-gray-800/50"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/30 text-blue-500">
                          <span className="font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.plan === "premium"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : user.plan === "pro"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}
                      >
                        {user.plan
                          ? user.plan.charAt(0).toUpperCase() +
                            user.plan.slice(1)
                          : "Free"}
                      </span>
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="p-6 text-gray-300">
                      {user.pdfs_generated_count || 0}
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.banned
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.banned ? "bg-red-400" : "bg-green-400"
                          }`}
                        ></span>
                        {user.banned ? "Banido" : "Ativo"}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          className="rounded-lg bg-purple-600/10 px-3 py-1.5 text-xs font-medium text-purple-400 transition hover:bg-purple-600/20"
                        >
                          {user.role === "admin" ? "→ Usuário" : "→ Admin"}
                        </button>
                        <button
                          onClick={() => toggleBan(user.id, user.banned)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            user.banned
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-red-600/10 text-red-400 hover:bg-red-600/20"
                          }`}
                        >
                          {user.banned ? "Desbanir" : "Banir"}
                        </button>
                        <Link
                          href={`/admin/dashboard/user/${user.id}`}
                          className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
