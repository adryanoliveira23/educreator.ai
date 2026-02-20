import nodemailer from "nodemailer";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendWelcomeEmail(
  to: string,
  plan: string,
  isTrial: boolean = false,
): Promise<void> {
  const planNames: Record<string, string> = {
    normal: "Normal (R$ 21,90/mês)",
    pro: "Pro (R$ 45,90/mês)",

    trial: "Teste Grátis (7 Dias)",
  };

  const planName = planNames[plan] || plan;

  const trialWarning = isTrial
    ? `
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; color: #92400e;">
      <p style="margin: 0; font-weight: bold;">⚠️ Informação Importante sobre o Teste Grátis</p>
      <p style="margin: 5px 0 0;">
        Você <strong>não foi cobrado hoje</strong>. Este é um período de teste de 7 dias.
        Se você gostar (e temos certeza que vai!), sua assinatura iniciará automaticamente após esse período.
        Você pode cancelar a qualquer momento antes do fim dos 7 dias para evitar cobranças.
      </p>
    </div>
    `
    : "";

  const mailOptions = {
    from: `"EduCreator AI" <${process.env.GMAIL_USER}>`,
    to,
    subject: isTrial
      ? "🚀 Seu Teste Grátis Começou! - EduCreator AI"
      : "🎉 Bem-vindo ao EduCreator AI!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isTrial ? "🚀 Teste Grátis Ativado!" : "🎉 Bem-vindo ao EduCreator AI!"}</h1>
            </div>
            <div class="content">
              <p>Olá!</p>
              
              <p>Estamos muito felizes em tê-lo(a) conosco! ${isTrial ? "Seu período de teste foi iniciado." : "Seu pagamento foi confirmado com sucesso."}</p>
              
              <p><strong>Plano atual:</strong> ${planName}</p>
              
              ${trialWarning}
              
              <p>Agora você pode começar a criar conteúdo educacional de alta qualidade com a ajuda da nossa IA:</p>
              
              <ul>
                <li>✅ Atividades personalizadas</li>
                <li>✅ Geração de PDFs profissionais</li>
                <li>✅ Criação de imagens educacionais</li>
                <li>✅ Suporte dedicado</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">
                  Acessar Dashboard
                </a>
              </div>
              
              <p>Se tiver alguma dúvida, estamos aqui para ajudar!</p>
              
              <p>Bons estudos! 📚</p>
              
              <p style="margin-top: 30px;">
                <strong>Equipe EduCreator AI</strong>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduCreator AI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
