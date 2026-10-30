// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Configure the worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, transX, transY]
  fontName: string;
  hasEOL: boolean;
}

/**
 * Converts a PDF file into clean, fully editable Word HTML structure
 * - Reconstructs headings, paragraphs, lists, and tables based on spatial coordinates
 * - Inserts Word page break dividers between PDF pages
 */
export async function convertPdfToWordHtml(file: File): Promise<{ html: string; pageCount: number; title: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageHtmls: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items.filter((item: any) => typeof item.str === 'string') as TextItem[];

    if (items.length === 0) {
      pageHtmls.push('<p></p>');
      continue;
    }

    // Sort items visually: Top to Bottom (descending Y), then Left to Right (ascending X)
    const sorted = [...items].sort((a, b) => {
      const yA = Math.round(a.transform[5]);
      const yB = Math.round(b.transform[5]);
      if (Math.abs(yA - yB) <= 4) {
        return a.transform[4] - b.transform[4];
      }
      return yB - yA;
    });

    // Group items into visual lines
    const lines: { y: number; fontSize: number; items: TextItem[]; text: string }[] = [];
    let currentLine: { y: number; fontSize: number; items: TextItem[] } | null = null;

    for (const item of sorted) {
      const y = Math.round(item.transform[5]);
      const fontSize = Math.round(Math.hypot(item.transform[0], item.transform[1])) || 12;

      if (!currentLine || Math.abs(currentLine.y - y) > 5) {
        if (currentLine) {
          const lineText = currentLine.items.map((it) => it.str).join(' ').trim();
          if (lineText) {
            lines.push({
              y: currentLine.y,
              fontSize: currentLine.fontSize,
              items: currentLine.items,
              text: lineText
            });
          }
        }
        currentLine = { y, fontSize, items: [item] };
      } else {
        currentLine.items.push(item);
        if (fontSize > currentLine.fontSize) {
          currentLine.fontSize = fontSize;
        }
      }
    }

    if (currentLine) {
      const lineText = currentLine.items.map((it) => it.str).join(' ').trim();
      if (lineText) {
        lines.push({
          y: currentLine.y,
          fontSize: currentLine.fontSize,
          items: currentLine.items,
          text: lineText
        });
      }
    }

    // Convert lines into semantic Word HTML (H1, H2, H3, Tables, Lists, Paragraphs)
    let pageHtml = '';
    let inTable = false;
    let tableRows: string[] = [];

    const flushTable = () => {
      if (inTable && tableRows.length > 0) {
        pageHtml += `<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">${tableRows.join('')}</table>`;
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const text = line.text;

      // Table detection: line has multiple well-separated segments across columns
      const hasColumns = line.items.length >= 3 && line.items.some((it, idx) => {
        if (idx === 0) return false;
        const prev = line.items[idx - 1];
        const gap = it.transform[4] - (prev.transform[4] + prev.width);
        return gap > 25;
      });

      if (hasColumns) {
        inTable = true;
        const cols = line.items.filter((it) => it.str.trim().length > 0);
        const isHeaderRow = tableRows.length === 0;
        const rowCells = cols
          .map(
            (col) =>
              isHeaderRow
                ? `<th style="border: 1px solid #d1d5db; padding: 6px 10px; background: #f3f4f6; text-align: left;">${escapeHtml(col.str.trim())}</th>`
                : `<td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: left;">${escapeHtml(col.str.trim())}</td>`
          )
          .join('');
        tableRows.push(`<tr>${rowCells}</tr>`);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Title & Headings
      if (line.fontSize >= 22) {
        pageHtml += `<h1 style="font-size: 20pt; font-weight: bold; margin: 1.25rem 0 0.5rem 0; text-align: center;">${escapeHtml(text)}</h1>`;
      } else if (line.fontSize >= 16) {
        pageHtml += `<h2 style="font-size: 15pt; font-weight: bold; margin: 1rem 0 0.4rem 0;">${escapeHtml(text)}</h2>`;
      } else if (line.fontSize >= 13.5) {
        pageHtml += `<h3 style="font-size: 12.5pt; font-weight: 600; margin: 0.75rem 0 0.3rem 0;">${escapeHtml(text)}</h3>`;
      } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
        // Bullet list item
        const itemContent = text.replace(/^[•\-*]\s*/, '');
        pageHtml += `<ul><li>${escapeHtml(itemContent)}</li></ul>`;
      } else if (/^\d+[\.\)]\s/.test(text)) {
        // Ordered list item
        const itemContent = text.replace(/^\d+[\.\)]\s*/, '');
        pageHtml += `<ol><li>${escapeHtml(itemContent)}</li></ol>`;
      } else {
        // Standard Paragraph
        pageHtml += `<p style="margin-bottom: 0.6rem; line-height: 1.5;">${escapeHtml(text)}</p>`;
      }
    }

    flushTable();
    pageHtmls.push(pageHtml);
  }

  // Combine pages with Word page breaks
  const finalHtml = pageHtmls.join(
    '<div data-type="page-break" class="word-manual-page-break"></div>'
  );

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
  return {
    html: finalHtml,
    pageCount: numPages,
    title: cleanTitle
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
