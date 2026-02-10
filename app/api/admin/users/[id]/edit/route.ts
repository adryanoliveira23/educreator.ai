import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { email, plan, role } = await req.json();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    const updateData: Record<string, string> = {};

    if (email) updateData.email = email;
    if (plan) updateData.plan = plan;
    if (role) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

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
