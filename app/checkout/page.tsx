"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Loader2,
  Check,
  Lock,
  ArrowRight,
  Star,
  ShieldCheck,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

// Initialize Mercado Pago with Public Key
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY);
}

export default function CheckoutPage() {
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

  const handlePaymentSubmit = async (formData: any) => {
    setIsProcessing(true);
    return new Promise<void>((resolve, reject) => {
      fetch("/api/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          payer_email: user?.email,
          plan: plan,
          uid: user?.uid, // Send user ID
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            data.status === "approved" ||
            data.status === "pending" ||
            data.id
          ) {
            // Success
            window.location.href = "/dashboard?payment=success";
            resolve();
          } else {
            console.error(data);
            alert("Erro no pagamento: " + (data.message || "Tente novamente."));
            reject();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Erro de conexão. Tente novamente.");
          reject();
        })
        .finally(() => {
          setIsProcessing(false);
        });
    });
  };

  const initialization = {
    amount: plan === "trial" ? 21.9 : 21.9, // Need an amount even for auth
    preferenceId: undefined, // handling purely client-side tokenization?
    // Actually Payment Brick usually needs preferenceId or just amount for simple payments.
    // For subscription tokenization, we treat it as a payment of a small amount or just card tokenization.
    // Let's use simple configuration.
  };

  const customization = {
    paymentMethods: {
      creditCard: "all",
      maxInstallments: 1,
    },
    visual: {
      style: {
        theme: "default",
      },
      texts: {
        cardNumber: { placeholder: "Número do cartão" },
        cardholderName: { placeholder: "Nome do titular" },
        email: { placeholder: "E-mail" },
        expirationDate: { placeholder: "Vencimento" },
        securityCode: { placeholder: "Cód. segurança" },
        selectInstallments: "Selecione o número de parcelas",
        formTitle: "Pagamento",
        formSubmit: "Pagar",
      },
    },
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
    premium: {
      name: "Plano Premium",
      price: "R$ 89,90",
      features: [
        "PDFs Ilimitados",
        "Acesso antecipado",
        "Suporte VIP",
        "Geração ultrarrápida",
      ],
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

  // @ts-ignore
  const selectedPlan = planDetails[plan] || planDetails.normal;
  const isTrial = plan === "trial";

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
                {isTrial
                  ? "Ative seu acesso total agora."
                  : "Finalize sua inscrição."}
              </h1>
              <p className="text-lg text-gray-600">
                Preencha os dados abaixo para desbloquear o poder da IA em suas
                aulas.
              </p>
            </div>

            {/* Embed Payment Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={20} />
                Dados do Cartão
              </h3>

              {MP_PUBLIC_KEY ? (
                <Payment
                  initialization={{ amount: 21.9 }}
                  customization={customization as any}
                  onSubmit={handlePaymentSubmit as any}
                  onError={(error) => console.error("Brick Error:", error)}
                  onReady={() => console.log("Brick Ready")}
                  locale="pt-BR"
                />
              ) : (
                <div className="text-red-500">
                  Erro de configuração: Chave pública não encontrada.
                </div>
              )}
            </div>

            {isTrial && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                <div className="flex gap-3">
                  <HelpCircle
                    className="text-yellow-600 flex-shrink-0"
                    size={24}
                  />
                  <div>
                    <p className="font-bold text-yellow-800 text-lg mb-1">
                      Por que pedimos o cartão agora?
                    </p>
                    <p className="text-yellow-700 leading-relaxed">
                      Para verificar sua identidade e garantir que você não
                      perca o acesso após o período de teste.
                      <br />
                      <span className="font-bold underline">
                        Você não será cobrado hoje.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                    {selectedPlan.originalPrice && (
                      <span className="block text-sm text-gray-400 line-through">
                        {selectedPlan.originalPrice}
                      </span>
                    )}
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
                  <p>Seus dados são protegidos com criptografia de 256 bits.</p>
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
