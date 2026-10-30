import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, Header, Footer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Saves a file by prompting the native Windows / OS File Manager (File Explorer) dialog,
 * allowing the user to choose their exact folder location and file name.
 * Seamlessly falls back to file-saver download for browsers without showSaveFilePicker.
 */
export async function saveToFileManager(
  blob: Blob,
  suggestedName: string,
  types?: { description: string; accept: Record<string, string[]> }[]
) {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: types || [
          {
            description: 'Microsoft Word Document (*.docx)',
            accept: {
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
            }
          }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return false;
      }
      console.warn('File picker fallback triggered:', err);
    }
  }

  saveAs(blob, suggestedName);
  return true;
}

export async function exportToDocx(htmlContent: string, fileName: string = 'document.docx', pageSettings?: any) {
  // Parse HTML content into DOM elements
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const bodyChildren = Array.from(doc.body.children);

  const docxElements: (Paragraph | Table)[] = [];

  for (const el of bodyChildren) {
    const tagName = el.tagName.toLowerCase();

    if (tagName.startsWith('h')) {
      const level = parseInt(tagName.replace('h', '')) || 1;
      let headingLevel: any = HeadingLevel.HEADING_1;
      if (level === 2) headingLevel = HeadingLevel.HEADING_2;
      if (level === 3) headingLevel = HeadingLevel.HEADING_3;
      if (level >= 4) headingLevel = HeadingLevel.HEADING_4;

      docxElements.push(
        new Paragraph({
          text: el.textContent || '',
          heading: headingLevel,
          spacing: { before: 200, after: 120 }
        })
      );
    } else if (tagName === 'p') {
      const runs = parseInlineElements(el);
      docxElements.push(
        new Paragraph({
          children: runs.length ? runs : [new TextRun(el.textContent || '')],
          spacing: { after: 140 }
        })
      );
    } else if (tagName === 'ul' || tagName === 'ol') {
      const listItems = Array.from(el.querySelectorAll('li'));
      for (const li of listItems) {
        const runs = parseInlineElements(li);
        docxElements.push(
          new Paragraph({
            children: runs.length ? runs : [new TextRun(li.textContent || '')],
            bullet: { level: 0 },
            spacing: { after: 80 }
          })
        );
      }
    } else if (tagName === 'table') {
      const rows = Array.from(el.querySelectorAll('tr'));
      const tableRows: TableRow[] = [];

      for (const tr of rows) {
        const cells = Array.from(tr.querySelectorAll('th, td'));
        const tableCells: TableCell[] = [];

        for (const cell of cells) {
          const isHeader = cell.tagName.toLowerCase() === 'th';
          tableCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell.textContent || '',
                      bold: isHeader,
                      size: isHeader ? 22 : 20
                    })
                  ]
                })
              ],
              shading: isHeader ? { fill: 'F3F4F6' } : undefined,
              margins: { top: 100, bottom: 100, left: 120, right: 120 }
            })
          );
        }

        if (tableCells.length > 0) {
          tableRows.push(new TableRow({ children: tableCells }));
        }
      }

      if (tableRows.length > 0) {
        docxElements.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          })
        );
        // Add spacing after table
        docxElements.push(new Paragraph({ text: '', spacing: { after: 160 } }));
      }
    } else if (tagName === 'blockquote') {
      docxElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: el.textContent || '',
              italics: true,
              color: '555555'
            })
          ],
          indent: { left: 720 },
          spacing: { before: 100, after: 140 }
        })
      );
    } else {
      // General fallback
      if (el.textContent?.trim()) {
        docxElements.push(
          new Paragraph({
            text: el.textContent,
            spacing: { after: 120 }
          })
        );
      }
    }
  }

  // Configure headers & footers if present in pageSettings
  const headers: any = {};
  if (pageSettings?.showHeader && pageSettings?.headerText) {
    headers.default = new Header({
      children: [
        new Paragraph({
          children: [new TextRun(pageSettings.headerText)],
          alignment: AlignmentType.RIGHT
        })
      ]
    });
  }

  const footers: any = {};
  if (pageSettings?.showFooter || pageSettings?.pageNumberPosition) {
    const footerRuns: TextRun[] = [];
    if (pageSettings?.footerText) {
      footerRuns.push(new TextRun(pageSettings.footerText));
    }
    footers.default = new Footer({
      children: [
        new Paragraph({
          children: footerRuns,
          alignment: AlignmentType.CENTER
        })
      ]
    });
  }

  // Create docx document
  const wordDoc = new Document({
    sections: [
      {
        properties: {},
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        footers: Object.keys(footers).length > 0 ? footers : undefined,
        children: docxElements.length > 0 ? docxElements : [new Paragraph({ text: 'Empty Document' })]
      }
    ]
  });

  const blob = await Packer.toBlob(wordDoc);
  const targetName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  await saveToFileManager(blob, targetName, [
    {
      description: 'Microsoft Word Document (*.docx)',
      accept: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
      }
    }
  ]);
}

function parseInlineElements(node: Element): TextRun[] {
  const runs: TextRun[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) {
        runs.push(new TextRun({ text: child.textContent }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const isBold = tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold';
      const isItalic = tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
      const isUnderline = tag === 'u';
      const isStrike = tag === 's' || tag === 'strike' || tag === 'del';

      runs.push(
        new TextRun({
          text: el.textContent || '',
          bold: isBold,
          italics: isItalic,
          underline: isUnderline ? {} : undefined,
          strike: isStrike
        })
      );
    }
  }

  return runs;
}

export async function exportToHtml(htmlContent: string, fileName: string = 'document.html') {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fileName.replace(/\.[^/.]+$/, "")}</title>
  <style>
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #333;
    }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f4f5f7; }
    blockquote { border-left: 4px solid #2b579a; margin: 0; padding-left: 16px; color: #555; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const targetName = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
  await saveToFileManager(blob, targetName, [
    {
      description: 'HTML Document (*.html)',
      accept: { 'text/html': ['.html', '.htm'] }
    }
  ]);
}

export async function exportToMarkdown(htmlContent: string, fileName: string = 'document.md') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  let md = '';
  for (const child of Array.from(doc.body.children)) {
    const tag = child.tagName.toLowerCase();
    const text = child.textContent?.trim() || '';
    if (tag === 'h1') md += `# ${text}\n\n`;
    else if (tag === 'h2') md += `## ${text}\n\n`;
    else if (tag === 'h3') md += `### ${text}\n\n`;
    else if (tag === 'p') md += `${text}\n\n`;
    else if (tag === 'blockquote') md += `> ${text}\n\n`;
    else if (tag === 'ul') {
      Array.from(child.querySelectorAll('li')).forEach(li => {
        md += `* ${li.textContent?.trim()}\n`;
      });
      md += '\n';
    } else if (tag === 'ol') {
      Array.from(child.querySelectorAll('li')).forEach((li, idx) => {
        md += `${idx + 1}. ${li.textContent?.trim()}\n`;
      });
      md += '\n';
    } else {
      md += `${text}\n\n`;
    }
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const targetName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
  await saveToFileManager(blob, targetName, [
    {
      description: 'Markdown File (*.md)',
      accept: { 'text/markdown': ['.md'] }
    }
  ]);
}

export async function exportToTxt(htmlContent: string, fileName: string = 'document.txt') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const text = doc.body.textContent || '';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const targetName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
  await saveToFileManager(blob, targetName, [
    {
      description: 'Plain Text File (*.txt)',
      accept: { 'text/plain': ['.txt'] }
    }
  ]);
}
