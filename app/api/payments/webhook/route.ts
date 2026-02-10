import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (topic === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === "approved") {
        const uid = paymentData.external_reference;
        const items = paymentData.additional_info?.items;
        const planId = items && items.length > 0 ? items[0].id : "normal";

        if (uid) {
          // Calculate renewal date (1 month from now)
          const renewalDate = admin.firestore.Timestamp.fromDate(
            new Date(new Date().setMonth(new Date().getMonth() + 1)),
          );

          await adminDb.collection("users").doc(uid).update({
            plan: planId,
            subscription_status: "active",
            renovacao_em: renewalDate,
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
