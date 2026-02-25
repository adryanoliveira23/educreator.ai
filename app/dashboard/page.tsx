"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Search,
  Zap,
  Sparkles,
  Send,
  Loader2,
  X,
  Menu,
  Lock,
  Check,
  FileText,
  ImageIcon,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/firebase";

import { signOut } from "firebase/auth";
import { decodeHtmlEntities } from "@/lib/utils";
import { activityTemplates, type ActivityTemplate } from "@/lib/templates";
import ActivitySidebar from "@/components/ActivitySidebar";

// Categories are handled in ActivitySidebar context

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
  matchingPairs?: { left: string; right: string }[];
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
  wallpaperUrl?: string | null;
}

interface Activity {
  id: string;
  userId: string;
  prompt: string;
  result: ActivityContent;
  createdAt: unknown;
}

interface UserData {
  name?: string;
  plan: "normal" | "pro" | "premium" | "trial";
  credits?: number;
  pdfs_generated_count: number;
  subscription_status?: string;
  metadata?: {
    trial_cookie_present: boolean;
    user_agent: string;
    registration_date: string;
  };
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "multiple_choice",
  ]);
  const [layout] = useState<"standard" | "one_per_page" | "two_per_page">(
    "standard",
  );
  const [includeImages, setIncludeImages] = useState(true);

  // Scarcity logic
  const isTrial = userData?.plan === "trial";
  const hasUsedTrial = userData?.metadata?.trial_cookie_present || false;

  // Calculate trial days left (placeholder logic, assuming 7 days from registration)
  const getTrialDaysLeft = () => {
    if (!userData?.metadata?.registration_date) return 7;
    const regDate = new Date(userData.metadata.registration_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - regDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  };
  const daysLeft = getTrialDaysLeft();

  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(
    null,
  );
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [toolSearch, setToolSearch] = useState("");

  // Guided Wizard State
  // Modal states
  const [showWizard, setShowWizard] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    topic: "",
    grade: "",
    bncc: "",
    methodology: "",
    discipline: "",
    context: "",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        alert("Apenas JPG, JPEG ou PNG são permitidos.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomWallpaper(base64);
        setSelectedWallpaper(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = useCallback((template: ActivityTemplate) => {
    setPrompt(template.prompt);
    setSelectedTool(template);
    if (template.wallpaperUrl) {
      setSelectedWallpaper(template.wallpaperUrl);
    }

    // Smooth scroll to prompt bar
    const promptElement = document.querySelector("textarea");
    if (promptElement) {
      promptElement.scrollIntoView({ behavior: "smooth", block: "center" });
      promptElement.focus();
    }
  }, []);

  useEffect(() => {
    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const templateId = params.get("template");

    if (templateId) {
      const template = activityTemplates.find((t) => t.id === templateId);
      if (template) {
        applyTemplate(template);
        // Clear param without reload
        window.history.replaceState({}, "", "/dashboard");
      }
    }

    if (status === "success" || status === "approved") {
      alert("Pagamento aprovado! Seu plano foi atualizado.");
      window.history.replaceState({}, "", "/dashboard");
    }
    if (status === "failure") {
      alert("Pagamento falhou. Tente novamente.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [applyTemplate]);

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
        const isLimitedTrial =
          data.plan === "trial" ||
          data.subscription_status === "pending_payment";

        if (
          data.subscription_status &&
          data.subscription_status !== "active" &&
          data.subscription_status !== "trial" &&
          !isLimitedTrial
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

    const isLimitedTrial =
      userData?.plan === "trial" ||
      userData?.subscription_status === "pending_payment";

    if (isLimitedTrial && activities.length >= 1) {
      setShowPlans(true);
      return;
    }

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
          activityTypes: selectedTypes,
          questionCount,
          context: result,
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
    setSelectedTypes(["multiple_choice"]);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async (activityContent: ActivityContent) => {
    if (userData?.plan === "trial" && !showDownloadModal) {
      setShowDownloadModal(true);
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activityContent,
          isTrial: userData?.plan === "trial",
        }),
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
      setShowDownloadModal(false);
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
  const limit = limits[userData.plan || "normal"] || 10;

  return (
    <div className="flex h-dvh bg-gray-100 font-sans relative overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 left-0 right-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight font-display">
            Edu<span className="text-indigo-600">Creator</span>
          </h1>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <ActivitySidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        startNewActivity={startNewActivity}
        userData={userData}
        activities={activities}
        setResult={setResult}
        setShowPlans={setShowPlans}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative pt-20 md:pt-0 h-full overflow-hidden">
        {/* Scarcity Banner for Trial Users */}
        {isTrial && (
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 flex items-center justify-between shadow-md z-30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap size={16} className="text-yellow-300 animate-pulse" />
              <span>
                Seu teste grátis expira em <strong>{daysLeft} dias</strong>.
                Faça o upgrade agora e economize até 10 horas semanais!
              </span>
            </div>
            <button
              onClick={() => setShowPlans(true)}
              className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-50 transition shadow-sm"
            >
              Fazer Upgrade
            </button>
          </div>
        )}

        {showWarning && !showPlans && (
          <div className="fixed inset-0 z-60 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
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
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl w-full bg-slate-50 p-4 md:p-10 rounded-[2.5rem] shadow-3xl border border-white/20 my-auto relative animate-in fade-in zoom-in slide-in-from-bottom-5 duration-500">
              <div className="flex justify-between items-center mb-10">
                <div className="text-left">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                    Evolua sua produtividade
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Escolha o plano ideal para transformar suas aulas.
                  </p>
                </div>
                <button
                  onClick={() => setShowPlans(false)}
                  className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition shadow-sm border border-slate-200 group"
                >
                  <X
                    size={24}
                    className="text-slate-400 group-hover:text-slate-600 transition-colors"
                  />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Trial - Only show if not used and NOT currently on trial */}
                {!hasUsedTrial && !isTrial && (
                  <div className="bg-white p-8 rounded-4xl shadow-xl border-2 border-green-500/30 relative flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                      DEGUSTAÇÃO
                    </div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        Teste Gratuito
                      </h3>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                        7 dias de acesso total
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black text-slate-900">
                        R$ 0
                      </span>
                      <span className="text-slate-400 font-bold">/7 dias</span>
                    </div>
                    <p className="text-green-600 font-bold mb-8 text-xs bg-green-50 inline-block px-3 py-1 rounded-full w-fit">
                      Garantia de cancelamento imediato
                    </p>
                    <ul className="space-y-4 mb-8 text-sm grow">
                      <li className="flex items-center gap-3 text-slate-600 font-medium">
                        <Check
                          size={20}
                          className="text-green-500 shrink-0 bg-green-50 p-1 rounded-full"
                        />{" "}
                        Acesso total à inteligência artificial
                      </li>
                      <li className="flex items-center gap-3 text-slate-600 font-medium">
                        <Check
                          size={20}
                          className="text-green-500 shrink-0 bg-green-50 p-1 rounded-full"
                        />{" "}
                        Crie qualquer tipo de atividade
                      </li>
                      <li className="flex items-center gap-3 text-slate-600 font-medium">
                        <Check
                          size={20}
                          className="text-green-500 shrink-0 bg-green-50 p-1 rounded-full"
                        />{" "}
                        Cancele quando quiser sem letras miúdas
                      </li>
                      <li className="flex items-center gap-3 text-slate-600 font-medium">
                        <Check
                          size={20}
                          className="text-green-500 shrink-0 bg-green-50 p-1 rounded-full"
                        />{" "}
                        Experimente antes de investir
                      </li>
                    </ul>
                    <button
                      onClick={() => handleUpgrade("trial")}
                      className="block text-center w-full py-5 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 transition shadow-xl shadow-green-100 active:scale-95 duration-200"
                    >
                      Começar Grátis
                    </button>
                  </div>
                )}

                {/* Pro */}
                <div className="bg-slate-900 p-8 rounded-4xl shadow-2xl border-2 border-blue-600 relative flex flex-col transform md:-translate-y-4 hover:shadow-blue-900/10 transition-all duration-300">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    RECOMENDADO
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Plano Pro
                    </h3>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                      Para o professor imparável
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-white">
                      R$ 45,90
                    </span>
                    <span className="text-slate-500 font-bold">/mês</span>
                  </div>
                  <p className="text-blue-400 font-bold mb-8 text-xs bg-blue-400/10 inline-block px-3 py-1 rounded-full w-fit">
                    Economize +20 horas semanais
                  </p>
                  <ul className="space-y-4 mb-8 text-sm grow">
                    <li className="flex items-center gap-3 text-slate-300 font-medium">
                      <Zap
                        size={20}
                        className="text-blue-400 shrink-0 bg-blue-400/10 p-1 rounded-full"
                      />{" "}
                      Geração ultra-rápida (Prioritária)
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 font-medium">
                      <Check
                        size={20}
                        className="text-blue-400 shrink-0 bg-blue-400/10 p-1 rounded-full"
                      />{" "}
                      Suporte VIP direto via WhatsApp
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 font-medium">
                      <Check
                        size={20}
                        className="text-blue-400 shrink-0 bg-blue-400/10 p-1 rounded-full"
                      />{" "}
                      Ideal para quem tem +2 turmas lotadas
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 font-medium">
                      <Check
                        size={20}
                        className="text-blue-400 shrink-0 bg-blue-400/10 p-1 rounded-full"
                      />{" "}
                      Acesso antecipado a novos modelos e layouts
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 font-medium font-bold text-blue-400">
                      <Check
                        size={20}
                        className="text-blue-400 shrink-0 bg-blue-400/10 p-1 rounded-full"
                      />{" "}
                      PDFs ilimitados e sem restrições
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("pro")}
                    className="block text-center w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-2xl shadow-blue-500/20 active:scale-95 duration-200"
                  >
                    Assinar Agora
                  </button>
                </div>

                {/* Normal */}
                <div className="bg-white p-8 rounded-4xl shadow-xl border border-slate-200 relative flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap">
                    PLANILHA BÁSICA
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Plano Normal
                    </h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Apoio para sua rotina
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-900">
                      R$ 21,90
                    </span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                  <p className="text-slate-500 font-bold mb-8 text-xs bg-slate-100 inline-block px-3 py-1 rounded-full w-fit">
                    Inteligência de alta qualidade
                  </p>
                  <ul className="space-y-4 mb-8 text-sm grow">
                    <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <Check
                        size={20}
                        className="text-slate-400 shrink-0 bg-slate-100 p-1 rounded-full"
                      />{" "}
                      IA de alta qualidade educativa
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <Check
                        size={20}
                        className="text-slate-400 shrink-0 bg-slate-100 p-1 rounded-full"
                      />{" "}
                      Fim das noites planejando aulas
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <Check
                        size={20}
                        className="text-slate-400 shrink-0 bg-slate-100 p-1 rounded-full"
                      />{" "}
                      Até 10 atividades incríveis por semana
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <Check
                        size={20}
                        className="text-slate-400 shrink-0 bg-slate-100 p-1 rounded-full"
                      />{" "}
                      Histórico completo de 30 dias salvo
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("normal")}
                    className="block text-center w-full py-5 border-2 border-slate-900 text-slate-900 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition active:scale-95 duration-200"
                  >
                    Assinar Básico
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Lock size={14} /> Pagamento processado com segurança pela{" "}
                  <strong>Cakto</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gray-50/50 pb-32 md:pb-32">
          <div
            className={`${result ? "max-w-3xl" : "max-w-6xl"} mx-auto space-y-6 pb-20 md:pb-0`}
          >
            {!result && !isGenerating && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800">
                      Olá, {user?.displayName?.split(" ")[0] || "Professor"}! 👋
                    </h1>
                    <p className="text-slate-500 font-medium">
                      O que vamos criar de incrível hoje?
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Buscar ferramentas..."
                        className="bg-white border-2 border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 font-bold text-sm outline-none focus:border-indigo-600 transition-all w-full md:w-64"
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Original Style Banner */}
                <div className="bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden mb-8 md:mb-10 shadow-2xl shadow-indigo-200">
                  <div className="relative z-10 space-y-3 md:space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/20">
                      <Sparkles
                        size={10}
                        className="fill-white md:w-[12px] md:h-[12px]"
                      />
                      <span>Inteligência Artificial</span>
                    </div>
                    <h2 className="text-2xl md:text-5xl font-black leading-tight tracking-tight">
                      Crie materiais incríveis <br />
                      em poucos{" "}
                      <span className="text-yellow-300">segundos.</span>
                    </h2>
                    <p className="text-indigo-100 font-bold max-w-lg text-xs md:text-lg">
                      Transforme suas ideias em planos de aula, atividades e
                      avaliações completas com o poder da IA.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-white/10 to-transparent pointer-events-none"></div>
                  <Zap
                    size={200}
                    className="absolute -bottom-10 -right-10 text-white/5 rotate-12"
                  />
                </div>

                {/* Original Prompt Bar Style */}
                <div className="mb-10 md:mb-12 relative group max-w-4xl mx-auto">
                  <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 to-blue-600 rounded-[2rem] blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
                  <form
                    onSubmit={handleGenerate}
                    className="relative bg-white border-2 border-slate-100 rounded-3xl p-2 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-2 transition-all group-focus-within:border-indigo-600"
                  >
                    <div className="flex-1 flex items-center px-4 gap-3 min-h-[80px] md:min-h-0">
                      <Sparkles
                        size={24}
                        className={`text-indigo-600 shrink-0 ${isGenerating ? "animate-spin" : ""}`}
                      />
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="O que vamos criar hoje? Ex: Um plano de aula sobre fotossíntese..."
                        className="w-full min-h-[60px] md:min-h-0 h-full py-3 md:py-4 font-bold text-slate-700 outline-none resize-none placeholder:text-slate-400 bg-transparent text-sm md:text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate(e as any);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="bg-indigo-600 text-white px-8 py-4 md:py-0 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] md:hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                      <span>Gerar</span>
                    </button>
                  </form>
                </div>

                {/* Big Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-16 px-2">
                  <button
                    onClick={() => {
                      const template =
                        activityTemplates.find((t) => t.id === "evaluation") ||
                        activityTemplates[0];
                      applyTemplate(template);
                    }}
                    className="flex-1 min-w-[240px] bg-white border-2 border-slate-100 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-600 transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">🖍️</div>
                      <span className="font-black text-slate-800">
                        Criar avaliações
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-slate-300 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                  <button
                    onClick={() => {
                      const template =
                        activityTemplates.find((t) => t.id === "correction") ||
                        activityTemplates[1];
                      applyTemplate(template);
                    }}
                    className="flex-1 min-w-[240px] bg-white border-2 border-slate-100 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-600 transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">📋</div>
                      <span className="font-black text-slate-800">
                        Corrigir avaliações
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-slate-300 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>

                {/* Minhas Aulas Section */}
                <div className="space-y-6 px-1 md:px-2">
                  <h3 className="text-xl font-black text-slate-900">
                    Minhas aulas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    <button
                      onClick={startNewActivity}
                      className="aspect-square bg-slate-50 rounded-3xl md:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 md:gap-4 text-slate-400 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlusCircle size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-black text-xs md:text-sm">
                        Criar
                      </span>
                    </button>
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => setResult(act.result)}
                        className="aspect-square bg-white rounded-3xl md:rounded-[2.5rem] border-2 border-slate-50 p-4 md:p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transform"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl">
                          {activityTemplates.find((t) => t.id === act.id)
                            ?.icon || "📝"}
                        </div>
                        <div className="mt-2 md:mt-4">
                          <p className="font-black text-slate-900 text-[10px] md:text-sm mb-0.5 md:mb-1 line-clamp-2 leading-tight">
                            {act.result?.title || act.prompt}
                          </p>
                          <p className="text-[8px] md:text-[10px] font-bold text-slate-400">
                            Sem turma
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentPrompt && (result || isGenerating) && (
              <div className="flex justify-end animate-in slide-in-from-right-4 duration-300">
                <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] shadow-lg shadow-indigo-100">
                  <p className="text-sm font-bold">{currentPrompt}</p>
                </div>
              </div>
            )}

            {isGenerating && !result && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border-2 border-slate-50 p-6 rounded-4xl rounded-tl-none shadow-xl shadow-slate-100 space-y-3">
                  <div className="h-4 w-48 bg-slate-100 rounded-full"></div>
                  <div className="h-4 w-32 bg-slate-50 rounded-full"></div>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 md:p-10 border-b bg-white/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10 gap-4">
                  <h2 className="text-xl md:text-3xl font-display font-black text-slate-900 truncate">
                    {result.title}
                  </h2>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() =>
                        result &&
                        handleDownloadPDF({
                          ...result,
                          title: result.title || "atividade",
                          layout,
                          includeImages,
                          wallpaperUrl: selectedWallpaper,
                        })
                      }
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition font-black shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />{" "}
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileText size={18} /> Baixar PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={startNewActivity}
                      className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                      title="Nova Atividade"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-10">
                  {/* Options Bar */}
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-4xl border-2 border-white mb-10 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          Incluir Ilustrações
                        </p>
                        <p className="text-xs text-slate-400 font-bold">
                          Gerar imagens para as questões
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIncludeImages(!includeImages)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ring-4 ring-offset-2 ring-transparent ${
                        includeImages ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                          includeImages ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Activity Content */}
                  <div className="space-y-12">
                    {/* Questions are rendered here as before but styled */}
                    {result.questions?.map((question, i) => (
                      <div key={i} className="space-y-6">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-indigo-100">
                            {i + 1}
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="font-black text-xl text-slate-900 leading-tight font-display">
                              {decodeHtmlEntities(question.questionText)}
                            </h3>
                          </div>
                        </div>

                        {question.imageUrl && (
                          <div className="ml-18 max-w-xl">
                            <img
                              src={question.imageUrl}
                              className="rounded-3xl border-4 border-slate-50 w-full shadow-lg"
                              alt="Ilustração"
                            />
                          </div>
                        )}

                        {question.alternatives && (
                          <div className="ml-18 grid gap-3">
                            {question.alternatives.map((alt, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border-2 border-white hover:border-indigo-100 transition-colors"
                              >
                                <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-100 font-black text-slate-400 text-xs">
                                  {String.fromCharCode(65 + j)}
                                </span>
                                <p className="font-bold text-slate-700">
                                  {decodeHtmlEntities(alt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-20 pt-10 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={startNewActivity}
                      className="px-10 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200"
                    >
                      <Zap size={20} /> Nova atividade do zero
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Guided Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-3xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">
                  {selectedTool?.icon || "📝"}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {selectedTool?.title}
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    Passo {wizardStep} de 2
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {wizardStep === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                      Assunto da aula
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Ciclo da Água, Revolução Francesa..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                      value={wizardData.topic}
                      onChange={(e) =>
                        setWizardData({ ...wizardData, topic: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                        Ano Escolar
                      </label>
                      <select
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                        value={wizardData.grade}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            grade: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecione...</option>
                        <option value="1ano">1º Ano</option>
                        <option value="2ano">2º Ano</option>
                        <option value="3ano">3º Ano</option>
                        <option value="4ano">4º Ano</option>
                        <option value="5ano">5º Ano</option>
                        <option value="6ano">6º Ano</option>
                        <option value="7ano">7º Ano</option>
                        <option value="8ano">8º Ano</option>
                        <option value="9ano">9º Ano</option>
                        <option value="em1">Ensino Médio - 1ª Série</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                        Disciplina
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Ciências, História..."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                        value={wizardData.discipline}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            discipline: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                      Habilidade BNCC (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: EF05CI02..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                      value={wizardData.bncc}
                      onChange={(e) =>
                        setWizardData({ ...wizardData, bncc: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                      Metodologia
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Tradicional", "Ativa", "Gamificação", "Inclusiva"].map(
                        (m) => (
                          <button
                            key={m}
                            onClick={() =>
                              setWizardData({ ...wizardData, methodology: m })
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${wizardData.methodology === m ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"}`}
                          >
                            {m}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                      Contexto Adicional
                    </label>
                    <textarea
                      placeholder="Algum detalhe específico para esta turma?"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm min-h-[100px]"
                      value={wizardData.context}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          context: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between gap-4">
              {wizardStep === 2 && (
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  Voltar
                </button>
              )}
              <div className="flex-1" />
              {wizardStep === 1 ? (
                <button
                  onClick={() => setWizardStep(2)}
                  disabled={!wizardData.topic}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const finalPrompt = `Gere uma atividade de ${selectedTool?.title} sobre ${wizardData.topic} para o ${wizardData.grade}. Disciplina: ${wizardData.discipline}. BNCC: ${wizardData.bncc}. Metodologia: ${wizardData.methodology}. Contexto: ${wizardData.context}.`;
                    setPrompt(finalPrompt);
                    setShowWizard(false);
                    // Use a synthetic event to trigger generation
                    const form = document.createElement("form");
                    handleGenerate({
                      preventDefault: () => {},
                    } as React.FormEvent);
                  }}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                >
                  <Sparkles size={18} className="fill-white" />
                  Gerar agora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Download Options Modal (Trial) */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-3xl max-w-lg w-full p-8 md:p-10 text-center animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="w-20 h-20 bg-linear-to-tr from-indigo-500 to-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <FileText size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Como deseja baixar?
            </h2>
            <p className="text-slate-600 mb-10 leading-relaxed font-medium">
              Você está no{" "}
              <span className="text-indigo-600 font-bold">Modo Grátis</span>.
              Escolha uma das opções abaixo para continuar:
            </p>

            <div className="space-y-4">
              <button
                onClick={() => result && handleDownloadPDF(result)}
                className="w-full py-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition duration-200 flex items-center justify-center gap-2 group"
              >
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                  Baixar apenas 1 questão no modo grátis
                </span>
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-300">
                  <span className="bg-white px-4">OU</span>
                </div>
              </div>

              <button
                onClick={() => handleUpgrade("normal")}
                className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all text-lg flex flex-col items-center justify-center leading-tight"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={20} className="text-yellow-300 fill-yellow-300" />
                  <span>Baixar 10 questões agora</span>
                </div>
                <span className="text-indigo-200 text-xs font-bold">
                  Por apenas R$ 21,90 — menos que uma pizza!
                </span>
              </button>

              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
