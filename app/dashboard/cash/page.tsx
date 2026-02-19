"use client";

import { useState } from "react";
import { Plus, Wallet, ArrowRight } from "lucide-react";

export default function CashPage() {
  const [income, setIncome] = useState("");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Caixa Diário</h1>
        <p className="text-nubank-gray">
          Controle o que entra e sai do seu caixa hoje.
        </p>
      </header>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Wallet className="text-[#820AD1]" /> Registrar Entrada
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Total do Dia (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-[#820AD1] transition"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações / Serviços Realizados
                </label>
                <textarea
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#820AD1] transition h-32 resize-none"
                  placeholder="Ex: 3 Cortes, 2 Hidratações..."
                ></textarea>
              </div>

              <button className="w-full bg-[#111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition flex items-center justify-center gap-2">
                <Plus size={20} /> Registrar Fechamento
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">Últimos Registros</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold">Ontem (17/02)</p>
                  <p className="text-xs text-gray-500">Segunda-feira</p>
                </div>
                <span className="font-bold text-green-600">+ R$ 1.850,00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold">16/02</p>
                  <p className="text-xs text-gray-500">Domingo</p>
                </div>
                <span className="font-bold text-gray-400">Sem atividades</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Section (The "Safe to Spend" Logic) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-[#820AD1] text-white p-8 rounded-3xl shadow-xl shadow-purple-900/30">
            <h3 className="font-bold text-lg mb-2 opacity-90">
              Distribuição Sugerida
            </h3>
            <p className="text-sm opacity-70 mb-8">
              Baseado na sua entrada de hoje:
            </p>

            <div className="space-y-6 relative z-10">
              <div className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Custos Variáveis/Comissão
                  </span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full w-[30%]"></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Reserva / Depreciação
                  </span>
                  <span className="font-bold">10%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full w-[10%]"></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Custos Fixos (Provisão)
                  </span>
                  <span className="font-bold">20%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-400 h-full w-[20%]"></div>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 mt-8">
                <p className="text-xs opacity-80 mb-1">
                  Sobra Líquida (Para você)
                </p>
                <p className="text-3xl font-bold">40%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <ArrowRight className="text-blue-600" />
            </div>
            <h4 className="font-bold mb-2">Fez retiradas hoje?</h4>
            <p className="text-sm text-gray-500 mb-4">
              Registre se você pegou algum dinheiro do caixa para uso pessoal.
            </p>
            <button className="text-[#820AD1] font-bold text-sm hover:underline">
              Registrar Retirada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
