"use client";

import { Zap, Clock, PlusCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserData {
  plan: string;
  subscription_status?: string;
  pdfs_generated_count?: number;
}

interface ActivityItem {
  id: string;
  result: {
    title: string;
    [key: string]: any;
  };
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
  setResult: (result: any) => void;
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

  const menuItems = [{ name: "Editor", href: "/dashboard", icon: Zap }];

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 bg-white border-r flex flex-col fixed md:relative h-dvh z-50 transition-all duration-300 shadow-xl md:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b text-center md:text-left">
          <Link
            href="/dashboard"
            className="flex items-center justify-center md:justify-start gap-2 mb-6"
          >
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Edu<span className="text-blue-600">Creator</span>
            </h1>
          </Link>

          {startNewActivity && (
            <button
              onClick={startNewActivity}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md shadow-blue-100 active:scale-95"
            >
              <PlusCircle size={20} />
              Nova Atividade
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Navigation */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 text-center md:text-left">
              Navegação
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.name}
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Plan Info */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 text-center md:text-left">
              Seu Plano
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 text-sm capitalize">
                  {userData.plan === "trial" ? "Teste Grátis" : userData.plan}
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                  Ativo
                </span>
              </div>
              <button
                onClick={() => setShowPlans(true)}
                className="w-full py-2 bg-white border border-slate-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-sm"
              >
                Mudar Plano
              </button>
            </div>
          </div>

          {/* History */}
          {activities.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 flex items-center gap-2">
                <Clock size={12} /> Histórico
              </h3>
              <div className="space-y-1">
                {activities.slice(0, 5).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setResult && setResult(act.result)}
                    className="w-full text-left p-3 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all truncate"
                  >
                    {act.result?.title || act.prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
}
