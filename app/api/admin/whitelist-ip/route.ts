import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { ip } = await req.json();

    if (!ip) {
      return NextResponse.json({ error: "IP is required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    await adminDb.collection("whitelisted_ips").doc(ip).set({
      ip,
      whitelistedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `IP ${ip} whitelisted`,
    });
  } catch (error) {
    console.error("Whitelist IP Error:", error);
    return NextResponse.json(
      { error: "Failed to whitelist IP" },
      { status: 500 },
    );
  }
}
