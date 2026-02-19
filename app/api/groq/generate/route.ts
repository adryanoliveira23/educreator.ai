import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import Groq from "groq-sdk";
import * as admin from "firebase-admin";
import { generateImage } from "@/lib/leonardo";

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
    } catch {
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
        "title": "TÍTULO DA ATIVIDADE EM MAIÚSCULAS",
        "header": {
          "studentName": "Nome do aluno:",
          "school": "Escola:",
          "teacherName": "Nome do professor(a):"
        },
        "questions": [
          {
            "number": 1,
            "imagePrompt": "Detailed description in ENGLISH for image generation. Focus on the core concept of the question. Style: 'High-quality pedagogical clipart, clean lines, bright colors, white background, school textbook illustration'. Ex: 'A cheerful cartoon bear counting three red apples on a wooden table, educational style'.",
            "questionText": "Texto da pergunta",
            "type": "multiple_choice",
            "alternatives": [
              "Alternativa A",
              "Alternativa B",
              "Alternativa C",
              "Alternativa D"
            ]
          }
        ]
      }
      
      INSTRUÇÕES IMPORTANTES:
      - Gere sempre entre 5 a 10 questões
      - Cada questão DEVE ter um 'imagePrompt' extremamente descritivo EM INGLÊS.
      - O 'imagePrompt' deve ilustrar o conceito exato da pergunta para ajudar no entendimento.
      - Use o estilo: 'Pedagogical illustration, clipart style, bright colors, white background, clean and simple for children'.
      - Varie os tipos de questões: use "multiple_choice", "check_box", "true_false"
      - As imagens devem ser apropriadas para a idade e tema
      - Mantenha linguagem clara e adequada ao ano escolar solicitado
      - IMPORTANTE: NÃO use entidades HTML (como &quot;, &apos;, etc). Use caracteres normais.
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

    // Automatic Image Generation for each question
    if (parsedResult.questions && Array.isArray(parsedResult.questions)) {
      const imagePromises = parsedResult.questions.map(
        async (q: {
          imagePrompt?: string;
          questionText?: string;
          number?: number;
          alternatives?: string[];
          [key: string]: unknown;
        }) => {
          if (q.imagePrompt) {
            const imageUrl = await generateImage(q.imagePrompt);
            return { ...q, imageUrl };
          }
          return q;
        },
      );

      parsedResult.questions = await Promise.all(imagePromises);
    }

    // Increment usage
    try {
      await adminDb
        .collection("users")
        .doc(uid)
        .update({
          pdfs_generated_count: admin.firestore.FieldValue.increment(1),
        });
      console.log(`Updated usage count for user ${uid}`);
    } catch (dbError) {
      console.error("Error updating user count:", dbError);
    }

    // Save activity
    try {
      const activityRef = await adminDb.collection("activities").add({
        userId: uid,
        prompt,
        result: parsedResult,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(
        `Saved new activity with ID: ${activityRef.id} for user ${uid}`,
      );
    } catch (dbError) {
      console.error("Error saving activity to Firestore:", dbError);
    }

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
