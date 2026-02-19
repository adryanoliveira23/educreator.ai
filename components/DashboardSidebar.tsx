"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Target,
  Zap,
  Users,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const menuItems = [
    { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { name: "Caixa Diário", href: "/dashboard/cash", icon: Wallet },
    {
      name: "Custos & Despesas",
      href: "/dashboard/expenses",
      icon: TrendingUp,
    },
    { name: "Metas", href: "/dashboard/goals", icon: Target },
    { name: "IA Consultora", href: "/dashboard/ai", icon: Zap },
    { name: "Colaboradores", href: "/dashboard/employees", icon: Users },
    { name: "Assinaturas", href: "/dashboard/subscriptions", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#111] text-white hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#820AD1]">
          Salão<span className="text-white">Pro</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#820AD1] text-white shadow-lg shadow-purple-900/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition font-medium"
        >
          <Settings size={20} />
          Configurações
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
