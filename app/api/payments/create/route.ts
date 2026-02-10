import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { adminAuth } from "@/lib/firebase-admin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAuth) {
      return NextResponse.json(
        { error: "Server Configuration Error: Firebase Admin not initialized" },
        { status: 500 },
      );
    }
    const token = authHeader.split("Bearer ")[1];
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const { plan } = await req.json();

    const planDetails: Record<string, { title: string; price: number }> = {
      normal: { title: "Plano Normal", price: 21.9 },
      pro: { title: "Plano Pro", price: 45.9 },
      premium: { title: "Plano Premium", price: 89.9 },
    };

    const selectedPlan = planDetails[plan as string];
    if (!selectedPlan)
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.price,
          },
        ],
        payer: {
          email: email,
        },
        external_reference: uid,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Payment creation failed" },
      { status: 500 },
    );
  }
}
