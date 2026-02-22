import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip");

    if (!ip || ip === "unknown") {
      return NextResponse.json({ alreadyUsed: false });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    // Search for users with the same IP in trial mode
    const snapshot = await adminDb
      .collection("users")
      .where("metadata.ip_address", "==", ip)
      .where("plan", "==", "trial")
      .limit(1)
      .get();

    return NextResponse.json({ alreadyUsed: !snapshot.empty });
  } catch (error) {
    console.error("IP Check Error:", error);
    return NextResponse.json({ alreadyUsed: false });
  }
}
