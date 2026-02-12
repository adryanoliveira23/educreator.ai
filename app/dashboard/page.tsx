"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Send, FileText, Loader2, Lock, History, Zap } from "lucide-react";
import { auth } from "@/lib/firebase";

import { signOut } from "firebase/auth";

interface Question {
  number: number;
  imagePrompt: string;
  questionText: string;
  type: "multiple_choice" | "check_box" | "true_false";
  alternatives: string[];
}

interface ActivityContent {
  title: string;
  header: {
    studentName: string;
    school: string;
    teacherName: string;
  };
  questions: Question[];
}

interface Activity {
  id: string;
  userId: string;
  prompt: string;
  result: ActivityContent;
  createdAt: any;
}

interface UserData {
  plan: "normal" | "pro" | "premium" | "trial";
  pdfs_generated_count: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [result, setResult] = useState<ActivityContent | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState("");

  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success")
      alert("Pagamento aprovado! Seu plano foi atualizado.");
    if (status === "failure") alert("Pagamento falhou. Tente novamente.");
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchUserData();
      fetchActivities();
    }
  }, [user, loading, router]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData & {
          subscription_status?: string;
        };
        setUserData(data);

        // Check subscription status
        if (
          data.subscription_status &&
          data.subscription_status !== "active" &&
          data.subscription_status !== "trial"
        ) {
          // If pending payment, verify if we need to redirect or show modal
          // For now, let's just alert and redirect to home or offer to pay again
          // Ideally we should show a modal. Let's set a flag.
          // But for this task "going straight to dashboard", we want to block it.
          // Let's redirect to a payment retry if possible, or just open the payment link if we can.
          // Simplest: Show the "Choose Plan" modal (showPlans=true) and make it non-closable?
          // Or just trigger handleUpgrade(data.plan) automatically?
          // Let's set showPlans(true) and maybe add a message.
          setShowPlans(true);
          alert("Por favor, finalize o pagamento para acessar o painel.");
        }
      } else {
        // Self-healing: Create default user doc if missing
        const defaultData: any = {
          email: user.email,
          plan: "normal",
          pdfs_generated_count: 0,
          createdAt: serverTimestamp(),
          subscription_status: "pending_payment", // Default to pending for new/healing users too? Or 'trial'? Let's stick to strict.
        };
        await setDoc(docRef, defaultData);
        setUserData(defaultData as UserData);
        // Force payment for these users too
        setShowPlans(true);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Set default data to prevent infinite loading even on error
      setUserData({ plan: "normal", pdfs_generated_count: 0 });
    }
  };

  const fetchActivities = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "activities"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const acts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Activity[];

      setActivities(acts);
    } catch (e) {
      console.warn(
        "Firestore index missing for detailed query, falling back to simple query",
        e,
      );
      const q = query(
        collection(db, "activities"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const acts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Activity[];

      setActivities(acts);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      const token = await user?.getIdToken();

      // Generate activity
      const res = await fetch("/api/groq/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar atividade");
      }

      const data = (await res.json()) as ActivityContent;
      setResult(data);

      fetchUserData();
      fetchActivities();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async (activityContent: ActivityContent) => {
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityContent),
      });

      if (!res.ok) {
        let errorMessage = "Erro ao gerar PDF";
        try {
          const errorData = await res.json();
          console.error("PDF Gen Error Details:", errorData);
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response", e);
        }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activityContent.title || "atividade"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao baixar PDF: ${err.message}`);
    }
  };

  const handleUpgrade = async (plan: string) => {
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
        alert("Erro ao iniciar pagamento");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com pagamento");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || !userData)
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600">
        <Loader2 className="animate-spin mr-2" /> Carregando...
      </div>
    );

  const limits: Record<string, number> = {
    normal: 10,
    pro: 30,
    premium: 999999,
    trial: 999999,
  };
  const limit = limits[userData.plan || "normal"];
  const usage = userData.pdfs_generated_count || 0;
  const percentage = Math.min((usage / limit) * 100, 100);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <span className="bg-blue-100 p-1 rounded">⚡</span> EduCreator
          </h1>
          <button
            onClick={() => {
              setResult(null);
              setPrompt("");
            }}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
          >
            + Nova Atividade
          </button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Seu Plano
            </h3>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-900 capitalize">
                  {userData.plan === "trial" ? "Teste Grátis" : userData.plan}
                </span>
                {/* Limits hidden as per request */}
                {/* <span className="text-xs text-blue-600 font-medium">
                  {usage}/{limit}
                </span> */}
              </div>
              {/* Progress bar hidden */}
              {/* <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div> */}
              <button
                onClick={() => setShowPlans(true)}
                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 w-full justify-center mt-2"
              >
                <Lock size={12} /> Fazer Upgrade / Mudar
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <History size={14} /> Histórico Recente
            </h3>
            <ul className="space-y-2">
              {activities.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  Nenhuma atividade ainda.
                </p>
              )}
              {activities.slice(0, 5).map((act) => (
                <li key={act.id} className="text-sm truncate">
                  <button
                    onClick={() => setResult(act.result)}
                    className="text-gray-700 hover:text-blue-600 text-left w-full truncate block p-2 hover:bg-gray-50 rounded"
                  >
                    {act.result?.title || act.prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-sm text-gray-600 hover:text-red-500 transition"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {showPlans && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex items-center justify-center p-8">
            <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-2xl border">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-center">
                  Escolha seu Plano
                </h2>
                <button
                  onClick={() => setShowPlans(false)}
                  className="text-gray-500 hover:text-gray-900 font-bold text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Plans */}
                {["normal", "pro", "premium"].map((p) => (
                  <div
                    key={p}
                    className={`border p-6 rounded-xl text-center transition-all ${userData.plan === p ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" : "hover:border-blue-300 hover:shadow-lg"}`}
                  >
                    <h3 className="font-bold text-xl capitalize mb-2">{p}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {p === "normal"
                        ? "Para professores ocasionais."
                        : p === "pro"
                          ? "Para professores ativos."
                          : "Uso intenso."}
                    </p>
                    <p className="text-2xl font-bold mb-6 text-gray-800">
                      {p === "normal"
                        ? "R$ 21,90"
                        : p === "pro"
                          ? "R$ 45,90"
                          : "R$ 89,90"}
                    </p>
                    {userData.plan === p ? (
                      <span className="block w-full py-2 bg-gray-200 text-gray-600 rounded-lg font-bold cursor-default">
                        Plano Atual
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(p)}
                        className="block w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                      >
                        Escolher
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          {result ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8 animate-fade-in">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {result.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setResult(null);
                      setPrompt("");
                    }}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition shadow-sm"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(result)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm"
                  >
                    <FileText size={18} /> Baixar PDF
                  </button>
                </div>
              </div>

              {/* Header Fields */}
              <div className="mb-6 space-y-2 text-gray-700">
                <p>{result.header.studentName} _______________________</p>
                <p>{result.header.school} _______________________</p>
                <p>{result.header.teacherName} _______________________</p>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {result.questions?.map((question, i) => (
                  <div key={i} className="border-b pb-4 last:border-b-0">
                    <p className="font-bold text-gray-900 mb-2">
                      Questão {question.number}
                    </p>
                    {question.imagePrompt && (
                      <p className="text-sm text-gray-500 italic mb-2">
                        [Imagem: {question.imagePrompt}]
                      </p>
                    )}
                    <p className="mb-3">{question.questionText}</p>
                    <div className="space-y-1 ml-4">
                      {question.alternatives.map((alt, j) => (
                        <div key={j}>
                          {question.type === "multiple_choice" && `( ) ${alt}`}
                          {question.type === "check_box" && `[ ] ${alt}`}
                          {question.type === "true_false" && `( ) ${alt}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setResult(null)}
                className="mt-8 text-blue-600 hover:underline text-sm"
              >
                ← Criar nova atividade
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center text-gray-500">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Zap size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                O que vamos criar hoje?
              </h2>
              <p className="mb-8">
                Peça uma atividade completa e baixe o PDF em segundos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left text-sm">
                <button
                  onClick={() =>
                    setPrompt(
                      "Atividade de matemática para 1º ano sobre adição simples",
                    )
                  }
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition"
                >
                  "Atividade de matemática para 1º ano sobre adição simples"
                </button>
                <button
                  onClick={() =>
                    setPrompt(
                      "Texto e interpretação sobre o Ciclo da Água para 3º ano",
                    )
                  }
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition"
                >
                  "Texto e interpretação sobre o Ciclo da Água para 3º ano"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-6">
          <div className="max-w-3xl mx-auto">
            {error && (
              <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
            )}
            <form
              onSubmit={handleGenerate}
              className="relative flex items-center shadow-sm border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Quero uma atividade do 5º ano sobre Carnaval"
                className="w-full p-4 pr-12 outline-none text-gray-900 placeholder-gray-400"
                disabled={isGenerating || (percentage >= 100 && !result)}
              />
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim() || percentage >= 100}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-2">
              {percentage >= 100
                ? "Limite do plano atingido."
                : "A IA pode cometer erros. Revise antes de imprimir."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
