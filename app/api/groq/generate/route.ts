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

    const { prompt, activityTypes } = await req.json();
    const typesToUse = Array.isArray(activityTypes)
      ? activityTypes
      : [activityTypes || "multiple_choice"];

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `
      Você é um assistente pedagógico de ELITE, com doutorado em educação infantil, especializado em criar atividades educacionais IMPECÁVEIS.
      Seu objetivo é gerar conteúdo que seja sinônimo de excelência, clareza e precisão absoluta.
      
      Formatos escolhidos: ${typesToUse.join(", ")}.
      
      REGRAS DE OURO (ZERO ERRO):
      1. SINCRONIA MÁXIMA: O 'imagePrompt' DEVE ser uma descrição visual EXATA do que a questão pede. Se a pergunta é "Quantos gatos?", a imagem DEVE conter gatos, e a quantidade DEVE ser a mesma da resposta correta.
      2. COERÊNCIA LÓGICA: 
         - Em 'multiple_choice', as 4 alternativas devem ser plausíveis, mas apenas uma correta e CLARA.
         - Em 'counting', defina o número primeiro, coloque-o no 'imagePrompt' e garanta que ele esteja nas opções.
         - Em 'matching', os itens em 'matchingPairs' devem ter uma relação pedagógica óbvia e correta.
         - Em 'completion', a lacuna deve ser preenchível de forma inequívoca.
      3. PERSONA PEDAGÓGICA: Use linguagem acolhedora, clara e gramaticalmente correta em Português.
      4. QUALIDADE VISUAL: O 'imagePrompt' (em Inglês) deve focar em 'Pedagogical clipart, clean lines, white background'. Nada de fundos complexos ou sombras que confundam a criança.
      
      ESTRUTURA JSON RÍGIDA:
      {
        "title": "TÍTULO CRIATIVO E PEDAGÓGICO",
        "header": { "studentName": "", "school": "", "teacherName": "" },
        "questions": [
          {
            "number": 1,
            "type": "tipo_escolhido",
            "questionText": "Comando direto e instrutivo (ex: 'Conte os elementos abaixo e marque a opção correta')",
            "imagePrompt": "Detailed visual description in ENGLISH focused on clarity and quantity.",
            "alternatives": ["Opção A", "Opção B", "Opção C", "Opção D"],
            "answerLines": 0,
            "matchingPairs": []
          }
        ]
      }
      
      DIRETRIZES POR FORMATO:
      - counting: Foco total na quantidade. A imagem é o suporte da contagem.
      - writing: Use 'answerLines: 1-2' para nomes, ou 3 para frases.
      - matching: Gere pares lógicos (ex: Letra 'A' com 'Abacaxi').
      - completion: Ex: 'C _ S _' para 'CASA'.
      - pintar: Comando deve ser "Pinte o/a...". Estilo LINE ART estrito.
      
      DICA DE ESTILO (imagePrompt):
      - Pintar: 'STRICTLY Black and white line art, coloring book page style, thick outlines, white background, NO SHADING'.
      - Geral: 'High-quality educational clipart, vibrant but simple, white background, high contrast'.
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
          type?: string;
          number?: number;
          alternatives?: string[];
          [key: string]: unknown;
        }) => {
          if (q.imagePrompt) {
            // Force coloring style if the type is 'pintar'
            let finalPrompt = q.imagePrompt;
            if (
              q.type === "pintar" ||
              q.questionText?.toLowerCase().includes("pinte")
            ) {
              finalPrompt = `Coloring book page, black and white line art, clean thick black outlines, white background, NO COLOR, NO SHADING. ${q.imagePrompt}`;
            }

            const imageUrl = await generateImage(finalPrompt);
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
