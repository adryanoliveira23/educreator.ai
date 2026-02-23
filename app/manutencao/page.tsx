"use client";

import React from "react";
import { Wrench, AlertTriangle, Clock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
            <div className="bg-linear-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl shadow-2xl relative border border-white/10">
              <Wrench className="w-16 h-16 text-[#0a0a0a]" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 p-2 rounded-full border-2 border-[#0a0a0a] animate-bounce">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent">
          ESTAMOS EM <br />
          <span className="text-yellow-500">MANUTENÇÃO</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto">
          Nosso sistema está passando por uma manutenção rápida para garantir a
          melhor experiência para você. Voltaremos em instantes!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition-all hover:bg-white/10 group">
            <Clock className="w-8 h-8 text-yellow-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="font-bold mb-1 text-white">Rápido</h3>
            <p className="text-sm text-gray-500">Ajustes técnicos</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition-all hover:bg-white/10 group">
            <Wrench className="w-8 h-8 text-blue-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="font-bold mb-1 text-white">Estável</h3>
            <p className="text-sm text-gray-500">Melhorias no servidor</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition-all hover:bg-white/10 group">
            <AlertTriangle className="w-8 h-8 text-purple-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="font-bold mb-1 text-white">Seguro</h3>
            <p className="text-sm text-gray-500">Sincronização de dados</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Acompanhando o status em tempo real
        </div>

        <div className="mt-16 text-gray-600 text-sm uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} EDUCREATOR.AI
        </div>
      </div>
    </div>
  );
}
