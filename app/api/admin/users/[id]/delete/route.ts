import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    // 1. Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(id);
    } catch (authError: unknown) {
      console.warn(
        "User maybe not found in Auth:",
        authError instanceof Error ? authError.message : String(authError),
      );
      // Continue to delete from Firestore even if Auth fails (self-healing)
    }

    // 2. Delete from Firestore
    await adminDb.collection("users").doc(id).delete();

    // 3. (Optional) Delete user activities
    const activitiesSnapshot = await adminDb
      .collection("activities")
      .where("userId", "==", id)
      .get();

    const batch = adminDb.batch();
    activitiesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
