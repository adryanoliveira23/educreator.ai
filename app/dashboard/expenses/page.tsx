"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingDown } from "lucide-react";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<"fixed" | "variable">("fixed");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Custos & Despesas</h1>
          <p className="text-nubank-gray">
            Gerencie seus custos fixos e variáveis.
          </p>
        </div>
        <button className="bg-[#820AD1] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#6a08a8] transition">
          <Plus size={20} /> Nova Despesa
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-nubank-gray">
            <TrendingDown size={18} /> Total Custos Fixos
          </div>
          <div className="text-2xl font-bold">R$ 2.400,00</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-nubank-gray">
            <TrendingDown size={18} /> Total Variável (Mês)
          </div>
          <div className="text-2xl font-bold">R$ 850,00</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-nubank-gray">
            <TrendingDown size={18} /> Previsão Total
          </div>
          <div className="text-2xl font-bold text-red-600">R$ 3.250,00</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("fixed")}
          className={`pb-3 px-4 font-bold border-b-2 transition ${activeTab === "fixed" ? "border-[#820AD1] text-[#820AD1]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Custos Fixos (Aluguel, Internet...)
        </button>
        <button
          onClick={() => setActiveTab("variable")}
          className={`pb-3 px-4 font-bold border-b-2 transition ${activeTab === "variable" ? "border-[#820AD1] text-[#820AD1]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Custos Variáveis (Produtos, Comissão...)
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 pl-6 text-sm font-bold text-gray-500">
                Descrição
              </th>
              <th className="p-4 text-sm font-bold text-gray-500">Categoria</th>
              <th className="p-4 text-sm font-bold text-gray-500">Dia Venc.</th>
              <th className="p-4 text-sm font-bold text-gray-500">Valor</th>
              <th className="p-4 text-sm font-bold text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Demo Rows */}
            {[
              {
                desc: "Aluguel da Sala",
                cat: "Estrutura",
                date: "Dia 10",
                val: "R$ 1.500,00",
              },
              {
                desc: "Internet Fibra",
                cat: "Serviços",
                date: "Dia 20",
                val: "R$ 120,00",
              },
              {
                desc: "Sistema de Gestão",
                cat: "Software",
                date: "Dia 05",
                val: "R$ 89,90",
              },
            ].map((getRow, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="p-4 pl-6 font-medium">{getRow.desc}</td>
                <td className="p-4 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold">
                    {getRow.cat}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{getRow.date}</td>
                <td className="p-4 font-bold">{getRow.val}</td>
                <td className="p-4">
                  <button className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Add Row Logic Placeholder */}
            <tr className="bg-[#F5F5F5] border-t-2 border-white/50">
              <td className="p-4 pl-6" colSpan={5}>
                <button className="text-[#820AD1] font-bold text-sm flex items-center gap-2 hover:underline">
                  <Plus size={16} /> Adicionar novo item rápido
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
