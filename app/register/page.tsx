"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { maskWhatsApp, cleanPhone } from "@/lib/utils";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
} from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject],
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!auth || !db) {
        throw new Error(
          "Configuração do Firebase ausente. Verifique as variáveis de ambiente.",
        );
      }

      // Get plan from URL
      const searchParams = new URLSearchParams(window.location.search);
      const plan = searchParams.get("plan") || "normal";

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const finalStatus = "pending_payment";

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        whatsapp: cleanPhone(whatsapp),
        plan: plan,
        accountType,
        subjects,
        pdfs_generated_count: 0,
        createdAt: serverTimestamp(),
        subscription_status: finalStatus,
        metadata: {
          trial_cookie_present: false,
          ip_address: "removed",
          user_agent:
            typeof window !== "undefined"
              ? window.navigator.userAgent
              : "unknown",
          registration_date: new Date().toISOString(),
        },
      });

      try {
        const token = await user.getIdToken();
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
          return;
        }
      } catch (paymentErr) {
        console.error("Failed to redirect to Cakto:", paymentErr);
      }
      router.push(`/dashboard?plan=${plan}`);
    } catch (err: unknown) {
      const firebaseError = err as { code: string; message: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          const searchParams = new URLSearchParams(window.location.search);
          const plan = searchParams.get("plan") || "normal";
          router.push(`/checkout?plan=${plan}`);
          return;
        } catch {
          setError("Este email já está em uso. Tente fazer login.");
        }
      } else if (firebaseError.code === "auth/weak-password") {
        setError("A senha é muito fraca.");
      } else {
        setError(
          firebaseError.message || "Erro ao registrar. Tente novamente.",
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Dynamic Header */}
      <header className="p-8 flex justify-between items-center bg-white border-b border-slate-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles size={24} fill="white" />
          </div>
          <span className="text-2xl font-display font-black tracking-tight text-slate-900">
            EduCreator AI
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
        >
          Sair <ArrowRight size={14} />
        </Link>
      </header>

      <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/30">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Step 1: Account Type */}
          {step === 1 && (
            <div className="space-y-12 text-center">
              <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900">
                Qual será seu tipo de conta?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { id: "teacher", label: "Professor", icon: "👨‍🏫" },
                  { id: "student", label: "Aluno", icon: "🎓" },
                  { id: "admin", label: "Administrador da escola", icon: "🏫" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setAccountType(type.id);
                      setStep(type.id === "teacher" ? 2 : 3);
                    }}
                    className="p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] text-left hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all group"
                  >
                    <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <span className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Subjects Selection */}
          {step === 2 && (
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-display font-black text-slate-900">
                  Você leciona quais disciplinas?
                </h2>
                <span className="text-slate-400 font-bold tracking-widest text-sm">
                  2 / 5
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  "Artes",
                  "Biologia",
                  "Ciências",
                  "Educação Física",
                  "Educação Infantil",
                  "Espanhol",
                  "Filosofia",
                  "Física",
                  "Geografia",
                  "História",
                  "Inglês",
                  "Matemática",
                  "Português",
                  "Química",
                  "Sociologia",
                  "Outra",
                ].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`px-6 py-3 rounded-full border-2 font-bold text-sm transition-all flex items-center gap-2 ${
                      subjects.includes(sub)
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                        : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-slate-400 font-black hover:text-slate-600"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Registration Form */}
          {step === 3 && (
            <div className="max-w-md mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-display font-black text-slate-900 mb-4">
                  Quase lá!
                </h2>
                <p className="text-slate-500 font-bold">
                  Crie seu acesso para começar a usar a IA.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in shake duration-500">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      placeholder="WhatsApp (com DDD)"
                      value={whatsapp}
                      onChange={(e) =>
                        setWhatsapp(maskWhatsApp(e.target.value))
                      }
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Crie uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 font-bold text-slate-900 focus:border-indigo-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Criar minha conta <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(accountType === "teacher" ? 2 : 1)}
                  className="w-full text-slate-400 font-black text-sm py-2 hover:text-slate-600"
                >
                  Voltar para o passo anterior
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <footer className="p-8 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
        © {new Date().getFullYear()} EduCreator AI. Segurança garantida.
      </footer>
    </div>
  );
}
