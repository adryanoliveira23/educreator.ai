import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const updateData = {
      plan: "trial",
      renovacao_em: expirationDate,
      "metadata.trial_cookie_present": false, // Reset fraud flag for this user
      "metadata.registration_date": new Date().toISOString(),
      subscription_status: "trial",
    };

    await adminDb.collection("users").doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Trial reset to 7 days",
    });
  } catch (error) {
    console.error("Error resetting trial:", error);
    return NextResponse.json(
      { error: "Failed to reset trial" },
      { status: 500 },
    );
  }
}
