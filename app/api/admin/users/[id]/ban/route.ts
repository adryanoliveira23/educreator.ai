import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { banned } = await req.json();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    await adminDb.collection("users").doc(id).update({
      banned: banned,
    });

    return NextResponse.json({ success: true, banned });
  } catch (error) {
    console.error("Error updating ban status:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
