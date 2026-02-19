"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou sua consultora de negócios. Notei que faltam R$ 200 para sua meta hoje. Quer uma sugestão de promoção relâmpago?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Mock API Call - Replace with real Groq hook later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ótima ideia! Considere oferecer um "Combo Happy Hour" das 16h às 19h: Escova + Hidratação por R$ 89,90. Isso deve atrair clientes saindo do trabalho e cobrir o gap da meta.`,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-[#820AD1] rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">IA Consultora</h1>
          <p className="text-sm text-green-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
            Online agora
          </p>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F5F5]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] p-5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#820AD1] text-white rounded-br-none"
                    : "bg-white text-[#111] rounded-bl-none border border-gray-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Peça uma dica ou tire uma dúvida..."
              className="w-full bg-gray-100 text-[#111] pl-6 pr-14 py-4 rounded-full outline-none focus:ring-2 focus:ring-[#820AD1]/50 transition border border-transparent focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 bg-[#820AD1] text-white rounded-full hover:bg-[#6a08a8] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="flex justify-center mt-3 gap-2 overflow-x-auto pb-2">
            {[
              "Como aumentar o lucro?",
              "Criar promoção para amanhã",
              "Analisar minhas despesas",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 rounded-full border border-gray-200 whitespace-nowrap transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
