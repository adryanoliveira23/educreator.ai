import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
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
      const { customer_email, customer_name, metadata } = data;

      // Extract plan from metadata or product_id
      const plan = metadata?.plan || "normal";
      let userId = metadata?.userId;

      // Automatic Account Creation Logic
      if (!userId) {
        console.log(`Searching/Creating user for email: ${customer_email}`);
        try {
          const userRecord = await adminAuth!.getUserByEmail(customer_email);
          userId = userRecord.uid;
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'code' in error && error.code === "auth/user-not-found") {
            // Create user
            const tempPassword = Math.random().toString(36).slice(-8) + "!";
            const userRecord = await adminAuth!.createUser({
              email: customer_email,
              password: tempPassword,
              displayName: customer_name || "",
            });
            userId = userRecord.uid;
            console.log(`New user created: ${userId}`);
            
            // Note: We should ideally send the tempPassword in the email
            // or a password reset link.
          } else {
            throw error;
          }
        }
      }

      if (!userId) {
        console.error("Failed to identify or create userId");
        return NextResponse.json(
          { error: "Missing userId" },
          { status: 400 },
        );
      }

      // Calculate renewal date (1 month from now)
      const renewalDate = admin.firestore.Timestamp.fromDate(
        new Date(new Date().setMonth(new Date().getMonth() + 1)),
      );

      // Update/Create user plan in Firestore
      await adminDb.collection("users").doc(userId).set({
        plan: plan,
        subscription_status: "active",
        renovacao_em: renewalDate,
        last_payment_date: admin.firestore.FieldValue.serverTimestamp(),
        email: customer_email,
        name: customer_name || "",
      }, { merge: true });

      // Send welcome email
      try {
        await sendWelcomeEmail(customer_email, plan, false, true);
        console.log(`Welcome email sent to ${customer_email}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
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
