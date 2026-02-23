import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/collections";
import { startOfDay, subDays, endOfDay, parseISO } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const dateParam = searchParams.get("date");
    const pathParam = searchParams.get("path") || "/";

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    let startDate: Date;
    let endDate: Date;
    let days = 7;

    if (dateParam) {
      startDate = startOfDay(parseISO(dateParam));
      endDate = endOfDay(parseISO(dateParam));
      days = 1;
    } else {
      days = parseInt(daysParam || "7");
      startDate = startOfDay(subDays(new Date(), days - 1));
      endDate = endOfDay(new Date());
    }

    // Fetch Events
    const eventsSnapshot = await adminDb
      .collection(COLLECTIONS.ANALYTICS)
      .where("timestamp", ">=", startDate)
      .where("timestamp", "<=", endDate)
      .orderBy("timestamp", "asc")
      .get();

    const viewsByDay: Record<
      string,
      { date: string; views: number; visitors: Set<string> }
    > = {};
    const heatmap = [] as { x: number; y: number; weight: number }[];
    const segments = Array(10).fill(0);
    const devices = { desktop: 0, mobile: 0 };
    const deadClickInsights: Record<string, number> = {};
    const behavior = {
      deadClicks: 0,
      totalClicks: 0,
    };

    // Funnel Steps (Detailed)
    const funnelSteps = {
      visited: new Set(),
      demo_view: new Set(),
      pricing_view: new Set(),
      reg_start: new Set(),
      reg_success: new Set(),
      checkout_start: new Set(),
      paid: new Set(),
    };

    // Initialize days for charts
    if (!dateParam) {
      for (let i = 0; i < days; i++) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().split("T")[0];
        viewsByDay[dateStr] = { date: dateStr, views: 0, visitors: new Set() };
      }
    } else {
      const dateStr = startDate.toISOString().split("T")[0];
      viewsByDay[dateStr] = { date: dateStr, views: 0, visitors: new Set() };
    }

    eventsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const dateStr = data.timestamp.toDate()
        ? data.timestamp.toDate().toISOString().split("T")[0]
        : data.timestamp.toISOString().split("T")[0];
      const sid = data.sessionId;
      const path = data.path || "";

      if (viewsByDay[dateStr]) {
        if (data.type === "PAGE_VIEW") viewsByDay[dateStr].views++;
        viewsByDay[dateStr].visitors.add(sid);
      }

      // Heatmap & Dwell tracking for specific path
      if (path === pathParam) {
        if (
          (data.type === "CLICK" || data.type === "DEAD_CLICK") &&
          data.metadata?.x &&
          data.metadata?.y
        ) {
          heatmap.push({ x: data.metadata.x, y: data.metadata.y, weight: 1 });
        }
        if (
          data.type === "SECTION_VIEW" &&
          typeof data.metadata?.segment === "number"
        ) {
          segments[data.metadata.segment] += data.metadata.duration || 0;
        }
      }

      // Device Tracking
      if (data.type === "SESSION_START" && data.metadata?.device) {
        if (data.metadata.device === "mobile") devices.mobile++;
        else devices.desktop++;
      }

      // Detailed Funnel
      funnelSteps.visited.add(sid);
      if (data.type === "SECTION_VIEW" && data.metadata?.sectionId === "demo")
        funnelSteps.demo_view.add(sid);
      if (data.type === "SECTION_VIEW" && data.metadata?.sectionId === "precos")
        funnelSteps.pricing_view.add(sid);
      if (path.includes("/register")) funnelSteps.reg_start.add(sid);
      if (path.includes("/dashboard")) funnelSteps.reg_success.add(sid);
      if (path.includes("/checkout")) funnelSteps.checkout_start.add(sid);

      if (data.type === "DEAD_CLICK") {
        behavior.deadClicks++;
        const element = data.metadata?.tagName || "UNKNOWN";
        deadClickInsights[element] = (deadClickInsights[element] || 0) + 1;
      }
      if (data.type === "CLICK") behavior.totalClicks++;
    });

    const funnelData = [
      { name: "Visitas", value: funnelSteps.visited.size, drop: 0 },
      {
        name: "Viu Demo",
        value: funnelSteps.demo_view.size,
        drop: funnelSteps.visited.size
          ? Math.round(
              (1 - funnelSteps.demo_view.size / funnelSteps.visited.size) * 100,
            )
          : 0,
      },
      {
        name: "Viu Preços",
        value: funnelSteps.pricing_view.size,
        drop: funnelSteps.demo_view.size
          ? Math.round(
              (1 - funnelSteps.pricing_view.size / funnelSteps.demo_view.size) *
                100,
            )
          : 0,
      },
      {
        name: "Iniciou Registro",
        value: funnelSteps.reg_start.size,
        drop: funnelSteps.pricing_view.size
          ? Math.round(
              (1 - funnelSteps.reg_start.size / funnelSteps.pricing_view.size) *
                100,
            )
          : 0,
      },
      {
        name: "Conta Criada",
        value: funnelSteps.reg_success.size,
        drop: funnelSteps.reg_start.size
          ? Math.round(
              (1 - funnelSteps.reg_success.size / funnelSteps.reg_start.size) *
                100,
            )
          : 0,
      },
      {
        name: "Checkout",
        value: funnelSteps.checkout_start.size,
        drop: funnelSteps.reg_success.size
          ? Math.round(
              (1 -
                funnelSteps.checkout_start.size /
                  funnelSteps.reg_success.size) *
                100,
            )
          : 0,
      },
    ];

    // Fetch Sessions
    const sessionsSnapshot = await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .where("lastActive", ">=", startDate)
      .get();

    let totalDuration = 0;
    let sessionCount = 0;
    sessionsSnapshot.docs.forEach((doc) => {
      const d = doc.data();
      if (d.duration) {
        totalDuration += d.duration;
        sessionCount++;
      }
    });

    return NextResponse.json({
      viewsOverTime: Object.values(viewsByDay)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ ...d, visitors: d.visitors.size })),
      avgSessionDuration: sessionCount > 0 ? totalDuration / sessionCount : 0,
      funnel: funnelData,
      heatmap,
      attentionSegments: segments,
      behavior: {
        deadClicks: behavior.deadClicks,
        totalClicks: behavior.totalClicks,
        confusionRate: behavior.totalClicks
          ? Math.round((behavior.deadClicks / behavior.totalClicks) * 100)
          : 0,
        deadClickInsights: Object.entries(deadClickInsights)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5),
      },
      devices,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
