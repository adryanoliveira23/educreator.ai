"use client";

export type EventType =
  | "PAGE_VIEW"
  | "SESSION_START"
  | "SESSION_END"
  | "CLICK"
  | "CONVERSION"
  | "DROP_OFF"
  | "SCROLL"
  | "SECTION_VIEW"
  | "DEAD_CLICK";

export interface AnalyticsEvent {
  type: EventType;
  path: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export const logEvent = async (event: Omit<AnalyticsEvent, "timestamp">) => {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...event,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error("Failed to log event:", error);
  }
};

export const generateSessionId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
