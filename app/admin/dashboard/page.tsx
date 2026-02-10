"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  plan?: string;
  banned?: boolean;
  pdfs_generated_count?: number;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

        <div className="overflow-x-auto rounded-lg bg-gray-800 shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Plano</th>
                <th className="p-4">PDFs Gerados</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-700 hover:bg-gray-750"
                >
                  <td className="p-4">
                    <div>{user.email}</div>
                    <div className="text-xs text-gray-400">{user.id}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        user.plan === "premium"
                          ? "bg-purple-900 text-purple-200"
                          : user.plan === "pro"
                            ? "bg-blue-900 text-blue-200"
                            : "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {user.plan || "Free"}
                    </span>
                  </td>
                  <td className="p-4">{user.pdfs_generated_count || 0}</td>
                  <td className="p-4">
                    {user.banned ? (
                      <span className="text-red-400 font-bold">Banido</span>
                    ) : (
                      <span className="text-green-400">Ativo</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => toggleBan(user.id, user.banned)}
                      className={`rounded px-3 py-1 text-sm font-bold transition ${
                        user.banned
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {user.banned ? "Desbanir" : "Banir"}
                    </button>
                    <Link
                      href={`/admin/dashboard/user/${user.id}`}
                      className="rounded bg-gray-600 px-3 py-1 text-sm font-bold hover:bg-gray-500 transition"
                    >
                      Histórico
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
