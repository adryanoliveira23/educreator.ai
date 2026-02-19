import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: NextRequest) {
  try {
    const { employeeName, role, commission, salonName } = await req.json();

    // Create a new PDF document
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Header
    doc
      .fontSize(20)
      .text("CONTRATO DE PARCERIA - SALÃO PARCEIRO", { align: "center" });
    doc.moveDown();

    // Body
    doc.fontSize(12).text(
      `
      Pelo presente instrumento particular, de um lado ${salonName || "SALÃOPRO"}, doravante denominado SALÃO-PARCEIRO, e de outro lado ${employeeName}, doravante denominado(a) PROFISSIONAL-PARCEIRO, celebram o presente CONTRATO DE PARCERIA, nos termos da Lei nº 13.352/2016.

      CLÁUSULA PRIMEIRA - DO OBJETO
      O presente contrato tem por objeto a prestação de serviços de ${role} pelo(a) PROFISSIONAL-PARCEIRO nas dependências do SALÃO-PARCEIRO.

      CLÁUSULA SEGUNDA - DA COMISSÃO
      O SALÃO-PARCEIRO reterá a título de aluguel de bens móveis e infraestrutura o percentual acordado sobre o faturamento bruto dos serviços prestados.
      
      A cota-parte do(a) PROFISSIONAL-PARCEIRO será de ${commission} sobre o valor dos serviços.

      CLÁUSULA TERCEIRA - DA VIGÊNCIA
      Este contrato entra em vigor na data de sua assinatura e terá prazo indeterminado.

      __________________________________
      ${salonName || "SALÃOPRO"}

      __________________________________
      ${employeeName}
    `,
      { align: "justify", lineGap: 5 },
    );

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=contrato_${employeeName.replace(/\s+/g, "_")}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating contract:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
