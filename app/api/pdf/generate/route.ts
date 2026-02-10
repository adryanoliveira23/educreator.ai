import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  try {
    const { title, description, content, header, questions } = await req.json();

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Calculate width for centering
    const pageWidth = doc.page.width;
    const pageMargins = doc.page.margins;

    // --- Header Generation ---
    if (header) {
      doc.fontSize(12).font("Helvetica");

      const drawField = (label: string, value: string = "") => {
        doc.text(`${label} ${value}_`.padEnd(80, "_"));
        doc.moveDown(0.5);
      };

      drawField("Nome do aluno:", header.studentName);
      drawField("Escola:", header.school);
      drawField("Nome do professor(a):", header.teacherName);

      doc.moveDown(1);
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(pageWidth - pageMargins.right, doc.y)
        .stroke();
      doc.moveDown(1.5);
    }

    // --- Title ---
    doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(1.5);

    // --- Description (Legacy or Optional) ---
    if (description) {
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(description, { align: "justify" });
      doc.moveDown();
    }

    // --- New Questions Structure ---
    if (Array.isArray(questions)) {
      questions.forEach((q: any) => {
        // Question Number
        doc.font("Helvetica-Bold").fontSize(12).text(`Questão ${q.number}`);
        doc.moveDown(0.3);

        // Image Placeholder
        if (q.imagePrompt) {
          doc.rect(doc.x, doc.y, 200, 150).stroke();
          doc
            .font("Helvetica-Oblique")
            .fontSize(10)
            .text(`[Imagem: ${q.imagePrompt}]`, doc.x + 10, doc.y + 10, {
              width: 180,
            });
          doc.moveDown(8); // Move down past the box
          doc.x = pageMargins.left; // Reset X
        }

        // Question Text
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(q.questionText, { align: "justify" });
        doc.moveDown(0.5);

        // Alternatives
        if (Array.isArray(q.alternatives)) {
          q.alternatives.forEach((alt: string) => {
            if (q.type === "multiple_choice") {
              doc.text(`(   ) ${alt}`);
            } else if (q.type === "check_box") {
              doc.text(`[   ] ${alt}`);
            } else if (q.type === "true_false") {
              doc.text(`(   ) ${alt}`);
            } else {
              doc.text(`- ${alt}`);
            }
            doc.moveDown(0.3);
          });
        }

        doc.moveDown(1);
      });
    }

    // --- Legacy Content Support ---
    if (Array.isArray(content) && !questions) {
      content.forEach((item: any) => {
        if (item.type === "text") {
          doc.fontSize(12).text(item.value, { align: "justify" });
          doc.moveDown(0.5);
        } else if (item.type === "question") {
          doc.moveDown(0.5);
          doc.fontSize(12).font("Helvetica-Bold").text(item.value);
          doc.font("Helvetica"); // Reset font
          doc.moveDown();
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

    return new NextResponse(pdfBuffer as any, {
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
