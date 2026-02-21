"use client";

import Link from "next/link";
import {
  Check,
  Zap,
  FileText,
  Download,
  Star,
  ShieldCheck,
  Clock,
  Sparkles,
  BookOpen,
  Layout,
  ChevronRight,
  ArrowRight,
  MousePointer2,
} from "lucide-react";
import SupportMenu from "@/components/SupportMenu";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <Sparkles size={18} className="sm:w-6 sm:h-6" fill="white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              EduCreator<span className="text-blue-600">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex gap-8 text-sm font-semibold text-slate-600">
            {/* ... navigation links ... */}
            <a
              href="#solucao"
              className="hover:text-blue-600 transition-colors"
            >
              A Solução
            </a>
            <a
              href="#templates"
              className="hover:text-blue-600 transition-colors"
            >
              Templates
            </a>
            <a
              href="#como-funciona"
              className="hover:text-blue-600 transition-colors"
            >
              Como Funciona
            </a>
            <a href="#precos" className="hover:text-blue-600 transition-colors">
              Preços
            </a>
          </nav>

          <div className="flex gap-2 sm:gap-4 items-center">
            <Link
              href="/login"
              className="px-2 py-2 text-[11px] sm:text-sm font-extrabold text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Entrar
            </Link>
            <Link
              href="/register?plan=trial"
              className="px-3 py-2 text-[10px] sm:text-sm font-black bg-slate-900 text-white rounded-xl sm:rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              Experimentar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-wider text-blue-700 uppercase bg-blue-50 rounded-full border border-blue-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                Revolucionando o Planejamento Escolar
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-700">
                Crie Atividades <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500">
                  Pedagógicas Inéditas
                </span>{" "}
                em Segundos
              </h1>

              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
                A IA do EduCreator gera exercícios, textos e avaliações
                completas alinhadas à BNCC. Baixe em PDF pronto para imprimir e
                recupere seu tempo livre.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Link
                  href="/register?plan=trial"
                  className="group px-10 py-5 text-lg font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Criar Minha Primeira Atividade
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href="#demo"
                  className="px-8 py-5 text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <MousePointer2 size={20} className="text-blue-600" />
                  Ver Demonstração
                </Link>
              </div>

              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 font-bold text-slate-400">
                  <ShieldCheck size={20} />
                  <span>Seguro & Confiável</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-400">
                  <Check size={20} />
                  <span>Alinhado à BNCC</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-400">
                  <Star size={20} />
                  <span>5 Estrelas por Professores</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview / Mockup */}
        <section id="demo" className="container mx-auto px-6 mb-32">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-4xl blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-4xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Painel do Professor AI
                </div>
                <div className="w-10"></div>
              </div>

              <div className="flex flex-col md:flex-row h-[500px]">
                {/* Mock Sidebar */}
                <div className="hidden md:block w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-4">
                  <div className="h-8 w-full bg-blue-100/50 rounded-lg"></div>
                  <div className="space-y-2 pt-4">
                    <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                  </div>
                </div>

                {/* Mock Chat Area */}
                <div className="flex-1 p-8 bg-white flex flex-col">
                  <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="bg-slate-100 text-slate-700 p-5 rounded-2xl rounded-tr-none max-w-md shadow-sm border border-slate-200/50">
                        <p className="text-sm font-semibold">
                          Crie uma atividade de matemática para o 2º ano sobre
                          adição de frutas, com desenhos para colorir.
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="flex gap-4 max-w-2xl">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                          <Zap size={20} fill="white" />
                        </div>
                        <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl rounded-tl-none shadow-xl">
                          <h3 className="text-lg font-bold text-slate-900 mb-2">
                            🍍 Atividade de Adição: Salada de Frutas
                          </h3>
                          <p className="text-sm text-slate-500 mb-6">
                            EduCreator gerou 1 atividade inédita pronta para o
                            seu 2º ano.
                          </p>

                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 font-mono text-xs text-slate-600 line-clamp-4">
                            1. Na cesta de Maria havia 4 maçãs. Ela comprou mais
                            3 bananas. Quantas frutas...
                          </div>

                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                              <FileText size={16} /> Baixar PDF Completo
                            </button>
                            <button className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition">
                              Personalizar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Input */}
                  <div className="mt-8 relative">
                    <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-10"></div>
                    <div className="relative bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-slate-400 text-sm font-medium flex justify-between items-center group cursor-pointer hover:border-blue-400 transition-colors">
                      Falar para a IA o que você precisa...
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="solucao" className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 tracking-tight">
                O que você ganha com o{" "}
                <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">
                  EduCreatorAI
                </span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Desenvolvido por quem entende as dificuldades do cotidiano
                escolar. Mais que uma ferramenta, um assistente pedagógico 24h.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock className="w-8 h-8 text-blue-600" />,
                  title: "Recupere seu Tempo",
                  desc: "Reduza o tempo de planejamento de horas para minutos. Tenha mais tempo para você e sua família.",
                  color: "bg-blue-50",
                },
                {
                  icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
                  title: "Conteúdo Inédito",
                  desc: "Pare de usar as mesmas atividades de sempre. Gere questões novas, personalizadas para a sua turma.",
                  color: "bg-indigo-50",
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-amber-500" />,
                  title: "Engajamento Total",
                  desc: "Atividades visuais, lúdicas e interessantes que fazem seus alunos amarem aprender.",
                  color: "bg-amber-50",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className={`p-10 rounded-4xl ${benefit.color} border border-white transition-all hover:scale-105 duration-300`}
                >
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-8">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section - NEW */}
        <section
          id="templates"
          className="py-24 bg-slate-900 text-white overflow-hidden relative"
        >
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
              <div className="max-w-2xl">
                <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4 block">
                  Variedade Infinita
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  Templates Prontos <br />
                  <span className="text-blue-500">Para Qualquer Aula</span>
                </h2>
              </div>
              <p className="text-slate-400 text-lg max-w-md lg:mb-4">
                De alfabetização à matemática avançada. Escolha um modelo e
                deixe a IA fazer o resto.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  title: "Matemática",
                  icon: "🔢",
                  color: "from-blue-500/20 to-blue-600/20",
                },
                {
                  title: "Colorir",
                  icon: "🖍️",
                  color: "from-pink-500/20 to-pink-600/20",
                },
                {
                  title: "Português",
                  icon: "📚",
                  color: "from-indigo-500/20 to-indigo-600/20",
                },
                {
                  title: "Alfabeto",
                  icon: "🔤",
                  color: "from-amber-500/20 to-amber-600/20",
                },
                {
                  title: "Datas Com.",
                  icon: "🗓️",
                  color: "from-emerald-500/20 to-emerald-600/20",
                },
                {
                  title: "Ciências",
                  icon: "🧪",
                  color: "from-cyan-500/20 to-cyan-600/20",
                },
                {
                  title: "Geografia",
                  icon: "🌍",
                  color: "from-orange-500/20 to-orange-600/20",
                },
                {
                  title: "Provas",
                  icon: "📝",
                  color: "from-slate-500/20 to-slate-600/20",
                },
              ].map((template, i) => (
                <div
                  key={i}
                  className={`group relative p-8 rounded-3xl bg-linear-to-br ${template.color} border border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                    <Layout size={80} />
                  </div>
                  <div className="text-4xl mb-6">{template.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{template.title}</h3>
                  <div className="flex items-center text-xs font-semibold text-blue-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver exemplo <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <Link
                href="/register?plan=trial"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
              >
                Explorar Todos os Templates
                <Sparkles size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* How IT Works */}
        <section
          id="como-funciona"
          className="py-32 bg-slate-50 relative overflow-hidden"
        >
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl font-bold mb-6 text-slate-900">
                Magia em 3 Passos
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10"></div>

              {[
                {
                  step: "01",
                  title: "Defina o Tema",
                  desc: "Diga qual assunto, série e objetivos você deseja trabalhar.",
                  icon: <MousePointer2 className="w-8 h-8 text-blue-600" />,
                },
                {
                  step: "02",
                  title: "Gerar & Editar",
                  desc: "Nossa IA cria tudo na hora. Você pode ajustar o texto ou incluir imagens.",
                  icon: <Sparkles className="w-8 h-8 text-indigo-600" />,
                },
                {
                  step: "03",
                  title: "Imprimir",
                  desc: "Baixe o PDF formatado, pronto para aplicar aos seus alunos.",
                  icon: <Download className="w-8 h-8 text-emerald-600" />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-500"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white flex items-center justify-center rounded-full text-blue-600 font-bold border-4 border-slate-50 shadow-md">
                    {item.step}
                  </div>
                  <div className="bg-slate-50 w-20 h-20 rounded-4xl flex items-center justify-center mx-auto mb-8">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4 block">
                Planos & Preços
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                O Investimento com Maior ROI para o seu Tempo
              </h2>
              <p className="text-slate-600 font-medium">
                Testar não custa nada. Cancele quando quiser.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {/* Trial */}
              <div className="bg-white p-12 rounded-4xl shadow-xl shadow-slate-100 border-2 border-slate-100 transition-all hover:border-blue-200 flex flex-col group">
                <div className="mb-8">
                  <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 rounded-full">
                    DEGUSTAÇÃO
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    Teste Gratuito
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 leading-none">
                      R$0
                    </span>
                    <span className="text-slate-400 font-bold">/7 dias</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 grow">
                  {[
                    "Acesso total à ferramenta",
                    "Crie qualquer atividade",
                    "Cancele quando quiser",
                    "Sem cobrança imediata",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-600 font-bold text-sm"
                    >
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register?plan=trial"
                  className="w-full py-5 bg-slate-900 text-white font-black text-center rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 hover:shadow-emerald-100"
                >
                  Começar Grátis
                </Link>
              </div>

              {/* Pro - Featured */}
              <div className="bg-slate-900 p-12 rounded-4xl shadow-[0_30px_60px_-15px_rgba(37,99,235,0.3)] border-4 border-blue-600 relative transform lg:-translate-y-8 flex flex-col scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest shadow-xl whitespace-nowrap uppercase">
                  MAIS ESCOLHIDO
                </div>

                <div className="mb-8">
                  <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded-full">
                    PROFISSIONAL
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Plano Pro
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white leading-none">
                      R$45,90
                    </span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 grow">
                  {[
                    "Geração ultra-rápida",
                    "Suporte VIP via WhatsApp",
                    "Ideal para 2+ turmas",
                    "Templates exclusivos",
                    "PDFs ilimitados",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-300 font-bold text-sm"
                    >
                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register?plan=pro"
                  className="w-full py-5 bg-blue-600 text-white font-black text-center rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20"
                >
                  Assinar Agora
                </Link>
              </div>

              {/* Normal */}
              <div className="bg-white p-12 rounded-4xl shadow-2xl shadow-slate-100 border-2 border-slate-100 hover:border-slate-200 transition-all flex flex-col">
                <div className="mb-8">
                  <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-slate-600 uppercase bg-slate-100 rounded-full">
                    BÁSICO
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    Plano Normal
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 leading-none">
                      R$21,90
                    </span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 grow">
                  {[
                    "IA de alta qualidade",
                    "Histórico 30 dias",
                    "Até 10 atividades/semana",
                    "PDFs para impressão",
                    "Uso individual",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-600 font-bold text-sm"
                    >
                      <div className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register?plan=normal"
                  className="w-full py-5 bg-white border-2 border-slate-900 text-slate-900 font-black text-center rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  Assinar Básico
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 container mx-auto px-6">
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-4xl p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles size={200} />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8 relative z-10 leading-tight">
              Diga Adeus às Noites <br />
              em Claro Planejando.
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto relative z-10 font-medium">
              A ferramenta de IA mais amada pelos professores do Brasil. Comece
              a criar hoje mesmo.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link
                href="/register?plan=trial"
                className="px-10 py-5 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:scale-105"
              >
                Começar Grátis Agora
              </Link>
            </div>

            <p className="mt-8 text-blue-200 text-sm font-bold relative z-10">
              🚀 Já são mais de 10.000 atividades geradas!
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  EduCreator AI
                </span>
              </Link>
              <p className="text-slate-500 text-sm max-w-xs font-medium">
                Sua aliada favorita na jornada de educar. Inteligência
                Artificial a serviço da pedagogia.
              </p>
            </div>

            <div className="flex gap-12 text-sm">
              <div className="flex flex-col gap-4">
                <span className="font-black text-slate-900">Produto</span>
                <a
                  href="#solucao"
                  className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  Funcionalidades
                </a>
                <a
                  href="#templates"
                  className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  Templates
                </a>
                <a
                  href="#precos"
                  className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  Preços
                </a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-black text-slate-900">Suporte</span>
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  Área do Aluno
                </Link>
                <a
                  href="#"
                  className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  Termos de Uso
                </a>
                <a
                  href="#"
                  className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  Privacidade
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
            <span>© 2026 EduCreator AI. Todos os direitos reservados.</span>
            <div className="flex gap-6">
              <span>Feito com ❤️ por educadores para educadores</span>
            </div>
          </div>
        </div>
      </footer>

      <SupportMenu />
    </div>
  );
}
