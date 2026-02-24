const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();

const COLLECTIONS_TO_DELETE = [
  "activities",
  "analytics_events",
  "sessions",
  "traffic_monitor",
];

async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function runCleanup() {
  console.log("🚀 Starting Firestore Cleanup...");

  for (const collectionName of COLLECTIONS_TO_DELETE) {
    console.log(`🧹 Cleaning collection: ${collectionName}...`);
    try {
      await deleteCollection(collectionName, 100);
      console.log(`✅ Collection ${collectionName} cleaned.`);
    } catch (err) {
      console.error(`❌ Error cleaning ${collectionName}:`, err.message);
    }
  }

  console.log("✨ Cleanup complete! Only 'users' were spared.");
}

runCleanup();
