"use client";

import { useAuth } from "@/components/AuthProvider";
import { Loader2, Check, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function CheckoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "normal";
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, loading, router]);

  const handleRedirectToCakto = async () => {
    setIsProcessing(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || "Erro ao iniciar pagamento. Tente novamente.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o sistema de pagamento.");
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const planDetails: Record<
    string,
    {
      name: string;
      price: string;
      originalPrice?: string;
      features: string[];
      highlight?: string;
    }
  > = {
    normal: {
      name: "Plano Normal",
      price: "R$ 21,90",
      features: ["10 PDFs/mês", "Histórico 30 dias", "Suporte básico"],
    },
    pro: {
      name: "Plano Pro",
      price: "R$ 45,90",
      features: [
        "30 PDFs/mês",
        "Geração mais rápida",
        "Suporte prioritário",
        "Acesso a novos modelos",
      ],
      highlight: "Popular",
    },

    trial: {
      name: "Teste Grátis 7 Dias",
      price: "R$ 0,00",
      originalPrice: "R$ 21,90",
      features: [
        "Acesso ilimitado por 7 dias",
        "Cancele a qualquer momento",
        "Sem cobrança hoje",
        "Depois apenas R$ 21,90/mês",
      ],
      highlight: "Oferta Limitada",
    },
  };

  // @ts-expect-error - plan comes from searchParams which might be null or dynamic string
  const selectedPlan = planDetails[plan] || planDetails.normal;
  const isTrial = plan === "trial";

  useEffect(() => {
    if (isTrial) {
      router.replace("/dashboard");
    }
  }, [isTrial, router]);

  if (isTrial) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              EduCreator AI
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-1">
            <Lock size={14} /> Ambiente Seguro
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Persuasion */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Finalize sua inscrição.
              </h1>
              <p className="text-lg text-gray-600">
                Você será redirecionado para a <strong>Cakto</strong>, nossa
                parceira de pagamentos segura, para concluir sua assinatura do{" "}
                <strong>{selectedPlan.name}</strong>.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <button
                onClick={handleRedirectToCakto}
                disabled={isProcessing}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1 active:scale-95 duration-200 flex items-center justify-center gap-2 text-lg"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Pagar e Ativar Plano <ArrowRight size={20} />
                  </>
                )}
              </button>
              <p className="text-center text-gray-400 text-xs mt-4">
                Pagamento via Cartão de Crédito ou PIX pela Cakto.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck
                  className="text-blue-600 flex-shrink-0"
                  size={24}
                />
                <div>
                  <p className="font-bold text-blue-800 text-lg mb-1">
                    Garantia de Satisfação
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    Acesso imediato após a confirmação do pagamento. Cancele sua
                    assinatura quando quiser diretamente pelo painel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-24">
            {selectedPlan.highlight && (
              <div className="bg-green-600 text-white text-center py-2 text-sm font-bold uppercase tracking-wide">
                {selectedPlan.highlight}
              </div>
            )}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Resumo do Pedido
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {selectedPlan.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-blue-600">
                      {selectedPlan.price}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 mt-4">
                  {selectedPlan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <Check
                        size={16}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex gap-3">
                <ShieldCheck
                  className="text-yellow-600 flex-shrink-0"
                  size={20}
                />
                <div className="text-xs text-yellow-800">
                  <p className="font-bold">Compra Segura</p>
                  <p>
                    Seus dados são protegidos com criptografia de ponta pela
                    Cakto.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t p-4 text-center">
              <p className="text-xs text-gray-500">
                Logado como{" "}
                <span className="font-medium text-gray-900">{user.email}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
