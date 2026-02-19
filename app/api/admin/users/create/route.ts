import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, password, plan, role } = await req.json();

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists in Firestore
    const existingUser = await adminDb
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        {
          error:
            "E-mail já está sendo usado por outro usuário no banco de dados.",
        },
        { status: 400 },
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: false,
    });

    // Create user document in Firestore
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email,
        plan: plan || "normal",
        role: role || "user",
        pdfs_generated_count: 0,
        createdAt: new Date().toISOString(),
        subscription_status: "active",
        banned: false,
      });

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    const err = error as { code?: string; message?: string };
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create user", details: err.message },
      { status: 500 },
    );
  }
}
