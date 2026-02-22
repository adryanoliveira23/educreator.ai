"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

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

      // Create user document in Firestore
      const isTrial = plan === "trial";

      // Check for fraud prevention cookie (client-side check here as well)
      const hasUsedTrial = document.cookie.includes(
        "educreator_trial_used=true",
      );
      const finalStatus =
        isTrial && !hasUsedTrial ? "trial" : "pending_payment";

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        plan: plan,
        pdfs_generated_count: 0,
        createdAt: serverTimestamp(),
        subscription_status: finalStatus,
        metadata: {
          trial_cookie_present: hasUsedTrial,
          user_agent:
            typeof window !== "undefined"
              ? window.navigator.userAgent
              : "unknown",
          registration_date: new Date().toISOString(),
        },
      });

      if (isTrial && !hasUsedTrial) {
        // Set fraud prevention cookie
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `educreator_trial_used=true; expires=${date.toUTCString()}; path=/`;

        router.push("/dashboard");
      } else if (isTrial && hasUsedTrial) {
        // Already used trial, redirect to checkout/plans (or just dashboard with plans open)
        router.push("/dashboard?showPlans=true");
      } else {
        // Paid plans: Direct redirect to Cakto
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
        // Fallback or if already used trial
        router.push(`/dashboard?plan=${plan}`);
      }
    } catch (err: unknown) {
      // Basic mapping for common codes if available on the error object
      const firebaseError = err as { code: string; message: string };

      if (firebaseError.code === "auth/email-already-in-use") {
        try {
          // Try to login and continue
          await signInWithEmailAndPassword(auth, email, password);
          const searchParams = new URLSearchParams(window.location.search);
          const plan = searchParams.get("plan") || "normal";

          router.push(`/checkout?plan=${plan}`);
          return; // Success, don't show error
        } catch (loginErr) {
          console.error("Auto-login failed:", loginErr);
          // If login fails, default to showing the original error or a generic one
          setError("Este email já está em uso. Tente fazer login.");
        }
      } else if (firebaseError.code === "auth/weak-password") {
        setError("A senha é muito fraca.");
      } else {
        setError(
          firebaseError.message || "Erro ao registrar. Tente novamente.",
        );
      }

      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-600 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="brightness-0 invert object-contain"
            />
            <h1 className="text-2xl font-bold">EduCreator AI</h1>
          </div>
          <h2 className="text-4xl font-bold max-w-md leading-tight mb-4">
            Junte-se a milhares de educadores inovadores.
          </h2>
          <p className="text-blue-100 max-w-sm text-lg">
            Comece a criar conteúdo educacional de alta qualidade hoje mesmo.
          </p>
        </div>

        <div className="z-10 text-sm text-blue-200">
          © {new Date().getFullYear()} EduCreator AI. Todos os direitos
          reservados.
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Crie sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              É rápido, fácil e gratuito para começar.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Seu endereço de email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
                    placeholder="Crie uma senha segura"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <span className="flex items-center gap-2">
                    Criar conta <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Já é membro?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Entrar na sua conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
