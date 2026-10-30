import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import type { PageSettings, DocumentStats } from '../../types';
import { WordRulerContainer } from './WordRuler';
import { PageBreak } from '../../extensions/PageBreak';
import { PaginationExtension } from '../../extensions/PaginationExtension';

// Custom FontFamily extension
const FontFamily = Extension.create({
  name: 'fontFamily',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (el) => el.style.fontFamily?.replace(/['"]/g, ''),
            renderHTML: (attrs) => {
              if (!attrs.fontFamily) return {};
              return { style: `font-family: ${attrs.fontFamily}` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }: any) => {
          return chain().setMark('textStyle', { fontFamily }).run();
        }
    };
  }
});

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark('textStyle', { fontSize }).run();
        }
    };
  }
});

// Custom LineHeight extension
const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => el.style.lineHeight,
            renderHTML: (attrs) => {
              if (!attrs.lineHeight) return {};
              return { style: `line-height: ${attrs.lineHeight}` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }: any) => {
          return commands.updateAttributes('paragraph', { lineHeight });
        }
    };
  }
});

interface Props {
  initialContent?: string;
  documentTitle?: string;
  onEditorReady: (editor: any) => void;
  pageSettings: PageSettings;
  onPageSettingsChange?: (settings: PageSettings) => void;
  onStatsChange: (stats: DocumentStats) => void;
  onSelectionChange: (selectedText: string) => void;
  onAutoSaveSnapshot?: (html: string, wordCount: number) => void;
  onPaginationChange?: (info: { currentPage: number; totalPages: number }) => void;
  showRuler?: boolean;
  showGridlines?: boolean;
}

export const DocumentEditor: React.FC<Props> = ({
  initialContent,
  documentTitle = 'Project Proposal & Strategy',
  onEditorReady,
  pageSettings,
  onPageSettingsChange,
  onStatsChange,
  onSelectionChange,
  onAutoSaveSnapshot,
  onPaginationChange,
  showRuler = true,
  showGridlines = false
}) => {
  const [totalPages, setTotalPages] = useState<number>(1);

  // Determine page dimensions & padding based on settings
  const isLandscape = pageSettings.orientation === 'landscape';
  const isA4 = pageSettings.size === 'a4';

  const pageWidthNum = isLandscape ? (isA4 ? 1123 : 1056) : isA4 ? 794 : 816;
  const pageHeightNum = isLandscape ? (isA4 ? 794 : 816) : isA4 ? 1123 : 1056;

  // Margin padding in pixels
  const defaultLeft =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 64;
  const defaultRight =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 64;
  const defaultTop =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 64;
  const defaultBottom =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 64;

  const padLeft = pageSettings.customMargins?.left ?? defaultLeft;
  const padRight = pageSettings.customMargins?.right ?? defaultRight;
  const padTop = pageSettings.customMargins?.top ?? defaultTop;
  const padBottom = pageSettings.customMargins?.bottom ?? defaultBottom;

  const isDarkPaper = pageSettings.isDarkMode;
  const pageBgColor = pageSettings.pageColor || (isDarkPaper ? '#252526' : '#ffffff');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      FontFamily,
      FontSize,
      LineHeight,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false
      }),
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Subscript,
      Superscript,
      PageBreak,
      PaginationExtension.configure({
        pageHeight: pageHeightNum,
        padTop,
        padBottom,
        padLeft,
        padRight,
        documentTitle,
        pageBgColor,
        isDarkPaper,
        onPaginationUpdate: (info) => {
          setTotalPages((prev) => (prev !== info.totalPages ? info.totalPages : prev));
          onPaginationChange?.(info);
        }
      })
    ],
    content: initialContent || `
<h1>Project Proposal & Strategic Architecture</h1>
<p>Welcome to <strong>Word AI Studio</strong> — your intelligent, Microsoft Word-grade document authoring environment paired with a real-time autonomous AI copilot.</p>

<h2>1. Executive Summary</h2>
<p>Modern documents require more than passive formatting: they demand deep contextual awareness, instant proofreading, data structuring, and rapid synthesis. By integrating LLM reasoning directly into the document workflow, authoring speed is accelerated by up to 4x.</p>

<h2>2. Core Capabilities</h2>
<ul>
  <li><strong>Microsoft Word Ribbon & Typography:</strong> Full suite of font management, headings, paragraph alignment, checklists, and tables.</li>
  <li><strong>VS Code-style Inline AI (Ctrl+K):</strong> Select any text or place your cursor to instantly rewrite, change tone, fix grammar, or insert elements.</li>
  <li><strong>Copilot Sidebar Chat:</strong> Converse with your document, ask questions, and accept structured modifications with one click.</li>
  <li><strong>Interoperability:</strong> Import and export directly to native <code>.docx</code>, <code>.pdf</code>, <code>.html</code>, and <code>.md</code>.</li>
</ul>

<h2>3. Project Timeline & Deliverables</h2>
<table>
  <thead>
    <tr>
      <th>Phase</th>
      <th>Deliverable</th>
      <th>Status</th>
      <th>Target Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Phase 1</td>
      <td>Word Ribbon UI & Page View Layout</td>
      <td><strong>Completed</strong></td>
      <td>Q1</td>
    </tr>
    <tr>
      <td>Phase 2</td>
      <td>Tiptap Rich-Text Engine & Docx Exporter</td>
      <td><strong>Completed</strong></td>
      <td>Q2</td>
    </tr>
    <tr>
      <td>Phase 3</td>
      <td>Autonomous AI Copilot & Ctrl+K Inline Assistant</td>
      <td><strong>In Progress</strong></td>
      <td>Q3</td>
    </tr>
  </tbody>
</table>

<blockquote>
  "The future of document authoring is not just typing faster, but thinking collaboratively with artificial intelligence."
</blockquote>
`,
    onUpdate: ({ editor }) => {
      calculateStats(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      onSelectionChange(text.trim());
    }
  });

  const calculateStats = (ed: any) => {
    const text = ed.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
    const paragraphs = text.split('\n').filter((p: string) => p.trim().length > 0).length;
    const readingTimeMinutes = Math.ceil(words / 200);

    onStatsChange({
      words,
      characters,
      charactersWithoutSpaces,
      paragraphs,
      readingTimeMinutes
    });

    onAutoSaveSnapshot?.(ed.getHTML(), words);
  };

  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
      calculateStats(editor);
    }
  }, [editor]);

  const borderStyle =
    pageSettings.pageBorder === 'box'
      ? 'border-2 border-black'
      : pageSettings.pageBorder === 'double'
      ? 'border-4 border-double border-gray-700'
      : pageSettings.pageBorder === 'shadow'
      ? 'shadow-2xl border border-gray-400'
      : isDarkPaper
      ? 'border border-[#3e3e42]'
      : 'border border-[#d1d5db]';

  const totalMinHeight = Math.max(1, totalPages) * pageHeightNum + (Math.max(1, totalPages) - 1) * 32;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-auto flex flex-col items-center py-4 relative transition-colors duration-200 select-text bg-[#1e1e1e]">
      <WordRulerContainer
        pageWidth={pageWidthNum}
        pageHeight={pageHeightNum}
        zoom={pageSettings.zoom}
        totalPages={totalPages}
        pageSettings={pageSettings}
        onPageSettingsChange={onPageSettingsChange || (() => {})}
        showRuler={showRuler}
      >
        {/* Realistic Word Document Multi-Page Canvas with Watermark, Margins, and Gridlines */}
        <div
          className="transition-transform duration-100 ease-out flex justify-center mb-16"
          style={{
            transform: `scale(${pageSettings.zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          <div
            className={`shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xs print-page transition-all relative overflow-hidden flex flex-col justify-between ${borderStyle} ${
              isDarkPaper ? 'text-gray-100' : 'text-gray-900'
            }`}
            style={{
              width: `${pageWidthNum}px`,
              minHeight: `${totalMinHeight}px`,
              paddingTop: `${padTop}px`,
              paddingRight: `${padRight}px`,
              paddingBottom: `${padBottom}px`,
              paddingLeft: `${padLeft}px`,
              backgroundColor: pageBgColor,
              columnCount: pageSettings.columns || 1,
              columnGap: '2rem'
            }}
          >
            {/* Word Graph-Paper Gridlines (Overlaid across the page canvas) */}
            {showGridlines && (
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage: isDarkPaper
                    ? 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)'
                    : 'linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: `${padLeft % 20}px ${padTop % 20}px`
                }}
              />
            )}

            {/* Watermark Overlay on Each Page */}
            {pageSettings.watermark && pageSettings.watermark !== 'none' && (
              <div className="absolute inset-0 flex flex-col justify-around items-center pointer-events-none select-none z-0">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center" style={{ height: `${pageHeightNum}px` }}>
                    <span className="text-8xl font-black tracking-widest text-gray-400/15 -rotate-45 uppercase border-8 border-gray-400/15 px-12 py-4 rounded-xl">
                      {pageSettings.watermark}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Top Header of Page 1 */}
            <div
              className="flex items-center justify-between text-xs pb-3 border-b mb-6 select-none opacity-60 no-print relative z-10"
              style={{
                borderColor: isDarkPaper ? '#383838' : '#e5e7eb',
                color: isDarkPaper ? '#a0a0a0' : '#6b7280'
              }}
            >
              <span className="text-[10px] font-medium tracking-wide uppercase">{documentTitle || 'Document'}</span>
              <span className="text-[10px] font-medium">Page 1</span>
            </div>

            {/* Document Flowing Content */}
            <div
              className="relative z-10 flex-1"
              style={{
                textIndent: pageSettings.firstLineIndent
                  ? `${pageSettings.firstLineIndent}px`
                  : undefined
              }}
            >
              <EditorContent editor={editor} />
            </div>

            {/* Bottom Footer of Final Page */}
            <div
              className="flex items-center justify-between text-xs pt-4 border-t mt-8 select-none opacity-60 no-print relative z-10"
              style={{
                borderColor: isDarkPaper ? '#383838' : '#e5e7eb',
                color: isDarkPaper ? '#a0a0a0' : '#6b7280'
              }}
            >
              <span className="text-[10px] font-medium tracking-wide uppercase">{documentTitle || 'Document'}</span>
              <span className="text-[10px] font-semibold">Page {totalPages} of {totalPages}</span>
            </div>
          </div>
        </div>
      </WordRulerContainer>
    </div>
  );
};
