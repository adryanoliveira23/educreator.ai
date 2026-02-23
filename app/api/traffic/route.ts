import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/collections";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, sessionId } = body;
    const headerList = await headers();

    // Capture IP and City from Vercel headers
    // x-forwarded-for: IP address
    // x-vercel-ip-city: City name (Vercel specific)
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const city = headerList.get("x-vercel-ip-city") || "unknown";
    const country = headerList.get("x-vercel-ip-country") || "unknown";

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    // Save traffic event
    await adminDb.collection(COLLECTIONS.TRAFFIC).add({
      path,
      sessionId,
      ip,
      city,
      country,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Traffic Logging Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
