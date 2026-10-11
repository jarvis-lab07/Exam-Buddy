/**
 * Client-Side PDF Text Extractor Utility
 * Uses PDF.js in the browser to extract clean rendered text from PDF documents.
 */

export interface PdfExtractionResult {
  text: string;
  success: boolean;
  pageCount?: number;
  isScanned?: boolean;
}

export async function extractTextFromPdfFile(file: File): Promise<PdfExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // In browser, load PDF.js dynamically
    if (typeof window !== "undefined") {
      try {
        let pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) {
          await loadPdfJsScript();
          pdfjs = (window as any).pdfjsLib;
        }

        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = "";

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            let pageText = "";
            let lastY: number | null = null;

            for (const item of (textContent.items as any[])) {
              const str = item.str || "";
              if (!str.trim() && !item.hasEOL) continue;

              const currentY = item.transform ? item.transform[5] : null;
              // If Y-position changes significantly, this is a new line or table row
              if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
                pageText += "\n";
              } else if (pageText.length > 0 && !pageText.endsWith(" ") && !pageText.endsWith("\n")) {
                pageText += " ";
              }

              pageText += str;
              if (currentY !== null) {
                lastY = currentY;
              }
            }

            fullText += pageText + "\n\n";
          }

          let cleaned = fullText
            .replace(/Encr\s+yption/gi, "Encryption")
            .replace(/Diffie\s*-\s*Hellman/gi, "Diffie-Hellman")
            .trim();
          if (cleaned.length > 20) {
            return {
              text: cleaned,
              success: true,
              pageCount: pdf.numPages,
            };
          }
        }
      } catch (pdfJsErr) {
        console.warn("PDF.js extraction failed, falling back to stream parsing:", pdfJsErr);
      }
    }

    // Fallback: Scan text operators from buffer
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(arrayBuffer);

    const textMatches: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(raw)) !== null) {
      if (match[1] && match[1].length > 2) {
        textMatches.push(match[1]);
      }
    }

    if (textMatches.length > 5) {
      return {
        text: textMatches.join(" "),
        success: true,
      };
    }

    // Scanned document or protected PDF
    return {
      text: "",
      success: false,
      isScanned: true,
    };
  } catch (err) {
    console.error("PDF extraction error:", err);
    return { text: "", success: false };
  }
}

function loadPdfJsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).pdfjsLib) return resolve();

    const existing = document.getElementById("pdfjs-cdn-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "pdfjs-cdn-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}
