import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

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

    // Cackto payment links mapping
    const cacktoLinks: Record<string, string> = {
      normal:
        process.env.CACKTO_NORMAL_URL ||
        "https://pay.cakto.com.br/9m78gio_761861",
      pro:
        process.env.CACKTO_PRO_URL || "https://pay.cakto.com.br/3ey44xv_761899",
      premium:
        process.env.CACKTO_PREMIUM_URL ||
        "https://pay.cakto.com.br/ecbriic_761903",
    };

    const basePaymentLink = cacktoLinks[plan as string];
    if (!basePaymentLink) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Append user metadata to payment link as query parameters
    // Cackto will pass these back in the webhook
    const paymentLink = `${basePaymentLink}?userId=${uid}&email=${encodeURIComponent(email || "")}&plan=${plan}`;

    // Return the Cackto payment link with metadata
    return NextResponse.json({ init_point: paymentLink });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Payment creation failed" },
      { status: 500 },
    );
  }
}
