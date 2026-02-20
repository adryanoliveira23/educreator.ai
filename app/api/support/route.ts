import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 },
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `
      Você é o assistente virtual do EduCreator AI, uma plataforma que usa Inteligência Artificial para ajudar professores a criarem atividades pedagógicas em segundos.
      
      Seu objetivo é tirar dúvidas de visitantes da landing page sobre como a plataforma funciona.
      
      Informações Importantes:
      - O que é: Uma ferramenta de IA que gera exercícios, textos, provas e atividades de colorir.
      - Como funciona: O professor digita o tema e a série, a IA gera o conteúdo e o professor baixa o PDF pronto para imprimir.
      - Planos: 
        - Trial (7 dias grátis): R$ 0,00 inicial, depois R$ 21,90/mês.
        - Normal: R$ 21,90/mês (Histórico 30 dias).
        - Pro: R$ 45,90/mês (Geração rápida, suporte prioritário).

      - WhatsApp de suporte humano: +55 66 9976-2785.
      
      Instruções de Resposta:
      - Seja gentil, prestativo e profissional.
      - Responda de forma concisa e direta.
      - Se não souber algo, direcione o usuário para o suporte via WhatsApp.
      - Use português do Brasil.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "Desculpe, não consegui processar sua dúvida agora. Por favor, tente novamente ou entre em contato via WhatsApp.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Support API Error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
