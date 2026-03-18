"use client";

import { useEffect, useState } from "react";
import { Save, Shield, Globe, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    siteName: "EduCreator.ai",
    contactEmail: "portexzao@gmail.com",
    isTrialEnabled: true,
    maintenanceMode: false,
  });

  const fetchSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchSettings();
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        alert("Configurações salvas com sucesso!");
      } else {
        alert("Erro ao salvar configurações.");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-white flex items-center gap-2">
        <Loader2 className="animate-spin" /> Carregando configurações...
      </div>
    );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Configurações do Sistema
        </h1>
        <p className="text-gray-400 text-sm">
          Gerencie as preferências globais da plataforma para todos os usuários.
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="text-blue-500" size={20} />
            <h2 className="text-lg font-bold text-white">Geral</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nome do Site
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) =>
                  setConfig({ ...config, siteName: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                E-mail de Suporte
              </label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) =>
                  setConfig({ ...config, contactEmail: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-yellow-500" size={20} />
            <h2 className="text-lg font-bold text-white">Segurança e Acesso</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-white">
                  Permitir Teste Grátis (Trial)
                </p>
                <p className="text-xs text-gray-500">
                  Novos usuários ganham 7 dias de acesso.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.isTrialEnabled}
                onChange={(e) =>
                  setConfig({ ...config, isTrialEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-blue-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-800">
              <div>
                <p className="text-sm font-bold text-white">Modo Manutenção</p>
                <p className="text-xs text-gray-500">
                  Bloqueia o acesso de todos, exceto administradores.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) =>
                  setConfig({ ...config, maintenanceMode: e.target.checked })
                }
                className="w-5 h-5 accent-red-600 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}
