import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Server Configuration Error: Firebase Admin not initialized" },
        { status: 500 },
      );
    }

    // Optional: Validate secret if you set one in MP notification URL params
    // const url = new URL(req.url);
    // const secret = url.searchParams.get("secret");
    // if (process.env.MP_WEBHOOK_SECRET && secret !== process.env.MP_WEBHOOK_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    console.log("Mercado Pago Webhook:", JSON.stringify(body, null, 2));

    const { type, data } = body;

    // Handle Subscription (PreApproval) events
    if (type === "subscription_preapproval") {
      const preApprovalId = data.id;

      // Fetch subscription details to get the external_reference (userId)
      // We'd ideally verify this against MP API, but for now let's assume valid if we trust the source/secret
      // But to get userId we MUST fetch from MP using the ID, as it's not in the basic webhook payload usually

      try {
        const { PreApproval } = await import("mercadopago");
        const { mpClient } = await import("@/lib/mercadopago");
        const preapproval = new PreApproval(mpClient);
        const subscriptionParams = await preapproval.get({ id: preApprovalId });

        const userId = subscriptionParams.external_reference;
        const status = subscriptionParams.status;

        if (userId) {
          let subStatus = "pending";
          if (status === "authorized") subStatus = "active";
          if (status === "paused") subStatus = "paused";
          if (status === "cancelled") subStatus = "cancelled";

          // Renew date
          const nextPaymentDate = subscriptionParams.next_payment_date
            ? admin.firestore.Timestamp.fromDate(
                new Date(subscriptionParams.next_payment_date),
              )
            : null;

          // Check if it's a trial (amount 0 or specifically flagged)
          const isTrial =
            subscriptionParams.auto_recurring?.transaction_amount === 0 ||
            (subscriptionParams.auto_recurring as any)?.free_trial;

          await adminDb
            .collection("users")
            .doc(userId)
            .update({
              plan: isTrial ? "trial" : "pro",
              subscription_status: subStatus,
              mercadopago_subscription_id: preApprovalId,
              last_updated: admin.firestore.FieldValue.serverTimestamp(),
              ...(nextPaymentDate && { renovacao_em: nextPaymentDate }),
            });

          console.log(
            `Updated user ${userId} subscription status to ${subStatus}`,
          );
        }
      } catch (err) {
        console.error("Error fetching MP subscription details:", err);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("MP Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
