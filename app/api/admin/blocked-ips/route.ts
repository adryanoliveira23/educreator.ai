import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(_req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    const snapshot = await adminDb
      .collection("blocked_ips")
      .orderBy("blockedAt", "desc")
      .get();

    const blockedIps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ blockedIps });
  } catch (error) {
    console.error("Failed to fetch blocked IPs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    const { ip, reason } = await req.json();

    if (!ip) {
      return NextResponse.json({ error: "IP is required" }, { status: 400 });
    }

    const newBlock = {
      ip,
      reason: reason || "Manual block",
      blockedAt: new Date().toISOString(),
    };

    await adminDb.collection("blocked_ips").add(newBlock);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to block IP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await adminDb.collection("blocked_ips").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unblock IP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
