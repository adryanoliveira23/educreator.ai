"use client";

import { useAuth } from "@/components/AuthProvider";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#820AD1] bg-[#F5F5F5]">
        Carregando...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex font-sans text-[#111]">
      <DashboardSidebar />
      <div className="flex-1 md:ml-64 relative min-h-screen">{children}</div>
    </div>
  );
}
