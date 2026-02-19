"use client";

import { Plus, Check, Crown } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Assinaturas e Planos</h1>
          <p className="text-nubank-gray">
            Crie receita recorrente com planos mensais.
          </p>
        </div>
        <button className="bg-[#820AD1] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#6a08a8] transition">
          <Plus size={20} /> Criar Novo Plano
        </button>
      </header>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Plan Card */}
        {[
          {
            name: "Essencial",
            price: "R$ 89,90",
            period: "/mês",
            benefits: ["2 Cortes", "1 Barba", "Agendamento Preferencial"],
            active: 12,
          },
          {
            name: "Vip Club",
            price: "R$ 149,90",
            period: "/mês",
            benefits: [
              "Cortes Ilimitados",
              "Barba Ilimitada",
              "Produtos com 10% OFF",
              "Bebida Grátis",
            ],
            active: 45,
            highlight: true,
          },
          {
            name: "Cronograma Capilar",
            price: "R$ 250,00",
            period: "/ciclo",
            benefits: [
              "4 Hidratações",
              "1 Reconstrução",
              "1 Nutrição",
              "Escova Inclusa",
            ],
            active: 8,
          },
        ].map((plan, i) => (
          <div
            key={i}
            className={`p-8 rounded-[2rem] shadow-sm border relative ${plan.highlight ? "bg-[#820AD1] text-white border-transparent shadow-purple-900/20 shadow-xl transform md:-translate-y-4" : "bg-white border-gray-100 text-[#111]"}`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-[#820AD1] px-4 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                <Crown size={12} fill="currentColor" /> MAIS VENDIDO
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <h3
                className={`text-xl font-bold ${plan.highlight ? "opacity-100" : "text-gray-800"}`}
              >
                {plan.name}
              </h3>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${plan.highlight ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}
              >
                {plan.active} ativos
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span
                className={`text-sm ${plan.highlight ? "opacity-80" : "text-gray-500"}`}
              >
                {plan.period}
              </span>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.benefits.map((b, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <div
                    className={`p-1 rounded-full ${plan.highlight ? "bg-white/20" : "bg-green-100 text-green-600"}`}
                  >
                    <Check size={12} />
                  </div>
                  {b}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${plan.highlight ? "bg-white text-[#820AD1] hover:bg-gray-100" : "bg-[#111] text-white hover:bg-gray-900"}`}
            >
              Editar Plano
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white p-8 rounded-4xl border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">Sugestão da IA</h3>
          <p className="text-sm text-gray-500 max-w-xl">
            Seus clientes do plano "Essencial" costumam comprar produtos extras.
            Crie um plano "Essencial+" por R$ 109,90 incluindo um produto mensal
            para aumentar seu ticket médio.
          </p>
        </div>
        <button className="px-6 py-3 bg-[#F5F5F5] text-[#820AD1] font-bold rounded-xl hover:bg-purple-50 transition">
          Gerar Plano com IA
        </button>
      </div>
    </div>
  );
}
