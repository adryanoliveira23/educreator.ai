"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      let msg = "Falha no login.";
      if (err.code === "auth/invalid-credential") {
        msg = "Email ou senha incorretos.";
      } else if (err.code === "auth/user-not-found") {
        msg = "Usuário não encontrado.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Senha incorreta.";
      }
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 to-green-800 text-white p-12 flex-col justify-between relative overflow-hidden">
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
            Transforme a educação com o poder da IA.
          </h2>
          <p className="text-green-100 max-w-sm text-lg">
            Crie planos de aula, atividades e materiais didáticos em segundos.
          </p>
        </div>

        <div className="z-10 text-sm text-green-200">
          © {new Date().getFullYear()} EduCreator AI. Todos os direitos
          reservados.
        </div>

        {/* Abstract shapes/decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Entre para continuar criando.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4 rounded-md shadow-sm">
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
                    className="relative block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                    placeholder="Seu endereço de email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                    placeholder="Sua senha"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar <ArrowRight className="h-4 w-4" />
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
              <span className="bg-white px-2 text-gray-500">
                Novo por aqui?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Criar conta gratuitamente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
