import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/collections";
import { subHours } from "date-fns";

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.TRAFFIC)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const traffic = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }));

    return NextResponse.json({ traffic });
  } catch (error) {
    console.error("Fetch Traffic Error:", error);
    return NextResponse.json(
      { error: "Error fetching traffic" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    // Delete logs older than 24 hours
    const cutoff = subHours(new Date(), 24);
    const snapshot = await adminDb
      .collection(COLLECTIONS.TRAFFIC)
      .where("timestamp", "<", cutoff)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, deletedCount: 0 });
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ success: true, deletedCount: snapshot.size });
  } catch (error) {
    console.error("Cleanup Traffic Error:", error);
    return NextResponse.json(
      { error: "Error cleaning up traffic" },
      { status: 500 },
    );
  }
}
