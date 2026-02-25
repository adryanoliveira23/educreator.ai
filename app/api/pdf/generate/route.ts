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
      wallpaperUrl,
      isTrial = false,
    } = await req.json();

    const doc = new PDFDocument({ size: "A4" });
    const chunks: Buffer[] = [];

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const pageMargins = doc.page.margins;

    // Background helper
    const drawBackground = async () => {
      if (!wallpaperUrl) return;

      try {
        let imageBuffer: Buffer;
        if (wallpaperUrl.startsWith("data:")) {
          const base64Data = wallpaperUrl.split(",")[1];
          imageBuffer = Buffer.from(base64Data, "base64");
        } else {
          // Resolve relative URLs for local wallpapers
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          const fullUrl = wallpaperUrl.startsWith("http")
            ? wallpaperUrl
            : `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}${wallpaperUrl}`;

          console.log("Fetching background:", fullUrl);
          const res = await fetch(fullUrl);
          if (!res.ok) {
            console.error(
              `Failed to fetch background: ${res.status} ${res.statusText}`,
            );
            return;
          }
          imageBuffer = Buffer.from(await res.arrayBuffer());
        }

        // Draw background with low opacity for print-friendliness
        doc.save();
        doc.opacity(0.12); // Subtle enough for printing
        doc.image(imageBuffer, 0, 0, {
          width: pageWidth,
          height: pageHeight,
          align: "center",
          valign: "center",
        });
        doc.restore();
      } catch (err) {
        console.error("Error drawing background:", err);
      }
    };

    // Initial background
    await drawBackground();

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

      if (title && showFields) {
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
      const questionsToProcess = questions; // Process all questions
      let questionCountOnPage = 0;

      for (let i = 0; i < questionsToProcess.length; i++) {
        const q = questionsToProcess[i];
        const isCensored = isTrial && i > 0;

        if (layout === "one_per_page" && i > 0) {
          doc.addPage();
          await drawBackground();
          drawHeader(false);
        } else if (layout === "two_per_page") {
          if (questionCountOnPage >= 2) {
            doc.addPage();
            await drawBackground();
            drawHeader(false);
            questionCountOnPage = 0;
          }
        }

        doc.font("Helvetica-Bold").fontSize(12).text(`Questão ${q.number}`);
        doc.moveDown(0.3);

        if (isCensored) {
          const rectHeight = 100;
          const rectWidth = pageWidth - pageMargins.left - pageMargins.right;

          doc.save();
          doc
            .rect(doc.x, doc.y, rectWidth, rectHeight)
            .fillAndStroke("#f1f5f9", "#e2e8f0");

          doc
            .fillColor("#64748b")
            .fontSize(10)
            .text(
              "CONTEÚDO BLOQUEADO NO PLANO DE TESTE",
              doc.x,
              doc.y + rectHeight / 2 - 5,
              {
                align: "center",
                width: rectWidth,
              },
            );
          doc.restore();

          doc.y += rectHeight;
          doc.moveDown(1.5);
        } else {
          doc
            .font("Helvetica")
            .fontSize(12)
            .text(decodeHtmlEntities(q.questionText), { align: "justify" });
          doc.moveDown(0.5);

          if (includeImages && q.imageUrl) {
            try {
              const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
              const fullImageUrl =
                q.imageUrl.startsWith("http") || q.imageUrl.startsWith("data:")
                  ? q.imageUrl
                  : `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}${q.imageUrl}`;

              console.log(
                `Fetching image for question ${q.number}:`,
                fullImageUrl,
              );
              const imageRes = await fetch(fullImageUrl);
              if (imageRes.ok) {
                const arrayBuffer = await imageRes.arrayBuffer();
                const imageBuffer = Buffer.from(arrayBuffer);

                const isPintar =
                  q.type === "pintar" ||
                  q.questionText?.toLowerCase().includes("pinte");

                const imgWidth = isPintar
                  ? pageWidth - pageMargins.left - pageMargins.right
                  : layout === "two_per_page"
                    ? 300
                    : 400;

                // Height will be calculated after placement
                const xPos = (pageWidth - imgWidth) / 2;

                // Simple height estimation for overflow check (safe side)
                const estimatedHeight = imgWidth;

                if (
                  doc.y + estimatedHeight >
                  doc.page.height - doc.page.margins.bottom
                ) {
                  doc.addPage();
                  await drawBackground();
                  drawHeader(false);
                }

                const img = doc.image(imageBuffer, xPos, doc.y, {
                  width: imgWidth,
                });
                // PDFKit returns the image object, we can use its scaled height
                // @ts-expect-error - PDFKit types might not expose the scaled height directly in all versions
                const actualHeight = img.height || estimatedHeight;
                doc.y += actualHeight;
                doc.moveDown(0.5);
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

          if (q.type === "matching" && Array.isArray(q.matchingPairs)) {
            const startY = doc.y;
            const colWidth =
              (pageWidth - pageMargins.left - pageMargins.right) / 2;

            q.matchingPairs.forEach(
              (pair: { left: string; right: string }, idx: number) => {
                doc.fontSize(10).font("Helvetica");

                // Left item
                doc.text(pair.left, pageMargins.left, doc.y, {
                  width: colWidth - 40,
                });
                const leftTextEnd = doc.y;
                doc
                  .circle(pageMargins.left + colWidth - 20, leftTextEnd - 5, 4)
                  .stroke();

                // Right item
                doc.text(
                  pair.right,
                  pageMargins.left + colWidth + 20,
                  startY + idx * 30,
                  { width: colWidth - 40 },
                );
                doc
                  .circle(
                    pageMargins.left + colWidth + 5,
                    startY + idx * 30 + 5,
                    4,
                  )
                  .stroke();

                doc.y = Math.max(leftTextEnd, startY + idx * 30 + 20) + 10;
              },
            );
            doc.moveDown(1);
          }

          if (q.type === "counting") {
            doc.circle(doc.page.width - 100, doc.y - 20, 15).stroke();
          }

          doc.moveDown(1);
        }
        questionCountOnPage++;
      }

      if (isTrial && questions.length > 1) {
        doc.moveDown(2);
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("blue")
          .text("Atividade de Demonstração (Teste Grátis)", {
            align: "center",
          });
        doc.moveDown(0.5);
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("black")
          .text(
            "Esta é uma versão de demonstração. Para baixar a atividade completa com todas as questões e imagens, adquira um plano em educreator-ai.vercel.app/dashboard",
            { align: "center" },
          );
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
