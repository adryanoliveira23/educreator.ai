import { NextResponse } from "next/server";
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import { decodeHtmlEntities } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      content,
      header,
      questions,
      layout = "standard",
      includeImages = true,
    } = await req.json();

    const doc = new PDFDocument({ size: "A4" });
    const chunks: Buffer[] = [];

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const pageWidth = doc.page.width;
    const pageMargins = doc.page.margins;

    const drawHeader = (showFields: boolean = true) => {
      if (header && showFields) {
        doc.fontSize(12).font("Helvetica");

        const drawField = (label: string, value: string = "") => {
          // Clean value: remove leading colons, double colons, or the label itself
          let cleanValue = value ? value.trim() : "";

          // Remove leading colons or double colons
          cleanValue = cleanValue.replace(/^[:\s]+/, "");

          // If the value still contains the label, remove it
          if (cleanValue.toLowerCase().startsWith(label.toLowerCase())) {
            cleanValue = cleanValue.slice(label.length).trim();
            // Remove colons again after label removal
            cleanValue = cleanValue.replace(/^[:\s]+/, "");
          }

          doc.text(`${label.replace(/:$/, "")}: ${cleanValue}`.padEnd(80, "_"));
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

      if (title) {
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .text(decodeHtmlEntities(title), { align: "center" });
        doc.moveDown(1.5);
      }
    };

    drawHeader(true);

    if (description) {
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(description, { align: "justify" });
      doc.moveDown();
    }

    if (Array.isArray(questions)) {
      let questionCountOnPage = 0;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        if (layout === "one_per_page" && i > 0) {
          doc.addPage();
          drawHeader(false);
        } else if (layout === "two_per_page") {
          if (questionCountOnPage >= 2) {
            doc.addPage();
            drawHeader(false);
            questionCountOnPage = 0;
          }
        }

        doc.font("Helvetica-Bold").fontSize(12).text(`Questão ${q.number}`);
        doc.moveDown(0.3);

        doc
          .font("Helvetica")
          .fontSize(12)
          .text(decodeHtmlEntities(q.questionText), { align: "justify" });
        doc.moveDown(0.5);

        if (includeImages && q.imageUrl) {
          try {
            const imageRes = await fetch(q.imageUrl);
            if (imageRes.ok) {
              const arrayBuffer = await imageRes.arrayBuffer();
              const imageBuffer = Buffer.from(arrayBuffer);

              const imgWidth = layout === "two_per_page" ? 300 : 400;
              const imgHeight = layout === "two_per_page" ? 200 : 300;
              const xPos = (pageWidth - imgWidth) / 2;

              if (
                doc.y + imgHeight >
                doc.page.height - doc.page.margins.bottom
              ) {
                doc.addPage();
                drawHeader(false);
              }

              const base64Image = imageBuffer.toString("base64");
              const contentType =
                imageRes.headers.get("content-type") || "image/png";
              const dataUri = `data:${contentType};base64,${base64Image}`;

              doc.image(dataUri, xPos, doc.y, { width: imgWidth });
              doc.y += imgHeight;
              doc.moveDown(1.5);
            }
          } catch (err) {
            console.error(err);
          }
        }

        if (Array.isArray(q.alternatives)) {
          q.alternatives.forEach((alt: string) => {
            if (
              [
                "multiple_choice",
                "check_box",
                "true_false",
                "counting",
                "image_selection",
              ].includes(q.type)
            ) {
              doc.text(`(   ) ${decodeHtmlEntities(alt)}`);
            } else {
              doc.text(`- ${decodeHtmlEntities(alt)}`);
            }
            doc.moveDown(0.3);
          });
        }

        if (q.answerLines && q.answerLines > 0) {
          for (let l = 0; l < q.answerLines; l++) {
            if (q.answerLines === 1) {
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

        if (q.type === "counting") {
          doc.circle(doc.page.width - 100, doc.y - 20, 15).stroke();
        }

        doc.moveDown(1);
        questionCountOnPage++;
      }
    }

    if (Array.isArray(content) && !questions) {
      content.forEach((item: { type: string; value: string }) => {
        if (item.type === "text") {
          doc.fontSize(12).text(item.value, { align: "justify" });
          doc.moveDown(0.5);
        } else if (item.type === "question") {
          doc.moveDown(0.5);
          doc.fontSize(12).font("Helvetica-Bold").text(item.value);
          doc
            .font("Helvetica")
            .moveDown()
            .text("__________________________________________________________")
            .moveDown();
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
