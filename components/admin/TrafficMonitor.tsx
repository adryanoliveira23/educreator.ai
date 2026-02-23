"use client";

import { useEffect, useState } from "react";
import { MapPin, Globe, Clock, Trash2, RefreshCcw, Map } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type TrafficLog = {
  id: string;
  ip: string;
  city: string;
  country: string;
  path: string;
  timestamp: string;
};

export default function TrafficMonitor() {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  const fetchTraffic = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/traffic");
      const data = await res.json();
      setLogs(data.traffic || []);
    } catch (error) {
      console.error("Failed to fetch traffic logs", error);
    } finally {
      setLoading(false);
    }
  };

  const clearOldLogs = async () => {
    if (!confirm("Tem certeza que deseja apagar logs com mais de 24 horas?"))
      return;
    try {
      setCleaning(true);
      const res = await fetch("/api/admin/traffic", { method: "DELETE" });
      const data = await res.json();
      alert(`Limpeza concluída! ${data.deletedCount} logs removidos.`);
      fetchTraffic();
    } catch (error) {
      console.error("Failed to clear logs", error);
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="text-blue-500" size={24} />
            Monitoramento de Tráfego em Tempo Real
          </h2>
          <p className="text-gray-400 text-sm">
            Visualização dos últimos 100 acessos. Dados são limpos diariamente.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTraffic}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button
            onClick={clearOldLogs}
            disabled={cleaning}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-all border border-red-500/20"
          >
            <Trash2 size={16} />
            Limpar (+24h)
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Cidade / IP
                </th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Página
                </th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                  Horário
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-12 text-center text-gray-500 text-sm"
                  >
                    Nenhum tráfego registrado recentemente.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {decodeURIComponent(log.city)}, {log.country}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {log.ip}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 text-[10px] font-bold text-gray-300">
                        <Map size={10} />
                        {log.path}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-[10px] font-bold text-gray-400 flex items-center justify-end gap-1.5">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
