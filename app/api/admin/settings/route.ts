import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json(
      { error: "Server Configuration Error: Firebase Admin not initialized" },
      { status: 500 },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settingsDoc = await adminDb
      .collection("system")
      .doc("settings")
      .get();

    if (!settingsDoc.exists) {
      // Default settings
      return NextResponse.json({
        siteName: "EduCreator.ai",
        contactEmail: "portexzao@gmail.com",
        isTrialEnabled: true,
        maintenanceMode: false,
      });
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json(
      { error: "Server Configuration Error: Firebase Admin not initialized" },
      { status: 500 },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newSettings = await req.json();

    await adminDb
      .collection("system")
      .doc("settings")
      .set(
        {
          ...newSettings,
          updatedAt: new Date().toISOString(),
          updatedBy: uid,
        },
        { merge: true },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
