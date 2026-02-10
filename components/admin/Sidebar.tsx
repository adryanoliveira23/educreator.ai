import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-gray-800 bg-gray-900 text-white md:flex">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-500">
          EDU<span className="text-white">ADMIN</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          <LayoutDashboard size={20} className="text-blue-500" />
          Dashboard
        </Link>
        <Link
          href="/admin/dashboard/users"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          <Users size={20} />
          Usuários
        </Link>
        <Link
          href="/admin/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          <Settings size={20} />
          Configurações
        </Link>
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-gray-800 hover:text-red-300">
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
