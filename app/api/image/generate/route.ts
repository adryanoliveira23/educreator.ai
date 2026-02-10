import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

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
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
    const uid = decodedToken.uid;

    // Check user limits
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = userData.plan || "normal";
    const usage = userData.pdfs_generated_count || 0;
    const role = userData.role || "user";
    const limits: Record<string, number> = {
      normal: 10,
      pro: 30,
      premium: 999999,
    };

    // Admins have infinite access
    if (role !== "admin" && usage >= limits[plan]) {
      return NextResponse.json(
        { error: "Limit reached. Upgrade your plan." },
        { status: 403 },
      );
    }

    const { prompt } = await req.json();

    // Use Hugging Face public API
    const API_URL =
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${errorText}`);
    }

    // Convert response to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64Image}`,
      prompt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
