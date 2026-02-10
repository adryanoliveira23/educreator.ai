import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Server Configuration Error: Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    // Verify webhook secret
    const webhookSecret = req.headers.get("x-webhook-secret");
    if (webhookSecret !== process.env.CACKTO_WEBHOOK_SECRET) {
      console.error("Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Cackto webhook received:", body);

    // Cackto webhook payload structure (adjust based on actual Cackto documentation)
    const { event, data } = body;

    // Handle payment confirmation
    if (event === "payment.approved" || event === "sale.approved") {
      const { customer_email, metadata } = data;

      // Extract plan from metadata or product_id
      const plan = metadata?.plan || "normal";
      const userId = metadata?.userId;

      if (!userId) {
        console.error("No userId in webhook metadata");
        return NextResponse.json(
          { error: "Missing userId in metadata" },
          { status: 400 },
        );
      }

      // Calculate renewal date (1 month from now)
      const renewalDate = admin.firestore.Timestamp.fromDate(
        new Date(new Date().setMonth(new Date().getMonth() + 1)),
      );

      // Update user plan in Firestore
      await adminDb.collection("users").doc(userId).update({
        plan: plan,
        subscription_status: "active",
        renovacao_em: renewalDate,
        last_payment_date: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(customer_email, plan);
        console.log(`Welcome email sent to ${customer_email}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail the webhook if email fails
      }

      return NextResponse.json({ status: "ok", message: "Payment processed" });
    }

    // Handle other events if needed
    return NextResponse.json({ status: "ok", message: "Event received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
