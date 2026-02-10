"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Zap, FileText, Download, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 flex items-center gap-2 whitespace-nowrap"
          >
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="EduCreator AI Logo"
                fill
                className="object-contain"
              />
            </div>
            EduCreator AI
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-blue-600 transition">
              Como Funciona
            </a>
            <a href="#precos" className="hover:text-blue-600 transition">
              Preços
            </a>
            <a href="#demo" className="hover:text-blue-600 transition">
              Exemplo
            </a>
          </nav>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-32">
        <section className="container mx-auto px-6 text-center mb-24">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
            Inteligência Artificial para Professores
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-slate-900">
            Crie Atividades Pedagógicas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              em Segundos com IA
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Deixe a IA criar exercícios, textos e avaliações completas para
            você. Baixe em PDF pronto para imprimir e use em sala de aula
            imediatamente.
          </p>
          <p className="text-md text-blue-600 font-medium mb-10 max-w-2xl mx-auto bg-blue-50 py-2 px-4 rounded-lg inline-block">
            ✨ Além de criar 10 questões, a IA cria qualquer quantidade de
            questões!
          </p>
          <div className="flex justify-center gap-4 flex-col sm:flex-row">
            <Link
              href="/register"
              className="px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Testar Gratuitamente
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 text-lg font-bold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              Ver Exemplo
            </Link>
          </div>
        </section>

        {/* Fake Chat Demo */}
        <section id="demo" className="container mx-auto px-6 mb-32">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="bg-gray-800 px-4 py-3 flex gap-2 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="p-8 space-y-6 bg-slate-50">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                  👤
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-lg">
                  <p className="text-gray-800">
                    Crie uma atividade de matemática para o 2º ano sobre adição
                    de frutas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Zap size={20} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-md border border-indigo-100 max-w-xl text-left">
                  <p className="text-indigo-600 font-semibold mb-2">
                    ✨ Atividade Gerada:
                  </p>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Vamos Somar as Frutas!
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Resolva as continhas abaixo para descobrir quantas frutas
                    temos no total.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>{" "}
                      🍎 2 maçãs + 🍎 3 maçãs = _____
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>{" "}
                      🍌 1 banana + 🍌 4 bananas = _____
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>{" "}
                      🍊 3 laranjas + 🍊 3 laranjas = _____
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <button className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                      <FileText size={16} /> Baixar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="bg-gray-50 py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
              Como Funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Star className="w-8 h-8 text-blue-600" />,
                  title: "1. Peça sua Atividade",
                  desc: "Digite o tema, a série e o tipo de exercício que você precisa.",
                },
                {
                  icon: <Zap className="w-8 h-8 text-yellow-500" />,
                  title: "2. IA Cria na Hora",
                  desc: "Nossa inteligência artificial gera o conteúdo completo em segundos.",
                },
                {
                  icon: <Download className="w-8 h-8 text-green-600" />,
                  title: "3. Baixe e Imprima",
                  desc: "Faça o download do PDF formatado e pronto para aplicar em aula.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition"
                >
                  <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="container mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">
            Planos Simples e Transparentes
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-xl mx-auto">
            Escolha o plano ideal para a sua necessidade. Cancele quando quiser.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Normal */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition relative">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Normal</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-2">
                R$ 21,90
                <span className="text-lg text-gray-500 font-normal">/mês</span>
              </div>
              <p className="text-gray-500 mb-6">Para professores ocasionais.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> 10 PDFs por mês
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Geração com IA
                  LLaMA
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Histórico de 30
                  dias
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
              >
                Escolher Normal
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-600 relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                MAIS POPULAR
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-2">
                R$ 45,90
                <span className="text-lg text-gray-500 font-normal">/mês</span>
              </div>
              <p className="text-gray-500 mb-6">Para professores ativos.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> 30 PDFs por mês
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Geração Rápida
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Suporte
                  Prioritário
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Escolher Pro
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-2">
                R$ 89,90
                <span className="text-lg text-gray-500 font-normal">/mês</span>
              </div>
              <p className="text-gray-500 mb-6">Uso ilimitado e livre.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> PDFs Ilimitados
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Acesso a novos
                  modelos
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Histórico
                  Vitalício
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Escolher Premium
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-12 border-t">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 EduCreator AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
