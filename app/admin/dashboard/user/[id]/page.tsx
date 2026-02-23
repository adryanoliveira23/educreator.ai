"use client";

import { useEffect, useState, use as useReact } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  FileText,
} from "lucide-react";

type ActivityItem = {
  id: string;
  title?: string;
  prompt?: string;
  createdAt?: string;
  type?: string;
};

type UserData = {
  id: string;
  email: string;
  plan: string;
  role: string;
  whatsapp?: string;
  pdfs_generated_count: number;
  createdAt?: string;
  metadata?: {
    last_ip?: string;
    whitelisted_ips?: string[];
  };
};

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<{
    user: UserData;
    history: ActivityItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useReact(params);
  const decodedId = decodeURIComponent(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/users/${decodedId}/history`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [decodedId]);

  if (loading)
    return (
      <div className="p-8 text-white min-h-screen bg-gray-950">
        Carregando detalhes...
      </div>
    );
  if (!data?.user)
    return (
      <div className="p-8 text-white min-h-screen bg-gray-950">
        Usuário não encontrado.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/users"
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>
        </div>

        {/* User Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500">
                <User size={40} />
              </div>
              <div>
                <h2 className="font-bold text-lg truncate max-w-full">
                  {data.user.email}
                </h2>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-gray-500 text-[10px] break-all">
                    ID: {data.user.id}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] self-center ${data.user.role === "admin" ? "bg-yellow-500/10 text-yellow-500" : "bg-gray-500/10 text-gray-400"}`}
                  >
                    {data.user.role === "admin" ? "Administrador" : "Usuário"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <CreditCard size={16} />
                  <span>Plano</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                    data.user.plan === "trial"
                      ? "bg-green-500/10 text-green-400"
                      : data.user.plan === "pro"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {data.user.plan}
                </span>
              </div>

              {data.user.whatsapp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Mail size={16} />
                    <span>WhatsApp</span>
                  </div>
                  <a
                    href={`https://wa.me/${data.user.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 text-xs font-bold hover:underline"
                  >
                    {data.user.whatsapp}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FileText size={16} />
                  <span>PDFs Gerados</span>
                </div>
                <span className="text-white font-bold">
                  {data.user.pdfs_generated_count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar size={16} />
                  <span>Membro desde</span>
                </div>
                <span className="text-white text-xs text-right">
                  {data.user.createdAt
                    ? format(
                        new Date(data.user.createdAt),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: ptBR,
                        },
                      )
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold mb-2">
              <Activity className="text-indigo-500" size={24} />
              <h2>Histórico de Atividades</h2>
            </div>

            <div className="space-y-4">
              {data.history.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
                  Nenhuma atividade registrada ainda.
                </div>
              ) : (
                data.history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition shadow-sm group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h3 className="font-black text-blue-400 group-hover:text-blue-300 transition-colors">
                          {item.title}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 font-bold uppercase">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {item.createdAt
                          ? format(
                              new Date(item.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )
                          : "-"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs italic line-clamp-2">
                      &quot;{item.prompt}&quot;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
