"use client";

import { useState } from "react";
import { Target, TrendingUp, Calendar, CheckCircle } from "lucide-react";

export default function GoalsPage() {
  const [target, setTarget] = useState("12.500,00");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Metas & Objetivos</h1>
          <p className="text-nubank-gray">
            Defina onde você quer chegar este mês.
          </p>
        </div>
      </header>

      {/* Main Goal Card */}
      <div className="bg-[#820AD1] text-white p-8 rounded-4xl shadow-xl shadow-purple-900/20 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <Target />
              <span className="font-medium tracking-wide">
                META PRINCIPAL (Fev/2026)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">R$ {target}</span>
              <button className="text-sm opacity-70 hover:opacity-100 underline">
                Editar
              </button>
            </div>
            <p className="mt-4 opacity-80 max-w-md">
              Para bater a meta, você precisa de uma média diária de{" "}
              <strong>R$ 416,00</strong> nos próximos 12 dias.
            </p>
          </div>

          <div className="w-full md:w-1/3">
            <div className="flex justify-between mb-2 text-sm font-bold">
              <span>Progresso</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="bg-white h-full w-[65%] shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            </div>
            <p className="text-xs text-right mt-2 opacity-70">
              Faltam R$ 4.375,00
            </p>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Daily Breakdown */}
        <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Calendar className="text-[#820AD1]" /> Desempenho Diário
          </h3>

          <div className="space-y-4">
            {[
              {
                day: "Hoje (18/02)",
                val: "R$ 450,00",
                target: "R$ 416,00",
                status: "success",
              },
              {
                day: "Ontem (17/02)",
                val: "R$ 380,00",
                target: "R$ 416,00",
                status: "warning",
              },
              {
                day: "16/02",
                val: "R$ 0,00",
                target: "R$ 416,00",
                status: "fail",
              },
              {
                day: "15/02",
                val: "R$ 620,00",
                target: "R$ 416,00",
                status: "success",
              },
            ].map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${d.status === "success" ? "bg-green-500" : d.status === "warning" ? "bg-orange-500" : "bg-red-500"}`}
                  ></div>
                  <span className="font-medium text-sm">{d.day}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{d.val}</p>
                  <p className="text-[10px] text-gray-400">Meta: {d.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="text-[#820AD1]" /> Estratégia do Mês
          </h3>

          <div className="space-y-6">
            <div className="bg-[#F5F5F5] p-5 rounded-3xl">
              <h4 className="font-bold text-sm mb-2">
                🚀 Acelerar Faturamento
              </h4>
              <p className="text-sm text-nubank-gray leading-relaxed">
                Faltam 12 dias. Se você vender{" "}
                <strong>3 Combos de Hidratação</strong> a mais por dia, você
                bate a meta antes do dia 28.
              </p>
              <button className="mt-4 text-[#820AD1] text-sm font-bold hover:underline">
                Ver sugestão de Combo
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3">Conquistas</h4>
              <div className="flex gap-3">
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                  <CheckCircle size={12} /> Meta Semanal Batida
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                  <CheckCircle size={12} /> Recorde Pessoal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
