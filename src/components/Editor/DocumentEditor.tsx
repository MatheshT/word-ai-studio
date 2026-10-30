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

// Custom Image extension supporting resizing, frames, alignment, and filters
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width') || element.style.width,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`
          };
        }
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height') || element.style.height,
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return {
            height: attributes.height,
            style: `height: ${attributes.height}`
          };
        }
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          return { 'data-align': attributes.alignment || 'center' };
        }
      },
      frameStyle: {
        default: 'none',
        parseHTML: (element) => element.getAttribute('data-frame') || 'none',
        renderHTML: (attributes) => {
          return { 'data-frame': attributes.frameStyle || 'none' };
        }
      },
      filter: {
        default: '',
        parseHTML: (element) => element.style.filter || '',
        renderHTML: (attributes) => {
          if (!attributes.filter) return {};
          return { style: `filter: ${attributes.filter}` };
        }
      }
    };
  }
});

// Custom Table extension supporting styles
const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      tableStyle: {
        default: 'default',
        parseHTML: (element) => element.getAttribute('data-style') || 'default',
        renderHTML: (attributes) => {
          return { 'data-style': attributes.tableStyle || 'default' };
        }
      }
    };
  }
});

// Custom TableCell extension supporting background color shading
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`
          };
        }
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
      CustomTable.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
      CustomImage.configure({
        inline: false,
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
        showHeader: pageSettings.showHeader,
        headerText: pageSettings.headerText,
        showFooter: pageSettings.showFooter,
        footerText: pageSettings.footerText,
        pageNumberPosition: pageSettings.pageNumberPosition,
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

  // Synchronize pagination config dynamically whenever pageSettings change
  useEffect(() => {
    if (editor && (editor.commands as any).setPaginationConfig) {
      (editor.commands as any).setPaginationConfig({
        pageHeight: pageHeightNum,
        padTop,
        padBottom,
        padLeft,
        padRight,
        documentTitle,
        pageBgColor,
        isDarkPaper,
        showHeader: pageSettings.showHeader,
        headerText: pageSettings.headerText,
        showFooter: pageSettings.showFooter,
        footerText: pageSettings.footerText,
        pageNumberPosition: pageSettings.pageNumberPosition
      });
    }
  }, [
    editor,
    pageHeightNum,
    padTop,
    padBottom,
    padLeft,
    padRight,
    documentTitle,
    pageBgColor,
    isDarkPaper,
    pageSettings.showHeader,
    pageSettings.headerText,
    pageSettings.showFooter,
    pageSettings.footerText,
    pageSettings.pageNumberPosition
  ]);

  // Listen for header/footer edit events triggered from page break widgets
  useEffect(() => {
    const handleEditHeader = (e: any) => {
      const text = e.detail;
      onPageSettingsChange?.({
        ...pageSettings,
        showHeader: text.trim().length > 0,
        headerText: text
      });
    };
    const handleEditFooter = (e: any) => {
      const text = e.detail;
      onPageSettingsChange?.({
        ...pageSettings,
        showFooter: text.trim().length > 0,
        footerText: text
      });
    };
    window.addEventListener('word-edit-header', handleEditHeader);
    window.addEventListener('word-edit-footer', handleEditFooter);
    return () => {
      window.removeEventListener('word-edit-header', handleEditHeader);
      window.removeEventListener('word-edit-footer', handleEditFooter);
    };
  }, [pageSettings, onPageSettingsChange]);

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

          {/* Layer 3: Page 1 Header & Last Page Footer Overlay */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none select-none z-20"
            style={{ width: `${pageWidthNum}px`, height: `${totalMinHeight}px` }}
          >
            {/* Page 1 Header */}
            {pageSettings.showHeader || pageSettings.pageNumberPosition === 'top-right' ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const current = pageSettings.headerText || '';
                  const newText = prompt('Edit Header (leave blank to remove):', current);
                  if (newText !== null) {
                    onPageSettingsChange?.({
                      ...pageSettings,
                      showHeader: newText.trim().length > 0,
                      headerText: newText
                    });
                  }
                }}
                className={`absolute top-3.5 pointer-events-auto cursor-pointer group flex items-center justify-between text-xs border-b border-transparent hover:border-blue-400 hover:bg-blue-50/10 px-1 py-0.5 rounded transition-all ${
                  isDarkPaper ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
                style={{ left: `${padLeft}px`, right: `${padRight}px` }}
                title="Page 1 Header: Click to edit"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 bg-blue-500/20 text-blue-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Header
                  </span>
                  <span className="truncate font-medium text-[11px] font-sans">
                    {pageSettings.headerText || ''}
                  </span>
                </div>
                {pageSettings.pageNumberPosition === 'top-right' && (
                  <span className="text-[11px] font-sans ml-auto pl-2 font-medium">
                    Page 1 of {totalPages}
                  </span>
                )}
              </div>
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const text = prompt('Enter Header Text:');
                  if (text !== null && text.trim().length > 0) {
                    onPageSettingsChange?.({
                      ...pageSettings,
                      showHeader: true,
                      headerText: text
                    });
                  }
                }}
                className="absolute top-0 left-0 right-0 h-9 pointer-events-auto cursor-pointer group flex items-center justify-center"
                title="Double-click to add Header"
              >
                <span className="text-[10px] text-blue-400 font-medium opacity-0 group-hover:opacity-75 transition-opacity bg-blue-900/30 px-2 py-0.5 rounded border border-blue-400/30">
                  + Double-click to add Header
                </span>
              </div>
            )}

            {/* Last Page Footer */}
            {pageSettings.showFooter ||
            (pageSettings.pageNumberPosition &&
              pageSettings.pageNumberPosition !== 'none' &&
              pageSettings.pageNumberPosition !== 'top-right') ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const current = pageSettings.footerText || '';
                  const newText = prompt('Edit Footer (leave blank to remove):', current);
                  if (newText !== null) {
                    onPageSettingsChange?.({
                      ...pageSettings,
                      showFooter: newText.trim().length > 0,
                      footerText: newText
                    });
                  }
                }}
                className={`absolute pointer-events-auto cursor-pointer group flex items-center text-xs border-t border-transparent hover:border-blue-400 hover:bg-blue-50/10 px-1 py-0.5 rounded transition-all ${
                  isDarkPaper ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'
                } ${pageSettings.pageNumberPosition === 'bottom-center' ? 'justify-center' : 'justify-between'}`}
                style={{
                  top: `${totalMinHeight - Math.max(28, Math.round(padBottom * 0.6))}px`,
                  left: `${padLeft}px`,
                  right: `${padRight}px`
                }}
                title={`Page ${totalPages} Footer: Click to edit`}
              >
                {pageSettings.pageNumberPosition === 'bottom-center' ? (
                  <div className="flex items-center gap-2">
                    {pageSettings.footerText && (
                      <span className="text-[11px] font-sans mr-2 truncate">
                        {pageSettings.footerText} —
                      </span>
                    )}
                    <span className="text-[11px] font-sans font-medium">
                      - {totalPages} -
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 bg-teal-500/20 text-teal-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Footer
                      </span>
                      <span className="truncate text-[11px] font-sans">
                        {pageSettings.footerText || ''}
                      </span>
                    </div>
                    {pageSettings.pageNumberPosition === 'bottom-right' && (
                      <span className="text-[11px] font-sans ml-auto pl-2 font-medium">
                        Page {totalPages} of {totalPages}
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const text = prompt('Enter Footer Text:');
                  if (text !== null && text.trim().length > 0) {
                    onPageSettingsChange?.({
                      ...pageSettings,
                      showFooter: true,
                      footerText: text
                    });
                  }
                }}
                className="absolute left-0 right-0 h-9 pointer-events-auto cursor-pointer group flex items-center justify-center"
                style={{
                  top: `${totalMinHeight - Math.max(28, Math.round(padBottom * 0.6))}px`
                }}
                title="Double-click to add Footer"
              >
                <span className="text-[10px] text-teal-400 font-medium opacity-0 group-hover:opacity-75 transition-opacity bg-teal-900/30 px-2 py-0.5 rounded border border-teal-400/30">
                  + Double-click to add Footer
                </span>
              </div>
            )}
          </div>
        </div>
      </WordRulerContainer>
    </div>
  );
};
