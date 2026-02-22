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

    let userDoc = await adminDb.collection("users").doc(id).get();

    // Fallback: search by email if doc doesn't exists by ID
    if (!userDoc.exists) {
      const emailQuery = await adminDb
        .collection("users")
        .where("email", "==", id)
        .limit(1)
        .get();

      if (!emailQuery.empty) {
        userDoc = emailQuery.docs[0];
      }
    }

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    const activitiesSnapshot = await adminDb
      .collection("activities")
      .where("userId", "==", userDoc.id)
      .orderBy("createdAt", "desc")
      .get();

    const history = activitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      let createdAt = data.createdAt;
      if (createdAt?.toDate) {
        createdAt = createdAt.toDate().toISOString();
      } else if (
        createdAt &&
        typeof createdAt === "object" &&
        createdAt._seconds
      ) {
        createdAt = new Date(createdAt._seconds * 1000).toISOString();
      }

      return {
        id: doc.id,
        title: data.result?.title || data.title || "Atividade Gerada",
        prompt: data.prompt,
        createdAt: createdAt,
        type: data.result?.questions?.[0]?.type || "unknown",
      };
    });

    let userCreatedAt = userData?.createdAt;
    if (userCreatedAt?.toDate) {
      userCreatedAt = userCreatedAt.toDate().toISOString();
    } else if (
      userCreatedAt &&
      typeof userCreatedAt === "object" &&
      userCreatedAt._seconds
    ) {
      userCreatedAt = new Date(userCreatedAt._seconds * 1000).toISOString();
    }

    return NextResponse.json({
      user: {
        id: userDoc.id,
        email: userData?.email,
        plan: userData?.plan,
        role: userData?.role || "user",
        whatsapp: userData?.whatsapp || "",
        pdfs_generated_count: userData?.pdfs_generated_count || 0,
        createdAt: userCreatedAt,
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
