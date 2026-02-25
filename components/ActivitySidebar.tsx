"use client";

import {
  Zap,
  PlusCircle,
  LogOut,
  Home,
  FolderOpen,
  Calendar,
  Users,
  Globe,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserData {
  plan: string;
  subscription_status?: string;
  pdfs_generated_count?: number;
}

interface ActivityQuestion {
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

interface ActivityResult {
  title: string;
  header: {
    studentName: string;
    school: string;
    teacherName: string;
  };
  questions: ActivityQuestion[];
  layout?: "standard" | "one_per_page" | "two_per_page";
  includeImages?: boolean;
  wallpaperUrl?: string | null;
}

interface ActivityItem {
  id: string;
  result: ActivityResult;
  prompt: string;
  timestamp?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface ActivitySidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  startNewActivity: () => void;
  userData: UserData;
  activities: ActivityItem[];
  setResult: (result: ActivityResult) => void;
  setShowPlans: (show: boolean) => void;
  handleLogout: () => void;
}

export default function ActivitySidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  startNewActivity,
  userData,
  activities = [],
  setResult,
  setShowPlans,
  handleLogout,
}: ActivitySidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Início", href: "/dashboard", icon: Home },
    { name: "Meus materiais", href: "#", icon: FolderOpen },
    { name: "Calendário", href: "/calendar", icon: Calendar },
    { name: "Turmas", href: "#", icon: Users },
    { name: "Comunidade", href: "#", icon: Globe },
  ];

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 bg-slate-50/80 backdrop-blur-xl border-r border-slate-200 flex flex-col fixed md:relative h-dvh z-50 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 mb-8 group"
          >
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Zap size={22} className="text-white fill-white" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight font-display">
              Edu<span className="text-indigo-600">Creator</span>
            </h1>
          </Link>

          <button
            onClick={startNewActivity}
            className="w-full bg-white border-2 border-slate-100 text-indigo-600 py-3.5 px-4 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-black text-sm shadow-sm active:scale-95 mb-6"
          >
            <PlusCircle size={20} />
            Nova Atividade
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
          {/* Main Navigation */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href && item.href !== "#";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Training & Resources */}
          <div className="pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-indigo-600 hover:bg-white transition-all font-bold text-xs text-left">
                <Sparkles size={16} /> Convide um amigo
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-white transition-all font-bold text-xs text-left">
                <BookOpen size={16} /> Treinamentos e recursos
              </button>
            </div>
          </div>

          {/* History Snippet */}
          {activities.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">
                Recentes
              </h3>
              <div className="space-y-1">
                {activities.slice(0, 3).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      setResult(act.result);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-white hover:text-indigo-600 transition-all truncate"
                  >
                    {act.result?.title || act.prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-4 mt-auto space-y-4">
          {/* Plan Indicator */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Seu Plano
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                  userData.plan === "pro"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {userData.plan === "trial" ? "Grátis" : userData.plan}
              </span>
            </div>
            <p className="font-black text-slate-900 text-xs mb-3">
              {userData.plan === "pro"
                ? "Creator Pro Unlimit"
                : "Versão Gratuita"}
            </p>
            <button
              onClick={() => setShowPlans(true)}
              className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all"
            >
              {userData.plan === "pro" ? "Ver Detalhes" : "Fazer Upgrade"}
            </button>
          </div>

          <div className="bg-indigo-600/5 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-indigo-600/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                5
              </div>
              <span className="text-xs font-black text-slate-900">
                Primeiros Passos
              </span>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-400 group-hover:translate-x-1 transition-transform"
            />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xs"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
}
