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
  Layout,
  Image as ImageIcon,
} from "lucide-react";
import { auth } from "@/lib/firebase";

import { signOut } from "firebase/auth";
import { decodeHtmlEntities } from "@/lib/utils";
import { activityTemplates, type ActivityTemplate } from "@/lib/templates";

interface Question {
  number: number;
  questionText: string;
  type:
    | "multiple_choice"
    | "check_box"
    | "true_false"
    | "writing"
    | "matching"
    | "image_selection"
    | "counting"
    | "completion"
    | "pintar";
  alternatives: string[];
  imageUrl?: string;
  answerLines?: number;
}

interface ActivityContent {
  title: string;
  header: {
    studentName: string;
    school: string;
    teacherName: string;
  };
  questions: Question[];
  layout?: "standard" | "one_per_page" | "two_per_page";
  includeImages?: boolean;
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
  subscription_status?: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activityType, setActivityType] = useState("multiple_choice");
  const [layout, setLayout] = useState<
    "standard" | "one_per_page" | "two_per_page"
  >("standard");
  const [includeImages, setIncludeImages] = useState(true);

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
      setUserData({
        plan: "normal",
        pdfs_generated_count: 0,
        subscription_status: "error",
      });
      setShowWarning(true);
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
        body: JSON.stringify({
          prompt: currentPrompt || prompt,
          activityType,
        }),
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
    setActivityType("multiple_choice");
  };

  const applyTemplate = (template: ActivityTemplate) => {
    setPrompt(template.prompt);
    setActivityType(template.type);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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
    <div className="flex h-screen bg-gray-100 font-sans relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b absolute top-0 left-0 right-0 z-40">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">⚡</span> EduCreator
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? (
            <X size={24} />
          ) : (
            <Send size={24} className="rotate-90" />
          )}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r flex flex-col fixed md:relative h-full z-50 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
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
                  {userData.subscription_status &&
                    userData.subscription_status !== "active" &&
                    userData.subscription_status !== "trial" && (
                      <span className="text-[10px] ml-1 text-red-500 font-normal">
                        (Pendente)
                      </span>
                    )}
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
      <main className="flex-1 flex flex-col relative pt-16 md:pt-0">
        {showWarning && !showPlans && (
          <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center animate-in fade-in zoom-in duration-500 border border-white/20">
              <div className="w-20 h-20 bg-linear-to-tr from-red-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
                <Lock size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                Acesso Restrito
              </h2>
              <p className="text-slate-600 mb-10 leading-relaxed">
                Para desbloquear o poder total do <strong>EduCreator</strong> e
                começar a gerar atividades incríveis, por favor ative seu plano.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowPlans(true);
                  }}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1 active:scale-95 duration-200 flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Escolher Plano Agora
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 text-slate-500 font-semibold rounded-2xl hover:bg-slate-100 transition duration-200"
                >
                  Sair da Conta
                </button>
              </div>
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
                      onClick={() =>
                        handleDownloadPDF({ ...result, layout, includeImages })
                      }
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

                {/* Layout and Image Options */}
                <div className="px-8 py-6 bg-gray-50 border-b space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Layout size={16} /> Configurações do PDF
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Standard Layout */}
                      <button
                        onClick={() => setLayout("standard")}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-3 group ${
                          layout === "standard"
                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative flex flex-col p-2 gap-1 border border-gray-100">
                          <div className="h-2 w-3/4 bg-gray-300 rounded-full" />
                          <div className="h-2 w-full bg-gray-200 rounded-full" />
                          <div className="h-6 w-full bg-gray-200 rounded-md" />
                          <div className="h-2 w-1/2 bg-gray-300 rounded-full mt-1" />
                          <div className="h-4 w-full bg-gray-200 rounded-md" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            Fluxo Contínuo
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Formato padrão longo
                          </p>
                        </div>
                      </button>

                      {/* 1 Per Page */}
                      <button
                        onClick={() => setLayout("one_per_page")}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-3 group ${
                          layout === "one_per_page"
                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative flex flex-col p-2 gap-1 border border-gray-100 items-center justify-center">
                          <div className="w-[45%] h-[85%] bg-white rounded border border-gray-200 p-1 flex flex-col gap-1 shadow-xs">
                            <div className="h-1 w-3/4 bg-gray-300 rounded-full" />
                            <div className="h-4 w-full bg-gray-200 rounded-sm" />
                          </div>
                          <div className="w-[45%] h-[85%] bg-white rounded border border-gray-200 p-1 absolute right-[-10px] scale-90 translate-y-1 opacity-60"></div>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            1 por Página
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Questão isolada
                          </p>
                        </div>
                      </button>

                      {/* 2 Per Page */}
                      <button
                        onClick={() => setLayout("two_per_page")}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-3 group ${
                          layout === "two_per_page"
                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100 flex items-center justify-center p-2">
                          <div className="w-[50%] h-[90%] bg-white rounded border border-gray-200 p-1 flex flex-col gap-1">
                            <div className="h-1 w-2/3 bg-gray-300 rounded-full" />
                            <div className="h-2 w-full bg-gray-200 rounded-sm" />
                            <div className="h-0.5 w-full bg-gray-100 rounded-full mt-1" />
                            <div className="h-1 w-2/3 bg-gray-300 rounded-full" />
                            <div className="h-2 w-full bg-gray-200 rounded-sm" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            2 por Página
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Economia de papel
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          Incluir Ilustrações
                        </p>
                        <p className="text-xs text-gray-500">
                          Gerar imagens para as questões
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIncludeImages(!includeImages)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${
                        includeImages ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          includeImages ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
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

                        {/* Alternatives (Multiple choice / Selection) */}
                        {question.alternatives &&
                          question.alternatives.length > 0 && (
                            <div className="space-y-2 ml-10">
                              {question.alternatives.map((alt, j) => (
                                <div
                                  key={j}
                                  className="flex items-start gap-3 text-gray-700 text-sm py-1 hover:bg-gray-50 rounded-lg px-2 -ml-2 transition-colors"
                                >
                                  <span className="shrink-0 mt-0.5 font-mono text-gray-400">
                                    ( )
                                  </span>
                                  <span>{alt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* Answer Lines (Writing) */}
                        {question.answerLines !== undefined &&
                          question.answerLines > 0 && (
                            <div className="ml-10 space-y-4">
                              {Array.from({ length: question.answerLines }).map(
                                (_, j) => (
                                  <div
                                    key={j}
                                    className={`border-b border-gray-300 w-full h-8 border-dotted ${
                                      question.answerLines === 1
                                        ? "max-w-[150px]"
                                        : ""
                                    }`}
                                  ></div>
                                ),
                              )}
                            </div>
                          )}

                        {/* Counting / Identification (Small circle/box) */}
                        {(question.type === "counting" ||
                          question.type === "image_selection") && (
                          <div className="ml-10 mt-2">
                            <div className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center text-gray-400 font-mono">
                              ( )
                            </div>
                          </div>
                        )}

                        {/* Matching Pairs Support could go here - simple version for now */}
                        {question.type === "matching" && (
                          <div className="ml-10 grid grid-cols-2 gap-8 py-4">
                            <div className="space-y-4 font-bold">Colunm A</div>
                            <div className="space-y-4 font-bold text-right">
                              Colunm B
                            </div>
                          </div>
                        )}
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
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                  Escolha um template abaixo ou descreva sua ideia.
                </p>

                {/* Template Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-12">
                  {activityTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="group relative p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full"
                    >
                      <div
                        className={`w-12 h-12 ${template.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        {template.icon}
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        {template.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-blue-200">
                          {template.category}
                        </span>
                        <Zap
                          size={14}
                          className="text-gray-200 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 w-full max-w-xl mb-6">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Exemplos Rápidos
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

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
            {/* Activity Type Selector */}
            {!result && !isGenerating && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {[
                  {
                    id: "multiple_choice",
                    label: "Múltipla Escolha",
                    icon: "✔️",
                  },
                  { id: "writing", label: "Escrita / Nomes", icon: "✏️" },
                  { id: "counting", label: "Contagem", icon: "🔢" },
                  { id: "matching", label: "Relacionar", icon: "🔗" },
                  { id: "image_selection", label: "Identificar", icon: "🖼️" },
                  { id: "completion", label: "Completar", icon: "🔤" },
                  { id: "pintar", label: "Pintar", icon: "🎨" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActivityType(type.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm border ${
                      activityType === type.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    <span className="mr-1.5">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
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
