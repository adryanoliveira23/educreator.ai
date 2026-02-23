"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Plus,
  Trash2,
  Loader2,
  Search,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";

type BlockedIp = {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
};

export default function BlockedIpsPage() {
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newReason, setNewReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBlockedIps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blocked-ips");
      const data = await res.json();
      setBlockedIps(data.blockedIps || []);
    } catch (error) {
      console.error("Error fetching blocked IPs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedIps();
  }, []);

  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIp, reason: newReason }),
      });

      if (res.ok) {
        setNewIp("");
        setNewReason("");
        fetchBlockedIps();
      }
    } catch (error) {
      console.error("Error blocking IP:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblockIp = async (id: string) => {
    if (!confirm("Tem certeza que deseja desbloquear este IP?")) return;

    try {
      const res = await fetch(`/api/admin/blocked-ips?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBlockedIps();
      }
    } catch (error) {
      console.error("Error unblocking IP:", error);
    }
  };

  const filteredIps = blockedIps.filter(
    (item) =>
      item.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            IPs Bloqueados
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie e monitore IPs que foram restringidos no sistema.
          </p>
        </div>
        <button
          onClick={fetchBlockedIps}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-blue-500 hover:border-blue-500/50 transition-all disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          Atualizar Tabela
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form para Bloquear */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm sticky top-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-500" />
              Bloquear Novo IP
            </h3>
            <form onSubmit={handleBlockIp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Endereço IP
                </label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="Ex: 192.168.1.1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Motivo (Opcional)
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Por que este IP está sendo bloqueado?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Bloquear IP"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de IPs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por IP ou motivo..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p>Carregando IPs...</p>
              </div>
            ) : filteredIps.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-gray-800/50 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Endereço IP</th>
                    <th className="px-6 py-4">Motivo</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredIps.map((ip) => (
                    <tr
                      key={ip.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-blue-400">
                        {ip.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {ip.reason}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(ip.blockedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnblockIp(ip.id)}
                          className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20"
                          title="Desbloquear"
                        >
                          <ShieldCheck size={14} />
                          Desbloquear
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>Nenhum IP bloqueado encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
