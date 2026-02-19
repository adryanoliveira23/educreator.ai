"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Send,
  FileText,
  Loader2,
  Lock,
  Clock,
  Zap,
  Check,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase";

import { signOut } from "firebase/auth";
import { decodeHtmlEntities } from "@/lib/utils";

interface Question {
  number: number;
  questionText: string;
  type: "multiple_choice" | "check_box" | "true_false";
  alternatives: string[];
  imageUrl?: string;
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
  createdAt: unknown;
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
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success")
      alert("Pagamento aprovado! Seu plano foi atualizado.");
    if (status === "failure") alert("Pagamento falhou. Tente novamente.");
  }, []);

  const fetchUserData = useCallback(async () => {
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
          setShowWarning(true);
        }
      } else {
        // Self-healing: Create default user doc if missing
        const defaultData = {
          email: user.email,
          plan: "normal",
          pdfs_generated_count: 0,
          createdAt: serverTimestamp(),
          subscription_status: "pending_payment",
        };
        await setDoc(docRef, defaultData);
        setUserData(defaultData as UserData);
        // Force payment for these users too
        setShowWarning(true);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Set default data to prevent infinite loading even on error
      setUserData({ plan: "normal", pdfs_generated_count: 0 });
    }
  }, [user]);

  const fetchActivities = useCallback(async () => {
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
        "Firestore index missing for detailed query, falling back to simple query and manual sorting. Please create the index in Firebase Console.",
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

      // Manual sorting as fallback
      acts.sort((a, b) => {
        const timeA = (a.createdAt as { seconds: number })?.seconds || 0;
        const timeB = (b.createdAt as { seconds: number })?.seconds || 0;
        return timeB - timeA;
      });

      setActivities(acts);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchUserData();
      fetchActivities();
    }
  }, [user, loading, router, fetchUserData, fetchActivities]);

  const [currentPrompt, setCurrentPrompt] = useState("");
  const generationRef = useRef(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const generationId = ++generationRef.current;
    setIsGenerating(true);
    setError("");
    setResult(null);
    setCurrentPrompt(prompt);

    try {
      const token = await user?.getIdToken();

      // Clear input so user knows it's sent
      setPrompt("");

      const res = await fetch("/api/groq/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: currentPrompt || prompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar atividade");
      }

      if (generationId !== generationRef.current) return;

      const data = (await res.json()) as ActivityContent;
      setResult(data);

      fetchUserData();
      fetchActivities();
    } catch (err) {
      if (generationId === generationRef.current) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    } finally {
      if (generationId === generationRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const startNewActivity = () => {
    generationRef.current++;
    setResult(null);
    setPrompt("");
    setCurrentPrompt("");
    setIsGenerating(false);
    setError("");
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async (activityContent: ActivityContent) => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityContent),
      });

      if (!res.ok) throw new Error("Falha ao gerar PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activityContent.title || "atividade"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      alert(`Erro ao baixar PDF: ${message}`);
    } finally {
      setIsDownloading(false);
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
            onClick={startNewActivity}
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
              <Clock size={14} /> Histórico Recente
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
        {showWarning && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Bloqueado
              </h2>
              <p className="text-gray-600 mb-8">
                Para continuar usando o EduCreator e gerar suas atividades, por
                favor finalize a escolha do seu plano.
              </p>
              <button
                onClick={() => {
                  setShowWarning(false);
                  setShowPlans(true);
                }}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Escolher Plano Agora
              </button>
            </div>
          </div>
        )}

        {showPlans && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl w-full bg-white p-4 md:p-8 rounded-2xl shadow-2xl border my-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-center">
                  Escolha seu Plano
                </h2>
                <button
                  onClick={() => setShowPlans(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Trial */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-500 relative transform md:-translate-y-2 flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm whitespace-nowrap">
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
                  <ul className="space-y-3 mb-6 text-sm flex-grow">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Acesso total à ferramenta
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Crie qualquer atividade
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Cancele quando quiser
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Sem cobrança hoje
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("trial")}
                    className="block text-center w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md hover:shadow-lg"
                  >
                    Testar Agora
                  </button>
                </div>

                {/* Normal */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition relative flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Normal
                  </h3>
                  <div className="text-3xl font-extrabold text-gray-900 mb-2">
                    R$ 21,90
                  </div>
                  <p className="text-gray-500 mb-6 text-sm">
                    Para professores ocasionais.
                  </p>
                  <ul className="space-y-3 mb-8 text-sm flex-grow">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Geração com IA
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Histórico por 30 dias
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Ideal pra quem usa 2–3x por semana
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      PDF pronto pra imprimir em 1 clique
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("normal")}
                    className="block text-center w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
                  >
                    Escolher Normal
                  </button>
                </div>

                {/* Pro */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-600 relative transform md:-translate-y-4 flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap">
                    MAIS POPULAR
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                  <div className="text-3xl font-extrabold text-gray-900 mb-2">
                    R$ 45,90
                  </div>
                  <p className="text-gray-500 mb-6 text-sm">
                    Para professores ativos.
                  </p>
                  <ul className="space-y-3 mb-8 text-sm flex-grow">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Geração mais rápida
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Suporte prioritário
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Ideal pra quem prepara atividades toda semana
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Mais agilidade pra planejar aulas e avaliações
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("pro")}
                    className="block text-center w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
                  >
                    Escolher Pro
                  </button>
                </div>

                {/* Premium */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-300 transition flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Premium
                  </h3>
                  <div className="text-3xl font-extrabold text-gray-900 mb-2">
                    R$ 89,90
                  </div>
                  <p className="text-gray-500 mb-6 text-sm">Uso intenso.</p>
                  <ul className="space-y-3 mb-8 text-sm flex-grow">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Acesso a novos modelos
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Histórico vitalício
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0"
                      />{" "}
                      Crie e reutilize atividades o ano inteiro
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("premium")}
                    className="block text-center w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Escolher Premium
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gray-50/50">
          <div className="max-w-3xl mx-auto space-y-6">
            {currentPrompt && (
              <div className="flex justify-end animate-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                  <p className="text-sm font-medium">{currentPrompt}</p>
                </div>
              </div>
            )}

            {isGenerating && !result && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border p-4 rounded-2xl rounded-tl-none shadow-sm space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-100 rounded"></div>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl shadow-md border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b bg-white flex justify-between items-center sticky top-0 z-10">
                  <h2 className="text-xl font-bold text-gray-900 truncate mr-4">
                    {result.title}
                  </h2>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDownloadPDF(result)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />{" "}
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileText size={14} /> Baixar PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={startNewActivity}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Nova Atividade"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {/* Activity Placeholder Header */}
                  <div className="mb-8 space-y-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      <span>
                        {result.header.studentName || "Nome do Aluno"}:
                        _______________________
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      <span>
                        {result.header.school || "Escola"}:
                        _______________________
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      <span>
                        {result.header.teacherName || "Professor(a)"}:
                        _______________________
                      </span>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-8">
                    {result.questions?.map((question, i) => (
                      <div key={i} className="group relative">
                        <div className="flex items-start gap-4 mb-4">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                            {question.number}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium leading-relaxed">
                              {decodeHtmlEntities(question.questionText)}
                            </p>
                          </div>
                        </div>

                        {question.imageUrl && (
                          <div className="ml-10 mb-6 rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-[1.01] duration-300">
                            <img
                              src={question.imageUrl}
                              alt={`Ilustração para questão ${question.number}`}
                              className="w-full max-h-[400px] object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="space-y-2 ml-10">
                          {question.alternatives.map((alt, j) => (
                            <div
                              key={j}
                              className="flex items-start gap-3 text-gray-700 text-sm py-1 hover:bg-gray-50 rounded-lg px-2 -ml-2 transition-colors"
                            >
                              <span className="shrink-0 mt-0.5 font-mono text-gray-400">
                                {question.type === "multiple_choice" && "( )"}
                                {question.type === "check_box" && "[ ]"}
                                {question.type === "true_false" && "( )"}
                              </span>
                              <span>{alt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t flex justify-center">
                    <button
                      onClick={startNewActivity}
                      className="text-gray-400 hover:text-blue-600 transition flex items-center gap-2 text-sm font-medium"
                    >
                      <Zap size={14} /> Começar uma nova atividade do zero
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!result && !isGenerating && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <Zap size={40} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  O que vamos criar hoje?
                </h2>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
                  Descreva o assunto e o ano escolar. Nossa IA cuida do resto em
                  segundos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl text-left">
                  <button
                    onClick={() =>
                      setPrompt(
                        "Atividade de matemática para 1º ano sobre adição simples",
                      )
                    }
                    className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all duration-300"
                  >
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      &quot;Matemática 1º ano: Adição simples&quot;
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Exemplo de comando rápido
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setPrompt(
                        "Texto e interpretação sobre o Ciclo da Água para 3º ano",
                      )
                    }
                    className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all duration-300"
                  >
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      &quot;Português 3º ano: Ciclo da Água&quot;
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Exemplo de comando rápido
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
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
