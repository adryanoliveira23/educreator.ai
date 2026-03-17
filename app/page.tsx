"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  Download,
  Star,
  ShieldCheck,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  MousePointer2,
  Zap,
} from "lucide-react";
import SupportMenu from "@/components/SupportMenu";
import InteractiveDemo from "@/components/landing/InteractiveDemo";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if background should be white/blurred
      setScrolled(currentScrollY > 20);

      // Determine visibility based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-6"
        } ${showNavbar ? "top-0" : "-top-24"}`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" fill="white" />
            </div>
            <span className="text-lg md:text-xl font-display font-black tracking-tight text-slate-900">
              EduCreator<span className="text-indigo-600">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex gap-10 text-sm font-bold text-slate-600">
            <a
              href="#solucao"
              className="hover:text-indigo-600 transition-colors"
            >
              Solução
            </a>
            <a
              href="#como-funciona"
              className="hover:text-indigo-600 transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#precos"
              className="hover:text-indigo-600 transition-colors"
            >
              Preços
            </a>
          </nav>

          <div className="flex gap-2 md:gap-4 items-center">
            <Link
              href="/login"
              className="px-3 md:px-6 py-3 text-xs md:text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="#precos"
              className="px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-black bg-slate-900 text-white rounded-xl md:rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 hover:shadow-indigo-100 hover:-translate-y-0.5 whitespace-nowrap"
            >
              Gerar atividades
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative pt-32 pb-20 lg:pt-56 lg:pb-36 overflow-hidden"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[140px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[140px]"></div>
          </div>

          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2 mb-10 text-[10px] font-black tracking-[0.2em] text-indigo-700 uppercase bg-indigo-50/50 rounded-full border border-indigo-100/50 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                REVOLUCIONANDO O PLANEJAMENTO ESCOLAR
              </div>

                <h1 className="text-5xl sm:text-7xl md:text-9xl font-display font-black mb-10 leading-[1.1] md:leading-[1] tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
                Crie Atividades <br className="hidden sm:block" />
                <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pedagógicas <br className="hidden sm:block" />
                Inéditas</span> em <br className="hidden sm:block" />
                Segundos
              </h1>

              <p className="text-lg sm:text-2xl md:text-4xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 px-4">
                A IA do EduCreator gera exercícios, textos e avaliações
                completas alinhadas à BNCC. Baixe em PDF pronto para imprimir e
                recupere seu tempo livre.
              </p>

               <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Link
                  href="#precos"
                  className="group px-10 py-6 text-xl font-black text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Gerar atividades
                  <ArrowRight
                    size={22}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href="#demo"
                  className="px-10 py-6 text-xl font-black text-slate-700 bg-white border-2 border-slate-100 rounded-3xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <MousePointer2 size={22} className="text-indigo-600" />
                  Ver Demonstração
                </Link>
              </div>

              <div className="mt-20 flex flex-wrap justify-center items-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2.5 font-black text-slate-500 text-sm tracking-tight">
                  <ShieldCheck size={22} className="text-indigo-600" />
                  <span>Seguro & Confiável</span>
                </div>
                <div className="flex items-center gap-2.5 font-black text-slate-500 text-sm tracking-tight">
                  <Check size={22} className="text-emerald-600" />
                  <span>Alinhado à BNCC</span>
                </div>
                <div className="flex items-center gap-2.5 font-black text-slate-500 text-sm tracking-tight">
                  <Star
                    size={22}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                  <span>Favorito dos Professores</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="container mx-auto px-6 mb-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900 tracking-tight">
              Veja a <span className="text-blue-600">Mágica</span> Acontecendo
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              Deixe nossa IA cuidar do trabalho pesado. Em menos de 2 minutos,
              você tem uma atividade pronta para aplicar.
            </p>
          </div>

          <InteractiveDemo />
        </section>

        {/* Solução Section */}
        <section id="solucao" className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-display font-black mb-6 text-slate-900 tracking-tight">
                Sua aula pronta em{" "}
                <span className="text-indigo-600">um clique</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Desenvolvemos ferramentas específicas para cada etapa do seu
                dia. Da BNCC à correção, o EduCreator é seu assistente
                pedagógico completo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Clock className="w-10 h-10 text-indigo-600" />,
                  title: "Recupere seu tempo livre",
                  desc: "Pare de levar trabalho para casa. Gere materiais completos que levariam horas em poucos segundos.",
                  color: "bg-indigo-50/50",
                },
                {
                  icon: <BookOpen className="w-10 h-10 text-blue-600" />,
                  title: "Conteúdo 100% Inédito",
                  desc: "Nossa IA gera questões e textos originais, evitando o plágio e garantindo materiais exclusivos para sua turma.",
                  color: "bg-blue-50/50",
                },
                {
                  icon: <Sparkles className="w-10 h-10 text-amber-500" />,
                  title: "Engajamento que Encanta",
                  desc: "Atividades lúdicas e visuais que fazem os alunos se interessarem pelo conteúdo de forma natural.",
                  color: "bg-amber-50/50",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className={`p-10 rounded-[2.5rem] ${benefit.color} border border-white transition-all hover:scale-[1.02] duration-500 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20`}
                >
                  <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-md shadow-slate-100 mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How IT Works */}
        <section
          id="como-funciona"
          className="py-32 bg-slate-50/50 relative overflow-hidden"
        >
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-display font-black mb-6 text-slate-900">
                Como Funciona
              </h2>
              <p className="text-xl text-slate-600 font-medium">
                Simples, rápido e intuitivo. Do jeito que o professor precisa.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector Line (visible on desktop) */}
              <div className="hidden md:block absolute top-[40%] left-0 w-full h-0.5 border-t-2 border-dashed border-slate-200 -z-10"></div>

              {[
                {
                  step: "01",
                  title: "Defina o Objetivo",
                  desc: "Escolha o tema, a série e os objetivos da BNCC que deseja trabalhar.",
                  icon: <MousePointer2 className="w-10 h-10 text-indigo-600" />,
                },
                {
                  step: "02",
                  title: "IA Geradora",
                  desc: "Em segundos, nossa IA cria o material completo: textos, questões e imagens.",
                  icon: <Zap className="w-10 h-10 text-blue-600" />,
                },
                {
                  step: "03",
                  title: "Pronto para Imprimir",
                  desc: "Baixe o PDF formatado e profissional, pronto para aplicar em sala.",
                  icon: <Download className="w-10 h-10 text-emerald-600" />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white text-center hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="bg-indigo-600 w-12 h-12 flex items-center justify-center rounded-2xl text-white font-black text-sm mb-10 mx-auto shadow-lg shadow-indigo-100">
                    {item.step}
                  </div>
                  <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-slate-100">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-48">
              <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-sm mb-4 block">
                Planos & Preços
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-black mb-6 text-slate-900">
                O maior retorno para o seu{" "}
                <span className="text-indigo-600">precioso tempo</span>
              </h2>
              <p className="text-xl text-slate-600 font-medium">
                Escolha o plano que melhor se adapta à sua rotina escolar.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch">

              {/* Pro - Featured */}
              <div className="bg-slate-900 p-12 pt-24 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(79,70,229,0.3)] border-[3px] border-indigo-600 relative flex flex-col z-10 hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 translate-x-12 -translate-y-12 overflow-hidden pointer-events-none">
                  <Sparkles size={160} fill="white" />
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] shadow-xl whitespace-nowrap uppercase z-20">
                  RECOMENDADO
                </div>

                <div className="mb-8 relative z-10">
                  <div className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    PROFISSIONAL
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 font-display">
                    Plano Pro
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white leading-none font-display">
                      R$19,80
                    </span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 grow relative z-10">
                  {[
                    "Geração ultra-rápida",
                    "Suporte VIP via WhatsApp",
                    "Templates exclusivos",
                    "PDFs Ilimitados",
                    "Uso em múltiplas turmas",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-300 font-black text-sm"
                    >
                      <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://pay.cakto.com.br/3ey44xv_761899"
                  className="w-full py-6 bg-indigo-600 text-white font-black text-center rounded-[1.5rem] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 font-display"
                >
                  Assinar Agora
                </a>
              </div>

              {/* Normal */}
              <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border-[3px] border-slate-100 hover:border-indigo-100 transition-all flex flex-col group overflow-hidden hover:scale-[1.02] duration-500">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="mb-8 relative z-10">
                  <div className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-widest text-slate-600 uppercase bg-slate-100 rounded-full border border-slate-200/50">
                    BÁSICO
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2 font-display">
                    Plano Essencial
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 leading-none font-display">
                      R$9,99
                    </span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 grow relative z-10">
                  {[
                    "IA de alta qualidade",
                    "Até 10 atividades/semana",
                    "PDFs para impressão",
                    "Histórico 30 dias",
                    "Uso individual",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-600 font-black text-sm"
                    >
                      <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://pay.cakto.com.br/9m78gio_761861"
                  className="w-full py-6 bg-slate-900 text-white font-black text-center rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 font-display"
                >
                  Gerar atividades
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 container mx-auto px-6">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-12 opacity-15 -rotate-12 translate-x-12">
              <Sparkles size={250} fill="white" />
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-black mb-10 relative z-10 leading-[1.1]">
              Economize horas de <br className="hidden md:block" />
              planejamento hoje mesmo.
            </h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto relative z-10 font-bold">
              Junte-se aos milhares de professores que já usam IA para criar
              atividades incríveis em segundos.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link
                href="#precos"
                className="px-12 py-6 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105 font-display text-xl"
              >
                Gerar atividades
              </Link>
            </div>

            <p className="mt-10 text-indigo-200 text-xs font-black tracking-widest uppercase relative z-10">
              🚀 +15.000 atividades geradas este mês
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                  E
                </div>
                <span className="text-2xl font-display font-black tracking-tight text-slate-900">
                  EduCreator<span className="text-indigo-600">AI</span>
                </span>
              </Link>
              <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8">
                Sua parceira na missão de educar. Inteligência Artificial a
                serviço da excelência pedagógica brasileira.
              </p>
              <div className="flex gap-4">
                {/* Social links could go here */}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-sm">
              <div className="flex flex-col gap-5">
                <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                  Produto
                </span>
                <a
                  href="#solucao"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  Funcionalidades
                </a>
                <a
                  href="#demo"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  Demonstração
                </a>
                <a
                  href="#precos"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  Planos
                </a>
              </div>
              <div className="flex flex-col gap-5">
                <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                  Suporte
                </span>
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  Área do Professor
                </Link>
                <a
                  href="#"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  WhatsApp
                </a>
              </div>
              <div className="flex flex-col gap-5">
                <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                  Legal
                </span>
                <a
                  href="#"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  Termos
                </a>
                <a
                  href="#"
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  Privacidade
                </a>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            <span>© 2026 EduCreator AI. Feito com amor por educadores.</span>
            <div className="flex gap-8">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{" "}
                Servidores Online
              </span>
            </div>
          </div>
        </div>
      </footer>

      <SupportMenu />
    </div>
  );
}
