"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logEvent, generateSessionId } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<number>(0);
  const segmentDurationRef = useRef<Record<number, number>>({});
  const lastActiveSegmentRef = useRef<number | null>(null);
  const segmentStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initialize session
    if (!sessionIdRef.current) {
      const storedSession = localStorage.getItem("analytics_session_id");
      const sessionExpiry = localStorage.getItem("analytics_session_expiry");

      const now = Date.now();
      if (storedSession && sessionExpiry && parseInt(sessionExpiry) > now) {
        sessionIdRef.current = storedSession;
      } else {
        const newSessionId = generateSessionId();
        sessionIdRef.current = newSessionId;
        localStorage.setItem("analytics_session_id", newSessionId);

        logEvent({
          type: "SESSION_START",
          path: pathname,
          sessionId: newSessionId,
          metadata: {
            device: window.innerWidth < 768 ? "mobile" : "desktop",
            platform: navigator.platform,
            userAgent: navigator.userAgent,
          },
        });
      }
    }

    // Update expiry
    localStorage.setItem(
      "analytics_session_expiry",
      (Date.now() + 30 * 60 * 1000).toString(),
    );

    // Track Page View
    logEvent({
      type: "PAGE_VIEW",
      path: pathname,
      sessionId: sessionIdRef.current!,
    });

    // Track Traffic (IP/City)
    fetch("/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId: sessionIdRef.current!,
      }),
    }).catch((err) => console.error("Traffic log failed", err));

    // 1. Scroll & Segment Dwell Tracking
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrollPos = window.scrollY;

      // Precision scroll depth tracking
      const pct = Math.round((scrollPos / docHeight) * 100);
      if (pct > scrollRef.current + 10) {
        scrollRef.current = pct;
        logEvent({
          type: "SCROLL",
          path: pathname,
          sessionId: sessionIdRef.current!,
          metadata: { depth: pct },
        });
      }

      // Segment dwell tracking (divide page into 10 segments of 10%)
      const currentSegment = Math.floor(
        (scrollPos + winHeight / 2) /
          (document.documentElement.scrollHeight / 10),
      );
      if (currentSegment !== lastActiveSegmentRef.current) {
        if (lastActiveSegmentRef.current !== null) {
          const duration = (Date.now() - segmentStartTimeRef.current) / 1000;
          if (duration > 0.5) {
            logEvent({
              type: "SECTION_VIEW",
              path: pathname,
              sessionId: sessionIdRef.current!,
              metadata: { segment: lastActiveSegmentRef.current, duration },
            });
          }
        }
        lastActiveSegmentRef.current = currentSegment;
        segmentStartTimeRef.current = Date.now();
      }
    };

    // 2. High-Fidelity Click Tracking (Heatmap Data)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest(
        'button, a, input, [role="button"]',
      );

      // Click coordinates as percentages of viewport
      const x = (e.clientX / window.innerWidth) * 100;
      const yPercent =
        ((window.scrollY + e.clientY) / document.documentElement.scrollHeight) *
        100;

      logEvent({
        type: isInteractive ? "CLICK" : "DEAD_CLICK",
        path: pathname,
        sessionId: sessionIdRef.current!,
        metadata: {
          x,
          y: yPercent,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          tagName: target.tagName,
          text: target.innerText?.substring(0, 20),
        },
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleGlobalClick);
      // Log final segment
      if (lastActiveSegmentRef.current !== null) {
        const duration = (Date.now() - segmentStartTimeRef.current) / 1000;
        logEvent({
          type: "SECTION_VIEW",
          path: pathname,
          sessionId: sessionIdRef.current!,
          metadata: { segment: lastActiveSegmentRef.current, duration },
        });
      }
    };
  }, [pathname]);

  return null;
}
