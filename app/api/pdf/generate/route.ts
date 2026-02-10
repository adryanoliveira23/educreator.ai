import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  try {
    const { title, description, content } = await req.json();

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Title
    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown();

    // Description
    if (description) {
      doc.fontSize(12).text(description, { align: "justify" });
      doc.moveDown();
    }

    // Content
    if (Array.isArray(content)) {
      content.forEach((item: any) => {
        if (item.type === "text") {
          doc.fontSize(12).text(item.value, { align: "justify" });
          doc.moveDown(0.5);
        } else if (item.type === "question") {
          doc.moveDown(0.5);
          doc.fontSize(12).font("Helvetica-Bold").text(item.value);
          doc.font("Helvetica"); // Reset font
          doc.moveDown();
          // Add space for answer
          doc.text(
            "__________________________________________________________",
          );
          doc.moveDown();
        }
      });
    }

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="atividade.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
