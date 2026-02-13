import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Robust private key parsing
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    console.error(
      "❌ FIREBASE_PRIVATE_KEY is missing from environment variables.",
    );
  } else {
    // Handle literal \n characters (common in .env files)
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    // Ensure it starts/ends correctly just in case
    if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
      console.warn(
        "⚠️ FIREBASE_PRIVATE_KEY does not start with -----BEGIN PRIVATE KEY-----",
      );
    }
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing Firebase Admin environment variables:", {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
    });
  } else {
    try {
      console.log("Initializing Firebase Admin with project:", projectId);
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin initialized successfully.");
    } catch (error) {
      console.error("❌ Firebase admin initialization error:", error);
    }
  }
}

// Export auth and firestore, but check if app exists to avoid "default app does not exist" on import if init failed
const adminAuth = admin.apps.length ? admin.auth() : null;
const adminDb = admin.apps.length ? admin.firestore() : null;

export { adminAuth, adminDb };
