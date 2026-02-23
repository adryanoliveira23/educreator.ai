import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/collections";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, path, timestamp, sessionId, userId, metadata } = body;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    // Save event
    await adminDb.collection(COLLECTIONS.ANALYTICS).add({
      type,
      path,
      timestamp: new Date(timestamp),
      sessionId,
      userId: userId || null,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    // Update or create session
    const sessionRef = adminDb.collection(COLLECTIONS.SESSIONS).doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (type === "SESSION_START") {
      await sessionRef.set(
        {
          sessionId,
          userId: userId || null,
          startTime: new Date(timestamp),
          lastActive: new Date(timestamp),
          startPath: path,
          device: metadata?.device || "unknown",
          platform: metadata?.platform || "unknown",
        },
        { merge: true },
      );
    } else {
      await sessionRef.set(
        {
          lastActive: new Date(timestamp),
          duration: sessionDoc.exists
            ? (timestamp - sessionDoc.data()?.startTime.toDate().getTime()) /
              1000
            : 0,
        },
        { merge: true },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
