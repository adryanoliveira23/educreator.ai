import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan") || "trial";
    const email = searchParams.get("email") || "test_user@example.com";
    const uid = searchParams.get("uid") || "test_uid_123";

    console.log(
      `Generating test payment link for Plan: ${plan}, Email: ${email}, UID: ${uid}`,
    );

    // --- MOCK PAYMENT CREATION LOGIC start ---
    // (This Logic mimics app/api/payments/create/route.ts but without Auth)

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

    // Mercado Pago API rejects "localhost" for back_urls.
    // For local testing, we must use a public URL.
    // If we are on localhost, use a dummy public URL or the deployed URL if available.
    const isLocalhost = baseUrl.includes("localhost");
    const validBackUrlBase = isLocalhost ? "https://educreator.ai" : baseUrl; // Fallback to production domain or google for test

    const urlObj = new URL("/dashboard", validBackUrlBase);
    urlObj.searchParams.set("payment", "success");
    const backUrl = urlObj.toString();

    console.log("Creating preference with back_url:", backUrl);

    // Using "trial" logic as default test case
    const response = await preapproval.create({
      body: {
        reason: "EduCreator AI - Plano Mensal (TESTE)",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 21.9,
          currency_id: "BRL",
          free_trial: {
            frequency: 7,
            frequency_type: "days",
          },
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        back_url: backUrl,
        payer_email: email,
        status: "pending",
        external_reference: uid,
      },
    });

    if (response.init_point) {
      return NextResponse.json({
        success: true,
        init_point: response.init_point,
        sandbox_init_point: (response as { sandbox_init_point?: string })
          .sandbox_init_point, // Useful if available
        id: response.id,
        plan,
        email,
        uid,
      });
    } else {
      throw new Error("No init_point in Mercado Pago response");
    }

    // --- MOCK PAYMENT CREATION LOGIC end ---
  } catch (error) {
    console.error("Test Route Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error, null, 2);
    return NextResponse.json(
      { error: `Erro Mercado Pago Teste: ${errorMessage}`, details: error },
      { status: 500 },
    );
  }
}
