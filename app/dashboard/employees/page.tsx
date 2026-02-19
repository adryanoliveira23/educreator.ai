"use client";

import { useState } from "react";
import { Plus, FileText, User, MoreVertical } from "lucide-react";

export default function EmployeesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <p className="text-nubank-gray">Gerencie sua equipe e contratos.</p>
        </div>
        <button className="bg-[#820AD1] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#6a08a8] transition">
          <Plus size={20} /> Novo Colaborador
        </button>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee Card */}
        {[
          {
            name: "Mariana Silva",
            role: "Cabeleireira",
            commission: "40%",
            production: "R$ 4.200",
            status: "active",
          },
          {
            name: "João Pedro",
            role: "Barbeiro",
            commission: "35%",
            production: "R$ 3.800",
            status: "active",
          },
          {
            name: "Carla Diaz",
            role: "Manicura",
            commission: "50%",
            production: "R$ 1.200",
            status: "pending_contract",
          },
        ].map((emp, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative group"
          >
            <button className="absolute top-4 right-4 text-gray-400 hover:text-[#820AD1] p-2 hover:bg-gray-50 rounded-full transition">
              <MoreVertical size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <User className="text-gray-400" size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{emp.name}</h3>
                <p className="text-sm text-gray-500">{emp.role}</p>
                {emp.status === "pending_contract" && (
                  <span className="inline-block mt-1 text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">
                    Contrato Pendente
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Comissão</span>
                <span className="font-bold">{emp.commission}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Produção (Mês)</span>
                <span className="font-bold text-[#820AD1]">
                  {emp.production}
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50">
              <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-700 hover:text-[#820AD1] hover:bg-purple-50 rounded-xl transition">
                <FileText size={16} /> Gerar Contrato PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
