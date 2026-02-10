import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-8 text-white">
      <div>
        <h2 className="text-lg font-semibold text-gray-200">Visão Geral</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-blue-500">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-gray-300">Admin</span>
        </div>
      </div>
    </header>
  );
}
