"use client";

import Link from "next/link";
import { Check, Zap, FileText, Download, Star } from "lucide-react";
import SupportMenu from "@/components/SupportMenu";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="absolute w-full bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Brand Name */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            EduCreator AI
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600 ml-12">
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
          <div className="flex gap-4 items-center ml-auto">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link
              href="/register?plan=trial"
              className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              Começar gratuitamente
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
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
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
              href="#precos"
              className="px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Gerar Atividades Gratuitamente
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 text-lg font-bold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              Ver Demonstração
            </Link>
          </div>
        </section>

        {/* Fake Chat Demo */}
        <section id="demo" className="container mx-auto px-6 mb-24">
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
                <div className="bg-white p-6 rounded-2xl rounded-tr-none shadow-md border border-indigo-100 max-w-xl text-left">
                  <p className="text-indigo-600 font-semibold mb-4">
                    ✨ Atividade Gerada:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      Vamos Somar as Frutas!
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Resolva as continhas abaixo para descobrir quantas frutas
                      temos no total.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-5xl">🍎</div>
                      <div className="text-5xl">🍎</div>
                      <div className="text-5xl">🍎</div>
                      <div className="text-5xl">🍎</div>
                    </div>
                    <div className="space-y-2 text-gray-700 text-sm">
                      <div>A) 2</div>
                      <div>B) 7</div>
                      <div>C) 4</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition">
                      <FileText size={16} /> Baixar PDF
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-semibold text-center shadow-sm">
                    ✨ Além de matemática, a IA cria provas, textos e qualquer
                    tipo de atividade.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Point Section - Moved below demo */}
        <section className="container mx-auto px-4 sm:px-6 mb-24">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl border border-blue-100">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-8 leading-tight">
              Você está <span className="text-blue-600">sem tempo</span> pra
              criar atividades <br className="hidden sm:block" />
              pra sua criança?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 text-center max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
              A verdade dói: você passa horas procurando atividades na internet,
              mas nunca encontra exatamente o que precisa. Não é falta de
              dedicação — é falta de tempo e ferramentas certas.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                  Horas perdidas pesquisando
                </h3>
                <p className="text-gray-600 text-sm">
                  Você passa horas procurando, mas nunca acha o conteúdo ideal
                  para o nível da sua criança.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                  Atividades genéricas
                </h3>
                <p className="text-gray-600 text-sm">
                  As atividades prontas não se encaixam com o que você está
                  ensinando agora.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">😓</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                  Frustração constante
                </h3>
                <p className="text-gray-600 text-sm">
                  Você quer o melhor para seu filho, mas criar do zero é
                  trabalhoso demais.
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 text-center">
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                ✨ E se você pudesse criar atividades personalizadas em
                segundos?
              </p>
              <Link
                href="#precos"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Gerar Atividades Agora
              </Link>
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
            {/* Trial */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-500 relative transform md:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-sm">
                TESTE GRÁTIS
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                7 Dias Grátis
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 mb-2">
                R$ 0,00
              </div>
              <p className="text-green-600 font-medium mb-4 text-sm">
                Depois R$ 21,90/mês
              </p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Acesso total à
                  ferramenta
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Crie qualquer
                  atividade
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Cancele quando
                  quiser
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Sem cobrança
                  hoje
                </li>
              </ul>
              <Link
                href="/register?plan=trial"
                className="block text-center w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md hover:shadow-lg"
              >
                Testar Agora
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
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Geração mais
                  rápida
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Suporte
                  prioritário
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Ideal pra quem
                  prepara atividades toda semana
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Mais agilidade
                  pra planejar aulas e avaliações
                </li>
              </ul>
              <Link
                href="/register?plan=pro"
                className="block text-center w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Escolher Pro
              </Link>
            </div>

            {/* Normal */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition relative">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Normal</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-2">
                R$ 21,90
                <span className="text-lg text-gray-500 font-normal">/mês</span>
              </div>
              <p className="text-gray-500 mb-6">Para professores ocasionais.</p>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Geração com IA
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Histórico por
                  30 dias
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> Ideal pra quem
                  usa 2–3x por semana
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" /> PDF pronto pra
                  imprimir em 1 clique
                </li>
              </ul>
              <Link
                href="/register?plan=normal"
                className="block text-center w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
              >
                Escolher Normal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-12 border-t">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2026 EduCreator AI. Todos os direitos reservados.</p>
        </div>
      </footer>
      <SupportMenu />
    </div>
  );
}
