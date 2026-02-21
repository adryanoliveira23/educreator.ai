"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Zap,
  FileText,
  ArrowRight,
  MousePointer2,
  Sparkles,
  Check,
  Download,
} from "lucide-react";

type DemoStep = {
  type: "user" | "ai_generating" | "ai_result";
  text?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  preview?: string;
};

const DEMO_STEPS: DemoStep[] = [
  {
    type: "user",
    text: "Crie uma atividade de matemática para o 3º ano sobre frações usando fatias de pizza. Inclua um desenho animado para ilustrar!",
  },
  {
    type: "ai_generating",
  },
  {
    type: "ai_result",
    title: "🍕 Frações Deliciosas: Aprendendo com Pizza",
    description:
      "EduCreator gerou uma atividade completa alinhada à BNCC (EF03MA09).",
    imageUrl: "/demo-pizza.svg", // Imagem local (desenho animado)
    preview:
      "1. João pediu uma pizza dividida em 8 fatias iguais. Se ele comeu 3 fatias, qual fração da pizza restou?\n\na) 3/8\nb) 5/8\nc) 8/3\nd) 1/2",
  },
];

export default function InteractiveDemo() {
  const [step, setStep] = useState(-1);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    // Start the demo after a short delay
    const startTimeout = setTimeout(() => {
      setStep(0);
    }, 1000);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (step === 0) {
      // Type user prompt
      setIsTyping(true);
      const text = DEMO_STEPS[0].text as string;
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i));
        i++;
        if (i > text.length) {
          clearInterval(interval);
          setIsTyping(false);
          // Wait and move to next step
          setTimeout(() => setStep(1), 800);
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (step === 1) {
      // AI generating
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setStep(2);
      }, 2000);
    } else if (step === 2) {
      // Show result
      setShowResult(true);
    }
  }, [step]);

  const resetDemo = () => {
    setStep(-1);
    setDisplayedText("");
    setIsTyping(false);
    setShowResult(false);
    setIsGenerating(false);
    setDownloaded(false);
    setTimeout(() => setStep(0), 500);
  };

  return (
    <div className="relative max-w-5xl mx-auto group">
      {/* Decorative glow */}
      <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-4xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

      <div className="relative bg-white rounded-4xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Browser Header */}
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400/50"></div>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} className="text-blue-500" />
            EduCreator AI - Painel do Professor
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex flex-col md:flex-row h-[550px]">
          {/* Mock Sidebar */}
          <div className="hidden md:block w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-6">
            <div className="h-10 w-full bg-blue-600 rounded-xl flex items-center justify-center gap-2 text-white text-xs font-bold shadow-md shadow-blue-100">
              <Zap size={14} fill="white" /> Nova Atividade
            </div>

            <div className="space-y-4 pt-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                Menu
              </div>
              <div className="h-4 w-3/4 bg-blue-100/50 rounded-lg"></div>
              <div className="h-4 w-2/3 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded-lg"></div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                Histórico
              </div>
              <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/50"></div>
              <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/50"></div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-8 bg-white flex flex-col">
            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              {/* User Prompt */}
              {step >= 0 && (
                <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-slate-100 text-slate-700 p-5 rounded-3xl rounded-tr-none max-w-md shadow-sm border border-slate-200/50">
                    <p className="text-sm font-bold leading-relaxed">
                      {displayedText}
                      {isTyping && (
                        <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse"></span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Space */}
              {isGenerating && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0 animate-bounce">
                      <Zap size={20} fill="white" />
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="h-4 w-48 bg-slate-100 rounded-full animate-pulse"></div>
                      <div className="h-4 w-32 bg-slate-50 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Result */}
              {showResult && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                      <Zap size={20} fill="white" />
                    </div>
                    <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl rounded-tl-none shadow-xl relative overflow-hidden group/card transition-all hover:border-blue-200">
                      {/* Success Glow */}
                      <div className="absolute top-0 right-0 p-3 text-emerald-500 opacity-20">
                        <Check size={40} strokeWidth={3} />
                      </div>

                      <h3 className="text-lg font-black text-slate-900 mb-2">
                        {DEMO_STEPS[2].title}
                      </h3>
                      <p className="text-xs text-blue-600 font-bold mb-6 flex items-center gap-1">
                        <Check size={14} /> Atividade Gerada com Sucesso
                      </p>

                      <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 font-mono text-xs text-slate-600 leading-relaxed order-2 lg:order-1">
                          {DEMO_STEPS[2].preview}
                        </div>
                        {DEMO_STEPS[2].imageUrl && (
                          <div className="lg:w-1/3 aspect-square bg-slate-100 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center order-1 lg:order-2">
                            <Image
                              src={DEMO_STEPS[2].imageUrl}
                              alt="Geração de Imagem IA"
                              width={200}
                              height={200}
                              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setDownloaded(true)}
                          className={`flex items-center gap-2 text-xs font-black px-6 py-3 rounded-xl transition-all shadow-lg ${
                            downloaded
                              ? "bg-emerald-500 text-white shadow-emerald-100"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:scale-105"
                          }`}
                        >
                          {downloaded ? (
                            <>
                              <Download size={16} /> PDF Baixado!
                            </>
                          ) : (
                            <>
                              <FileText size={16} /> Baixar PDF Completo
                            </>
                          )}
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-6 py-3 rounded-xl hover:bg-slate-100 transition border border-slate-200">
                          Personalizar
                        </button>
                      </div>

                      {downloaded && (
                        <button
                          onClick={resetDemo}
                          className="mt-6 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                        >
                          Ver outra demonstração <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Placeholder */}
            <div className="mt-8 relative pt-4 border-t border-slate-100">
              <div className="relative bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-slate-400 text-sm font-bold flex justify-between items-center group cursor-pointer hover:border-blue-400 transition-all">
                {displayedText || "Falar para a IA o que você precisa..."}
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 transition-transform group-hover:scale-110">
                  <ArrowRight size={20} />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <div className="text-[10px] font-bold text-slate-400">
                  Sugestões:
                </div>
                <div className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
                  Cálculos do 2º ano
                </div>
                <div className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
                  Interpretação de Texto
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Cue */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
        <MousePointer2 size={12} className="text-blue-600 animate-bounce" />
        Role para cima para ver os planos
      </div>
    </div>
  );
}
