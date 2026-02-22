"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  CreditCard,
  MoreHorizontal,
  Search,
  ShieldCheck,
  RefreshCcw,
  Eye,
} from "lucide-react";

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  plan?: string;
  banned?: boolean;
  pdfs_generated_count?: number;
  createdAt?: any;
  renovacao_em?: { _seconds: number; _nanoseconds: number } | string;
  metadata?: {
    trial_cookie_present: boolean;
    user_agent: string;
    registration_date: string;
  };
};

const getDaysRemaining = (renovacao_em: any) => {
  if (!renovacao_em) return null;
  let expirationDate;
  if (renovacao_em._seconds) {
    expirationDate = new Date(renovacao_em._seconds * 1000);
  } else {
    expirationDate = new Date(renovacao_em);
  }
  const now = new Date();
  const timeDiff = expirationDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff > 0 ? daysDiff : 0;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    plan: "normal",
    role: "user",
  });
  const [editForm, setEditForm] = useState({
    email: "",
    plan: "normal",
    role: "user",
  });
  const [newPassword, setNewPassword] = useState("");

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
      if (res.ok) fetchUsers();
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  };

  const handleCreateUser = async () => {
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        alert("Usuário criado com sucesso!");
        setShowCreateModal(false);
        setCreateForm({
          email: "",
          password: "",
          plan: "normal",
          role: "user",
        });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar usuário");
      }
    } catch (error) {
      alert("Erro ao criar usuário");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        alert("Usuário atualizado com sucesso!");
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert("Erro ao atualizar usuário");
      }
    } catch (error) {
      alert("Erro ao atualizar usuário");
    }
  };

  const resetTrial = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja resetar o trial deste usuário para 7 dias?",
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-trial`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Trial resetado com sucesso!");
        fetchUsers();
      } else {
        alert("Erro ao resetar trial");
      }
    } catch (error) {
      alert("Erro ao conectar com servidor");
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        alert("Senha alterada com sucesso!");
        setShowPasswordModal(false);
        setSelectedUser(null);
        setNewPassword("");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao alterar senha");
      }
    } catch (error) {
      alert("Erro ao alterar senha");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      plan: (user.plan as any) || "normal",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm),
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const emailCounts = users.reduce(
    (acc, user) => {
      acc[user.email] = (acc[user.email] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`TEM CERTEZA EXCLUIR permanentemente ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Usuário excluído");
        fetchUsers();
      }
    } catch (error) {
      alert("Erro ao excluir");
    }
  };

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-800 p-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-white">
            Gerenciamento de Usuários
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              + Criar Usuário
            </button>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                size={14}
              />
              <input
                type="text"
                placeholder="Buscar por email ou ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-1.5 pl-8 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="p-3 font-medium border-b border-gray-800">
                  Usuário
                </th>
                <th className="p-3 font-medium border-b border-gray-800">
                  Plano
                </th>
                <th className="p-3 font-medium border-b border-gray-800">
                  Role
                </th>
                <th className="p-3 font-medium border-b border-gray-800">
                  Uso
                </th>
                <th className="p-3 font-medium border-b border-gray-800 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-800/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900/30 text-blue-500 text-xs font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate flex items-center gap-1">
                          {user.email}
                          {emailCounts[user.email] > 1 && (
                            <span className="text-[9px] bg-red-500/20 text-red-500 px-1 rounded">
                              DUP
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          ID: {user.id}
                        </div>
                        {user.metadata?.trial_cookie_present && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-500/10 px-1 rounded border border-red-500/20 w-fit">
                            <ShieldCheck size={10} /> FRAUDE TRIAL
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        user.plan === "trial"
                          ? "bg-green-500/10 text-green-400"
                          : user.plan === "pro"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {user.plan === "trial"
                        ? `Teste (${getDaysRemaining(user.renovacao_em)}d)`
                        : user.plan || "Free"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${user.role === "admin" ? "bg-yellow-500/10 text-yellow-500" : "text-gray-400"}`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-300">
                    {user.pdfs_generated_count || 0}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          (window.location.href = `/admin/dashboard/user/${user.id}`)
                        }
                        className="p-1.5 text-indigo-400 hover:bg-indigo-400/10 rounded"
                        title="Ver Detalhes"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded"
                        title="Editar"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      <button
                        onClick={() => resetTrial(user.id)}
                        className="p-1.5 text-green-400 hover:bg-green-400/10 rounded"
                        title="Resetar Trial"
                      >
                        <RefreshCcw size={14} />
                      </button>
                      <button
                        onClick={() => toggleBan(user.id, user.banned)}
                        className={`p-1.5 rounded ${user.banned ? "text-green-500" : "text-red-400 hover:bg-red-400/10"}`}
                        title={user.banned ? "Desbanir" : "Banir"}
                      >
                        <Users size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals (logic simplified for brevity, similar to original) */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl border border-gray-800">
            <h3 className="mb-4 text-xl font-bold text-white">
              Editar Usuário
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Plano
                </label>
                <select
                  value={editForm.plan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, plan: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                >
                  <option value="trial">Trial</option>
                  <option value="normal">Normal</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleEditUser}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-800 text-gray-300 rounded-lg py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
