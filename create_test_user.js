const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!getApps().length) {
  adminConfig = {
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  };
  initializeApp(adminConfig);
}

const db = getFirestore();

async function createTestUser() {
  const userId = "test_trial_user_" + Date.now();
  const renovacaoEm = new Date();
  renovacaoEm.setDate(renovacaoEm.getDate() + 5); // 5 days from now

  await db
    .collection("users")
    .doc(userId)
    .set({
      email: "test_trial@example.com",
      plan: "trial",
      subscription_status: "active",
      pdfs_generated_count: 0,
      createdAt: new Date(),
      renovacao_em: Timestamp.fromDate(renovacaoEm),
    });

  console.log(`Test user created: ${userId}`);
}

createTestUser().catch(console.error);
