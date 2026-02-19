"use client";

import { useEffect, useState } from "react";
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
  renovacao_em?: { _seconds: number; _nanoseconds: number } | string; // Timestamp from Firestore
};

const getDaysRemaining = (renovacao_em: any) => {
  if (!renovacao_em) return null;

  let expirationDate;
  // Handle Firestore Timestamp
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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
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
      if (res.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  };

  // toggleRole removed as requested by cleanup of unused features

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
      plan: user.plan || "normal",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
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

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Detect duplicate emails
  const emailCounts = users.reduce(
    (acc, user) => {
      acc[user.email] = (acc[user.email] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleDeleteUser = async (id: string, email: string) => {
    if (
      !confirm(
        `TEM CERTEZA que deseja excluir permanentemente o usuário ${email}? Esta ação não pode ser desfeita.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/users/${id}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Usuário excluído com sucesso");
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir usuário");
      }
    } catch (error) {
      alert("Erro ao conectar ao servidor");
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-8 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-800 p-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-white">Usuários</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              + Criar
            </button>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                size={14}
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:w-48"
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
                <th className="p-3 font-medium border-b border-gray-800">
                  Status
                </th>
                <th className="p-3 font-medium border-b border-gray-800 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-gray-800/50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900/30 text-blue-500 text-xs font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate flex items-center gap-1">
                            {user.email}
                            {emailCounts[user.email] > 1 && (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 font-bold"
                                title="E-mail duplicado"
                              >
                                DUPLICADO
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-start">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            user.plan === "trial"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : user.plan === "premium"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : user.plan === "pro"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                          }`}
                        >
                          {user.plan === "trial"
                            ? "Teste"
                            : user.plan || "Free"}
                        </span>
                        {user.plan === "trial" && user.renovacao_em && (
                          <span className="text-[10px] text-green-400/80 mt-0.5">
                            {getDaysRemaining(user.renovacao_em)}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          user.role === "admin"
                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {user.pdfs_generated_count || 0}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
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
                        {user.banned ? "Ban" : "Ok"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded text-blue-400 hover:bg-blue-400/10 transition"
                          title="Editar"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-1.5 rounded text-yellow-500 hover:bg-yellow-500/10 transition"
                          title="Mudar Senha"
                        >
                          <CreditCard size={14} />
                        </button>
                        <button
                          onClick={() => toggleBan(user.id, user.banned)}
                          className={`p-1.5 rounded transition ${
                            user.banned
                              ? "text-green-500 hover:bg-green-500/10"
                              : "text-red-400 hover:bg-red-400/10"
                          }`}
                          title={user.banned ? "Desbanir" : "Banir"}
                        >
                          <Users size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-600/10 transition"
                          title="Excluir"
                        >
                          <FileText size={14} />
                        </button>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-800 p-4">
            <div className="text-xs text-gray-500">
              Mostrando{" "}
              <span className="font-medium text-white">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              até{" "}
              <span className="font-medium text-white">
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </span>{" "}
              de{" "}
              <span className="font-medium text-white">
                {filteredUsers.length}
              </span>{" "}
              usuários
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show current page, first, last, and neighbors
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-500 px-1">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">
              Criar Novo Usuário
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-white focus:outline-none ${
                    emailCounts[createForm.email] > 0
                      ? "border-red-500 bg-red-500/10 focus:border-red-500"
                      : "border-gray-700 bg-gray-800 focus:border-blue-500"
                  }`}
                  placeholder="usuario@exemplo.com"
                />
                {emailCounts[createForm.email] > 0 && (
                  <p className="mt-1 text-[10px] font-bold text-red-500 animate-pulse">
                    ESTE E-MAIL JÁ EXISTE NO SISTEMA E NÃO PODE SER DUPLICADO.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Senha
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Plano
                </label>
                <select
                  value={createForm.plan}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, plan: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCreateUser}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Criar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl">
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
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
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
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleEditUser}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">Alterar Senha</h3>
            <p className="mb-4 text-sm text-gray-400">
              Usuário: {selectedUser.email}
            </p>
            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleChangePassword}
                className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-700"
              >
                Alterar
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword("");
                }}
                className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
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
