"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import ActivitySidebar from "@/components/ActivitySidebar";
import { useTranslations } from "next-intl";

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
}

interface Activity {
  id: string;
  userId: string;
  prompt: string;
  result: {
    title: string;
    header: {
      studentName: string;
      school: string;
      teacherName: string;
    };
    questions: Question[];
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
    toDate?: () => Date;
  };
  date?: string;
}

interface UserData {
  plan: string;
  pdfs_generated_count: number;
  subscription_status?: string;
}

export default function CalendarPage({params: {locale}}: {params: {locale: string}}) {
  const t = useTranslations("Calendar");
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch activities from Firestore
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // Fetch user data
      const userRes = await getDocs(
        query(collection(db, "users"), where("__name__", "==", user.uid)),
      );
      if (!userRes.empty) {
        setUserData(userRes.docs[0].data() as UserData);
      }

      // Fetch activities
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
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  // Helper to get days of the current week
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentDate);

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  if (loading || !userData)
    return (
      <div className="flex items-center justify-center min-h-screen text-indigo-600">
        <ChevronRight className="animate-spin mr-2" /> {t('loading')}
      </div>
    );

  return (
    <div className="flex h-dvh bg-gray-100 font-sans relative overflow-hidden">
      <ActivitySidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        startNewActivity={() => {}}
        userData={userData}
        activities={activities}
        setResult={() => {}}
        setShowPlans={() => {}}
        handleLogout={() => {}}
      />

      <main className="flex-1 flex flex-col pt-12 md:pt-0 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 md:p-10 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-black text-slate-900 font-display">
              {t('title')}
            </h1>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setView("week")}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${view === "week" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t('week')}
              </button>
              <button
                onClick={() => setView("month")}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${view === "month" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t('month')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border-2 border-slate-100 rounded-xl px-4 py-2 shadow-sm">
              <button
                onClick={() => navigateDate(-1)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-black text-sm text-slate-700 min-w-[120px] text-center capitalize">
                {currentDate.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => navigateDate(1)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:border-indigo-600 transition-all shadow-sm">
                {t('myPlans')}
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                <Plus size={20} />
                {t('plan')}
              </Link>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {view === "week" ? (
            <div className="grid grid-cols-7 gap-6 min-w-[1000px] h-full">
              {weekDays.map((day, i) => {
                const isToday =
                  new Date().toDateString() === day.toDateString();
                const dayActivities = activities.filter((act) => {
                  if (!act.createdAt) return false;
                  const date = act.createdAt.toDate
                    ? act.createdAt.toDate()
                    : act.createdAt.seconds
                      ? new Date(act.createdAt.seconds * 1000)
                      : null;
                  return date && date.toDateString() === day.toDateString();
                });

                return (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {day
                          .toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { weekday: "short" })
                          .replace(".", "")}
                      </p>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-lg font-black ${isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-900 hover:bg-white transition-colors"}`}
                      >
                        {day.getDate()}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
                      {dayActivities.map((act) => (
                        <div
                          key={act.id}
                          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm"
                        >
                          <p className="text-xs font-black text-slate-800 line-clamp-2">
                            {act.result?.title || act.prompt}
                          </p>
                        </div>
                      ))}
                      <button className="aspect-3/4 bg-white rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group p-6">
                        <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus size={20} />
                        </div>
                        <span className="font-black text-xs text-center leading-tight">
                          {t('createLesson')}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm">
              <div className="grid grid-cols-7 gap-4">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4"
                    >
                      {day}
                    </div>
                  ),
                )}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-50/50 rounded-2xl border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all cursor-pointer p-3 group relative"
                  >
                    <span className="text-xs font-black text-slate-400 group-hover:text-indigo-600">
                      {i + 1}
                    </span>
                    {i % 7 === 2 && (
                      <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-amber-400 rounded-full shadow-sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
