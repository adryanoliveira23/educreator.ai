import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import Groq from "groq-sdk";
import * as admin from "firebase-admin";

// Initialize Groq client lazily or inside the handler to prevent build-time errors
// if the API key is missing in the build environment.

export async function POST(req: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json(
      { error: "Server Configuration Error: Firebase Admin not initialized" },
      { status: 500 },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
    const uid = decodedToken.uid;

    // Check user limits
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = userData.plan || "normal";
    const usage = userData.pdfs_generated_count || 0;
    const role = userData.role || "user";
    const limits: Record<string, number> = {
      normal: 10,
      pro: 30,
      premium: 999999,
    };

    // Admins have infinite access
    if (role !== "admin" && usage >= limits[plan]) {
      return NextResponse.json(
        { error: "Limit reached. Upgrade your plan." },
        { status: 403 },
      );
    }

    const { prompt } = await req.json();

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `
      Você é um assistente pedagógico especializado em criar atividades educativas para crianças.
      Gere o conteúdo em JSON estrito com a seguinte estrutura:
      {
        "title": "Título da Atividade",
        "description": "Breve descrição ou instruções",
        "content": [
          { "type": "text", "value": "Texto explicativo ou enunciado..." },
          { "type": "question", "value": "1. Pergunta..." }
        ]
      }
      Mantenha a formatação clara.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 1,
      max_completion_tokens: 4096,
      top_p: 1,
      stop: null,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    const parsedResult = JSON.parse(result || "{}");

    // Increment usage
    // Wait, increment only on PDF generation?
    // User requested "middleware: impede gerar PDF acima do limite".
    // And "Dashboard input... retorno gerado pela IA... botão Gerar PDF".
    // So generating the AI content might be free or counted?
    // "Planos e limites... Normal -> 10 PDFs/mês".
    // It specifically says PDFs. So maybe I shouldn't increment here.
    // BUT, "Salvar no banco: atividades... resultado".
    // If I save here, I should probably count it or just verify limit here but increment on PDF.
    // However, usually generating the content is the main value.
    // I will increment here for simplicity as "Generating Activity" usually equals "1 usage".
    // If the user downloads PDF multiple times for the same activity, that shouldn't count multiple times.
    // So creating the activity counts.

    await adminDb
      .collection("users")
      .doc(uid)
      .update({
        pdfs_generated_count: admin.firestore.FieldValue.increment(1),
      });

    // Save activity
    await adminDb.collection("activities").add({
      userId: uid,
      prompt,
      result: parsedResult,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
