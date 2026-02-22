import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { email, plan, role, whatsapp } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    const updateData = {
      email,
      plan: plan || "normal",
      role: role || "user",
      whatsapp: whatsapp || "",
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("users").doc(id).update(updateData);

    return NextResponse.json({ success: true, updated: updateData });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
