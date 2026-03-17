import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { ip, action } = await req.json();

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    const updateData: admin.firestore.DocumentData = {};
    if (action === "whitelist") {
      updateData["metadata.whitelisted_ips"] =
        admin.firestore.FieldValue.arrayUnion(ip);
      // Also reset trial fraud flag if whitelisting
      updateData["metadata.trial_cookie_present"] = false;
    } else if (action === "remove") {
      updateData["metadata.whitelisted_ips"] =
        admin.firestore.FieldValue.arrayRemove(ip);
    }

    await adminDb.collection("users").doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: `IP ${ip} ${action === "whitelist" ? "whitelisted" : "removed"}`,
    });
  } catch (error) {
    console.error("Error updating whitelist:", error);
    return NextResponse.json(
      { error: "Failed to update whitelist" },
      { status: 500 },
    );
  }
}
