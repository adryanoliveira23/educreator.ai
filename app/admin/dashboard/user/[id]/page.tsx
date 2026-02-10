"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Activity = {
  id: string;
  title?: string;
  prompt?: string;
  createdAt?: string;
};

export default function UserHistory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [history, setHistory] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}/history`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading)
    return <div className="p-8 text-white">Carregando histórico...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-blue-400 hover:underline"
          >
            &larr; Voltar
          </Link>
          <h1 className="text-2xl font-bold">Histórico do Usuário: {id}</h1>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-400">Nenhuma atividade encontrada.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded bg-gray-800 p-4 shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-blue-300">
                    {item.title || "Sem título"}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {item.createdAt
                      ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })
                      : "-"}
                  </span>
                </div>
                <p className="text-gray-300 text-sm italic">"{item.prompt}"</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
