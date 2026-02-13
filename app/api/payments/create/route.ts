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

    if (plan === "trial") {
      try {
        const { PreApproval } = await import("mercadopago");
        const { mpClient } = await import("@/lib/mercadopago");

        const preapproval = new PreApproval(mpClient);

        const rawBaseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        // Ensure valid protocol and no double slashes
        let baseUrl = rawBaseUrl;
        if (!baseUrl.startsWith("http")) {
          baseUrl = `https://${baseUrl}`;
        }
        const urlObj = new URL("/dashboard", baseUrl);
        urlObj.searchParams.set("payment", "success");
        const backUrl = urlObj.toString();

        console.log("Creating preference with back_url:", backUrl);

        const response = await preapproval.create({
          body: {
            reason: "EduCreator AI - Plano Mensal (Teste Grátis 7 dias)",
            auto_recurring: {
              frequency: 1,
              frequency_type: "months",
              transaction_amount: 21.9, // Default to Normal plan price
              currency_id: "BRL",
              free_trial: {
                frequency: 7,
                frequency_type: "days",
              },
            } as any,
            back_url: backUrl,
            payer_email: email || "test_user_123@testuser.com",
            status: "pending",
            external_reference: uid, // Store user ID here
          },
        });

        if (response.init_point) {
          return NextResponse.json({ init_point: response.init_point });
        } else {
          throw new Error("No init_point in Mercado Pago response");
        }
      } catch (mpError) {
        console.error("Mercado Pago Error:", mpError);
        const errorMessage =
          mpError instanceof Error
            ? mpError.message
            : JSON.stringify(mpError, null, 2);
        return NextResponse.json(
          { error: `Erro Mercado Pago: ${errorMessage}`, details: mpError },
          { status: 500 },
        );
      }
    }

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
