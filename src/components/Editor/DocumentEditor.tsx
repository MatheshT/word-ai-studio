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
    content: initialContent || '<p></p>',
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
          className="transition-transform duration-100 ease-out flex justify-center mb-16 relative"
          style={{
            transform: `scale(${pageSettings.zoom / 100})`,
            transformOrigin: 'top center',
            width: `${pageWidthNum}px`
          }}
        >
          {/* Layer 1: Background Physical Paper Sheets (Each page in exact fixed dimensions) */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none flex flex-col items-center select-none z-0">
            {Array.from({ length: totalPages }).map((_, pIdx) => (
              <div
                key={pIdx}
                className={`rounded-xs transition-all relative overflow-hidden flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${borderStyle}`}
                style={{
                  width: `${pageWidthNum}px`,
                  height: `${pageHeightNum}px`,
                  backgroundColor: pageBgColor,
                  marginBottom: pIdx < totalPages - 1 ? '32px' : '0px',
                  paddingTop: `${padTop}px`,
                  paddingRight: `${padRight}px`,
                  paddingBottom: `${padBottom}px`,
                  paddingLeft: `${padLeft}px`
                }}
              >
                {/* Gridlines on this specific page sheet */}
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

                {/* Watermark on this specific page sheet (only when explicitly enabled) */}
                {pageSettings.watermark && pageSettings.watermark !== 'none' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                    <span className="text-8xl font-black tracking-widest text-gray-400/15 -rotate-45 uppercase border-8 border-gray-400/15 px-12 py-4 rounded-xl">
                      {pageSettings.watermark}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Layer 2: Editable ProseMirror Content Layer (Seamlessly flows across the sheets) */}
          <div
            className={`relative z-10 print-page ${isDarkPaper ? 'text-gray-100' : 'text-gray-900'}`}
            style={{
              width: `${pageWidthNum}px`,
              minHeight: `${totalMinHeight}px`,
              paddingTop: `${padTop}px`,
              paddingRight: `${padRight}px`,
              paddingBottom: `${padBottom}px`,
              paddingLeft: `${padLeft}px`,
              columnCount: pageSettings.columns || 1,
              columnGap: '2rem'
            }}
          >
            <div
              style={{
                textIndent: pageSettings.firstLineIndent
                  ? `${pageSettings.firstLineIndent}px`
                  : undefined
              }}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </WordRulerContainer>
    </div>
  );
};
