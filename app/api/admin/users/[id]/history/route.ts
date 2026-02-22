import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
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

    const userDoc = await adminDb.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    const activitiesSnapshot = await adminDb
      .collection("activities")
      .where("userId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const history = activitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.result?.title || data.title || "Atividade Gerada",
        prompt: data.prompt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        type: data.result?.questions?.[0]?.type || "unknown",
      };
    });

    return NextResponse.json({
      user: {
        id: userDoc.id,
        email: userData?.email,
        plan: userData?.plan,
        pdfs_generated_count: userData?.pdfs_generated_count || 0,
        createdAt: userData?.createdAt?.toDate?.() || userData?.createdAt,
      },
      history,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
