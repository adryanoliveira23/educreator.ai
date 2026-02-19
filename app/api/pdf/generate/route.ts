import { NextResponse } from "next/server";
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import { decodeHtmlEntities } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { title, description, content, header, questions } = await req.json();

    const doc = new PDFDocument({ size: "A4" });
    const chunks: Buffer[] = [];

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

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
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(decodeHtmlEntities(title), { align: "center" });
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
      for (const q of questions) {
        // Question Number
        doc.font("Helvetica-Bold").fontSize(12).text(`Questão ${q.number}`);
        doc.moveDown(0.3);

        // Question Text
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(decodeHtmlEntities(q.questionText), { align: "justify" });
        doc.moveDown(0.5);

        // --- Question Image ---
        if (q.imageUrl) {
          console.log(
            `[PDF] Attempting to embed image for Q${q.number}: ${q.imageUrl}`,
          );
          try {
            const imageRes = await fetch(q.imageUrl);
            if (imageRes.ok) {
              const arrayBuffer = await imageRes.arrayBuffer();
              const imageBuffer = Buffer.from(arrayBuffer);

              const imgWidth = 400;
              const imgHeight = 300;
              const xPos = (pageWidth - imgWidth) / 2;

              // --- Page Break Logic ---
              // If the image won't fit on the current page, add a new one
              const bottomMargin = doc.page.margins.bottom;
              const availableHeight = doc.page.height - bottomMargin;

              if (doc.y + imgHeight > availableHeight) {
                doc.addPage();
                // When adding a page, doc.y is reset to the top margin.
                // We might want to re-draw the question number/text?
                // Or just the image starts the new page. Let's just start the new page.
              }

              const base64Image = imageBuffer.toString("base64");
              const contentType =
                imageRes.headers.get("content-type") || "image/png";
              const dataUri = `data:${contentType};base64,${base64Image}`;

              doc.image(dataUri, xPos, doc.y, {
                width: imgWidth,
              });

              doc.y += imgHeight;
              doc.moveDown(1.5);
              console.log(`[PDF] Image embedded for Q${q.number}`);
            } else {
              console.error(
                `[PDF] Failed to fetch image. Status: ${imageRes.status}`,
              );
            }
          } catch (err) {
            console.error(
              `[PDF] Error embedding image for question ${q.number}:`,
              err,
            );
            doc
              .fontSize(10)
              .font("Helvetica-Oblique")
              .text("[Imagem não disponível]");
            doc.moveDown(1);
          }
        }

        // Alternatives
        if (Array.isArray(q.alternatives)) {
          q.alternatives.forEach((alt: string) => {
            if (q.type === "multiple_choice") {
              doc.text(`(   ) ${decodeHtmlEntities(alt)}`);
            } else if (q.type === "check_box") {
              doc.text(`(   ) ${decodeHtmlEntities(alt)}`);
            } else if (q.type === "true_false") {
              doc.text(`(   ) ${decodeHtmlEntities(alt)}`);
            } else if (q.type === "counting" || q.type === "image_selection") {
              doc.text(`(   ) ${decodeHtmlEntities(alt)}`);
            } else {
              doc.text(`- ${decodeHtmlEntities(alt)}`);
            }
            doc.moveDown(0.3);
          });
        }

        // Writing Lines / Box
        if (q.answerLines && q.answerLines > 0) {
          for (let l = 0; l < q.answerLines; l++) {
            if (q.answerLines === 1) {
              // Draw a box or a single thick line for names
              doc.rect(doc.x + 40, doc.y, 200, 25).stroke();
              doc.y += 30;
              break;
            } else {
              doc
                .moveTo(doc.x + 40, doc.y + 20)
                .lineTo(doc.page.width - 50, doc.y + 20)
                .dash(2, {})
                .stroke();
              doc.y += 25;
            }
          }
        }

        // Counting specific box
        if (q.type === "counting") {
          doc.circle(doc.page.width - 100, doc.y - 20, 15).stroke();
        }

        doc.moveDown(1);
      }
    }

    // --- Legacy Content Support ---
    if (Array.isArray(content) && !questions) {
      content.forEach((item: { type: string; value: string }) => {
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

    const pdfBuffer = await pdfBufferPromise;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="atividade.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
