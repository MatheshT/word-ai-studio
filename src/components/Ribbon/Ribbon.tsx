import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  FileText,
  Save,
  Printer,
  Sparkles,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  Scissors,
  Copy,
  Paintbrush,
  ChevronDown,
  Search,
  Replace,
  MousePointer,
  Moon,
  Maximize2,
  FolderOpen,
  FilePlus,
  Share2,
  MessageSquare,
  Edit3,
  Table as TableIcon,
  ImageIcon,
  Link as LinkIcon,
  Calendar,
  FileDown,
  SpellCheck,
  Settings,
  Volume2,
  BookOpen,
  Languages,
  Bookmark,
  PlusSquare,
  Layers,
  Palette,
  Type,
  PieChart,
  Stamp,
  Mail,
  UserCheck,
  PanelTop,
  PanelBottom,
  Hash,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Move,
  Sun,
  Contrast,
  Crop,
  Square,
  Trash2,
  PaintBucket,
  Grid,
  Columns,
  Rows,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import type { PageSettings, PageMargins, PageOrientation } from '../../types';

interface Props {
  editor: Editor | null;
  documentTitle: string;
  onTitleChange: (title: string) => void;
  pageSettings: PageSettings;
  onPageSettingsChange: (settings: PageSettings) => void;
  onSaveDocx: () => void;
  onExportPdf: () => void;
  onExportHtml: () => void;
  onExportMarkdown: () => void;
  onImportDocx: (file: File) => void;
  onNewDocument: () => void;
  onOpenSettings: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenInlineAi: () => void;
  onOpenTemplates: () => void;
  onOpenFindReplace: (mode: 'find' | 'replace') => void;
  onToggleNavigation: () => void;
  isNavigationOpen: boolean;
  onToggleProofreading: () => void;
  isProofreadingOpen: boolean;
  onOpenVersionHistory: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  showRuler: boolean;
  onToggleRuler: () => void;
  showGridlines: boolean;
  onToggleGridlines: () => void;
  onOpenImageModal: () => void;
  onOpenSymbolsModal: () => void;
  onOpenThesaurusModal: () => void;
  onOpenTranslateModal: () => void;
}

export const Ribbon: React.FC<Props> = ({
  editor,
  documentTitle,
  onTitleChange,
  pageSettings,
  onPageSettingsChange,
  onSaveDocx,
  onExportPdf,
  onExportHtml,
  onExportMarkdown,
  onImportDocx,
  onNewDocument,
  onOpenSettings,
  onToggleCopilot,
  isCopilotOpen,
  onOpenInlineAi,
  onOpenTemplates,
  onOpenFindReplace,
  onToggleNavigation,
  isNavigationOpen,
  onToggleProofreading,
  isProofreadingOpen,
  onOpenVersionHistory,
  isFocusMode,
  onToggleFocusMode,
  showRuler,
  onToggleRuler,
  showGridlines,
  onToggleGridlines,
  onOpenImageModal,
  onOpenSymbolsModal,
  onOpenThesaurusModal,
  onOpenTranslateModal
}) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'insert' | 'design' | 'layout' | 'references' | 'mailings' | 'review' | 'view' | 'help' | 'acrobat' | 'copilot' | 'pictureFormat' | 'tableDesign' | 'tableLayout'
  >('home');
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSpacingPicker, setShowSpacingPicker] = useState(false);
  const [showCasePicker, setShowCasePicker] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showWatermarkPicker, setShowWatermarkPicker] = useState(false);
  const [showPageColorPicker, setShowPageColorPicker] = useState(false);
  const [showHeaderPicker, setShowHeaderPicker] = useState(false);
  const [showFooterPicker, setShowFooterPicker] = useState(false);
  const [showPageNumPicker, setShowPageNumPicker] = useState(false);
  const [showCellColorPicker, setShowCellColorPicker] = useState(false);

  const isImageActive = editor?.isActive('image') || false;
  const isTableActive = editor?.isActive('table') || false;

  React.useEffect(() => {
    if (!editor) return;
    const handleSelection = () => {
      if (editor.isActive('image')) {
        setActiveTab('pictureFormat');
      }
    };
    editor.on('selectionUpdate', handleSelection);
    return () => {
      editor.off('selectionUpdate', handleSelection);
    };
  }, [editor]);
  const [tableGrid, setTableGrid] = useState({ rows: 3, cols: 3 });
  const [currentFontSize, setCurrentFontSize] = useState('14');
  const [currentFontFamily, setCurrentFontFamily] = useState('Times New Roman');
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDocx(file);
      e.target.value = '';
    }
  };

  const handleFontSizeChange = (size: string) => {
    setCurrentFontSize(size);
    (editor.chain().focus() as any).setFontSize(`${size}pt`).run();
  };

  const handleIncreaseFontSize = () => {
    const next = Math.min(72, parseInt(currentFontSize, 10) + 2).toString();
    handleFontSizeChange(next);
  };

  const handleDecreaseFontSize = () => {
    const next = Math.max(8, parseInt(currentFontSize, 10) - 2).toString();
    handleFontSizeChange(next);
  };

  const handleFontFamilyChange = (font: string) => {
    setCurrentFontFamily(font);
    (editor.chain().focus() as any).setFontFamily(font).run();
  };

  const handleChangeCase = (caseType: 'sentence' | 'lower' | 'upper' | 'capitalize') => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    let transformed = text;
    if (caseType === 'upper') transformed = text.toUpperCase();
    else if (caseType === 'lower') transformed = text.toLowerCase();
    else if (caseType === 'capitalize') {
      transformed = text.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (caseType === 'sentence') {
      transformed = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    editor.chain().focus().insertContent(transformed).run();
    setShowCasePicker(false);
  };

  const handleFormatPainter = () => {
    alert('Format Painter Active: Select text anywhere in the document to apply current styles.');
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTablePicker(false);
  };

  const handleInsertCoverPage = () => {
    const coverHtml = `
<div style="text-align: center; font-family: 'Times New Roman', serif; padding: 2rem 0; margin-bottom: 2rem;">
  <h1 style="font-size: 16pt; font-weight: bold; line-height: 1.4; margin-bottom: 12px; text-transform: uppercase;">
    DESIGN AND IMPLEMENTATION OF MICROPLASTICS REMOVAL FROM CONTAMINATED WATER BY ELECTROCOAGULATION
  </h1>
  <p style="font-size: 12pt; font-weight: bold; margin-bottom: 24px;">
    21EE511 – ENGINEERING EXPLORATION V
  </p>
  <div style="margin: 24px 0;">
    <p style="font-weight: bold; font-size: 10pt; letter-spacing: 0.15em; color: #15803d; text-transform: uppercase;">
      POWERING THE YOUTH<br/>
      EMPOWERING THE NATION
    </p>
  </div>
  <p style="font-style: italic; font-size: 12pt; margin-top: 24px; margin-bottom: 16px;">
    Submitted by
  </p>
  <table style="width: 85%; margin: 0 auto 32px auto; border: none; font-size: 11pt;">
    <tbody>
      <tr>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: left;">JEFFREY DANIEL C</td>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: right;">(714024105018)</td>
      </tr>
      <tr>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: left;">MATHAN T</td>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: right;">(714024105031)</td>
      </tr>
      <tr>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: left;">RAVI VINOD R</td>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: right;">(714024105038)</td>
      </tr>
      <tr>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: left;">VISHAL K</td>
        <td style="border: none; padding: 4px; font-weight: bold; text-align: right;">(714024105054)</td>
      </tr>
    </tbody>
  </table>
  <p style="font-style: italic; font-size: 11pt; margin-top: 24px; margin-bottom: 6px;">
    In partial fulfillment for the award of the degree of
  </p>
  <p style="font-size: 12pt; font-weight: bold; margin-bottom: 6px;">
    BACHELOR OF ENGINEERING
  </p>
  <p style="font-size: 11pt; font-style: italic; margin-bottom: 6px;">
    in
  </p>
  <p style="font-size: 12pt; font-weight: bold; margin-bottom: 32px;">
    ELECTRICAL AND ELECTRONICS ENGINEERING
  </p>
  <p style="font-size: 12pt; font-weight: bold; margin-bottom: 4px;">
    SRI SHAKTHI
  </p>
  <p style="font-size: 12pt; font-weight: bold; margin-bottom: 4px;">
    INSTITUTE OF ENGINEERING AND TECHNOLOGY
  </p>
  <p style="font-size: 10pt; margin-bottom: 4px;">
    An Autonomous Institute, Accredited by NAAC with “A” Grade
  </p>
  <p style="font-size: 11pt; font-weight: bold; margin-bottom: 24px;">
    COIMBATORE-62
  </p>
  <p style="font-size: 11pt; font-weight: bold; margin-bottom: 16px;">
    ANNA UNIVERSITY: CHENNAI 600025
  </p>
  <p style="font-size: 11pt; font-weight: bold;">
    NOVEMBER - 2026
  </p>
</div>
<div data-type="page-break" class="word-manual-page-break"></div>
`;
    const cur = editor.getHTML();
    editor.commands.setContent(`${coverHtml}${cur}`);
  };

  const handleInsertTableOfContents = () => {
    const doc = editor.state.doc;
    const headings: string[] = [];
    doc.descendants((node) => {
      if (node.type.name === 'heading') {
        headings.push(node.textContent);
      }
    });

    const tocList = headings.length
      ? headings.map((h, i) => `<li><strong>${i + 1}. ${h}</strong> ................................................................ Page 1</li>`).join('')
      : '<li>1. Executive Summary ................................................................ Page 1</li><li>2. Project Milestones ................................................................ Page 1</li>';

    const tocHtml = `
<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
  <h2 style="color: #0078d4; margin-top: 0; border-bottom: 2px solid #0078d4; padding-bottom: 0.5rem;">Table of Contents</h2>
  <ul style="list-style: none; padding-left: 0; line-height: 2;">
    ${tocList}
  </ul>
</div>
`;
    editor.chain().focus().insertContent(tocHtml).run();
  };

  const handleInsertFootnote = () => {
    const count = Math.floor(Math.random() * 8) + 1;
    editor.chain().focus().insertContent(`<sup>[${count}]</sup>`).run();
    const cur = editor.getHTML();
    editor.commands.setContent(`${cur}<p style="font-size: 9pt; color: #666; border-top: 1px solid #ddd; padding-top: 4px; margin-top: 16px;"><em>[${count}] Standard enterprise citation benchmark analysis.</em></p>`);
  };

  const handleInsertCitation = () => {
    editor.chain().focus().insertContent(' (Smith et al., 2026) ').run();
  };

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = editor.getText();
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 1500));
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);
    setIsReadingAloud(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleInsertTextBox = () => {
    const boxHtml = `
<blockquote style="background: #eff6ff; border-left: 5px solid #0078d4; padding: 16px; border-radius: 4px; margin: 16px 0;">
  <strong style="color: #1e3a8a; font-size: 12pt;">Key Strategic Highlight</strong>
  <p style="margin-top: 6px; color: #1e293b;">Insert customized insights, critical project warnings, or executive takeaways in this highlighted text callout.</p>
</blockquote>
`;
    editor.chain().focus().insertContent(boxHtml).run();
  };

  const handleInsertWordArt = () => {
    const wordArtHtml = `<h1 style="font-size: 32pt; font-family: 'Times New Roman', serif; background: linear-gradient(45deg, #0078d4, #b146c2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 2px 2px 4px rgba(0,0,0,0.15);">ENTERPRISE LEADERSHIP</h1>`;
    editor.chain().focus().insertContent(wordArtHtml).run();
  };

  const handleApplyTheme = (themeName: string, primaryColor: string, headingFont: string) => {
    handleFontFamilyChange(headingFont);
    const cur = editor.getHTML();
    const styled = cur.replace(/<h1(.*?)>/gi, `<h1$1 style="color: ${primaryColor}; font-family: ${headingFont};">`);
    editor.commands.setContent(styled);
    alert(`Applied "${themeName}" theme across document!`);
  };

  const textColors = ['#000000', '#185abd', '#d83b01', '#107c41', '#5c2d91', '#b146c2', '#ffffff'];
  const highlightColors = ['#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff8000', 'transparent'];

  return (
    <header className="flex flex-col bg-[#202020] border-b border-[#333333] z-30 select-none shrink-0 no-print text-[#e1dfdd]">
      {/* 1. Top Bar: App Title + Tabs Row + Comments / Editing / Share */}
      <div className="flex items-center justify-between px-2 h-9 bg-[#1b1a19] text-xs border-b border-[#2d2d2d]">
        <div className="flex items-center space-x-0.5">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors ${
                isFileMenuOpen ? 'bg-[#0078d4] text-white' : 'hover:bg-[#333333] text-gray-200'
              }`}
            >
              File
            </button>

            {isFileMenuOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded-b-lg py-2 z-50 text-gray-200">
                <button
                  onClick={() => {
                    onNewDocument();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <FilePlus className="w-4 h-4 text-blue-400" />
                  <span>New Blank Document</span>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs text-blue-300 font-semibold"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Word Templates Gallery...</span>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <FolderOpen className="w-4 h-4 text-amber-500" />
                  <span>Open .docx Document</span>
                </button>

                <div className="h-px bg-[#3e3e42] my-1.5" />

                <button
                  onClick={() => {
                    onSaveDocx();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <Save className="w-4 h-4 text-blue-400" />
                  <span>Save as Microsoft Word (.docx)</span>
                </button>

                <button
                  onClick={() => {
                    onExportPdf();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <Printer className="w-4 h-4 text-rose-400" />
                  <span>Create a PDF / Print</span>
                </button>

                <button
                  onClick={() => {
                    onExportHtml();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Export as Web Page (.html)</span>
                </button>

                <button
                  onClick={() => {
                    onExportMarkdown();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <FileDown className="w-4 h-4 text-purple-400" />
                  <span>Export as Markdown (.md)</span>
                </button>

                <div className="h-px bg-[#3e3e42] my-1.5" />

                <button
                  onClick={() => {
                    onOpenVersionHistory();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2.5 text-xs"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Version History</span>
                </button>
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".docx" className="hidden" />

          {/* Complete Tabs matching all User Screenshots */}
          {(
            [
              'home',
              'insert',
              'design',
              'layout',
              'references',
              'mailings',
              'review',
              'view',
              'acrobat',
              'copilot'
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsFileMenuOpen(false);
              }}
              className={`px-3 py-1 capitalize font-medium rounded-xs transition-colors ${
                activeTab === tab
                  ? 'bg-[#2b2b2b] text-white font-bold border-b-2 border-[#0078d4]'
                  : 'text-gray-300 hover:bg-[#2e2e2e] hover:text-white'
              }`}
            >
              {tab === 'home' && 'Home'}
              {tab === 'insert' && 'Insert'}
              {tab === 'design' && 'Design'}
              {tab === 'layout' && 'Layout'}
              {tab === 'references' && 'References'}
              {tab === 'mailings' && 'Mailings'}
              {tab === 'review' && 'Review'}
              {tab === 'view' && 'View'}
              {tab === 'acrobat' && 'Acrobat'}
              {tab === 'copilot' && '✨ AI Copilot'}
            </button>
          ))}

          {/* Contextual Picture Format Tab (Matches Word Screenshot) */}
          {(isImageActive || activeTab === 'pictureFormat') && (
            <button
              onClick={() => {
                setActiveTab('pictureFormat');
                setIsFileMenuOpen(false);
              }}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'pictureFormat'
                  ? 'bg-[#1e3a5f] text-blue-300 font-bold border-b-2 border-blue-400 shadow-sm'
                  : 'text-blue-400 hover:bg-[#1e293b] hover:text-blue-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Picture Format
            </button>
          )}

          {/* Contextual Table Design & Layout Tabs */}
          {(isTableActive || activeTab === 'tableDesign' || activeTab === 'tableLayout') && (
            <>
              <button
                onClick={() => {
                  setActiveTab('tableDesign');
                  setIsFileMenuOpen(false);
                }}
                className={`px-3 py-1 font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tableDesign'
                    ? 'bg-[#064e3b] text-emerald-300 font-bold border-b-2 border-emerald-400 shadow-sm'
                    : 'text-emerald-400 hover:bg-[#064e3b]/50 hover:text-emerald-300'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table Design
              </button>
              <button
                onClick={() => {
                  setActiveTab('tableLayout');
                  setIsFileMenuOpen(false);
                }}
                className={`px-3 py-1 font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tableLayout'
                    ? 'bg-[#134e4a] text-teal-300 font-bold border-b-2 border-teal-400 shadow-sm'
                    : 'text-teal-400 hover:bg-[#134e4a]/50 hover:text-teal-300'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Table Layout
              </button>
            </>
          )}
        </div>

        {/* Center: Title */}
        <div className="hidden md:flex items-center">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent hover:bg-white/10 focus:bg-white/15 text-gray-200 text-center font-medium text-xs px-2 py-0.5 rounded outline-none border border-transparent focus:border-blue-500 transition-colors w-48 truncate"
            title="Rename Document"
          />
        </div>

        {/* Right Tools (Comments, Editing, Share) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => alert('Comments: Document is ready for review.')}
            className="px-2.5 py-1 text-xs border border-[#444444] rounded hover:bg-[#333333] text-gray-200 flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments</span>
          </button>

          <button
            onClick={onOpenInlineAi}
            className="px-2 py-1 text-xs border border-[#444444] rounded hover:bg-[#333333] text-gray-200 flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Editing</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <button
            onClick={onSaveDocx}
            className="px-3 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Ribbon Content Area */}
      <div className="h-[92px] bg-[#202020] px-3 py-1.5 flex items-stretch gap-3 overflow-x-auto text-xs">
        {/* ======================= 1. HOME TAB ======================= */}
        {activeTab === 'home' && (
          <>
            {/* Clipboard */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-start gap-1">
                <button
                  onClick={() => document.execCommand('paste')}
                  className="flex flex-col items-center justify-center p-1 px-2 hover:bg-[#333333] rounded transition-colors text-gray-200 group"
                  title="Paste (Ctrl+V)"
                >
                  <FileText className="w-6 h-6 text-amber-400 group-hover:scale-105" />
                  <span className="text-[11px] font-normal mt-0.5 flex items-center">
                    Paste <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => document.execCommand('cut')} className="p-1 hover:bg-[#333333] rounded text-gray-300" title="Cut">
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => document.execCommand('copy')} className="p-1 hover:bg-[#333333] rounded text-gray-300" title="Copy">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleFormatPainter} className="p-1 hover:bg-[#333333] rounded text-amber-400" title="Format Painter">
                    <Paintbrush className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Clipboard ⬚</span>
            </div>

            {/* Font */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <select
                  value={currentFontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                  className="bg-[#2b2b2b] text-gray-100 border border-[#444444] rounded px-2 py-0.5 text-xs outline-none w-32 cursor-pointer"
                >
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="'Segoe UI'">Segoe UI</option>
                  <option value="Consolas">Consolas</option>
                </select>

                <select
                  value={currentFontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className="bg-[#2b2b2b] text-gray-100 border border-[#444444] rounded px-2 py-0.5 text-xs outline-none w-14 cursor-pointer"
                >
                  {['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48', '72'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <button onClick={handleIncreaseFontSize} className="p-1 hover:bg-[#333333] rounded text-gray-200 font-bold text-xs" title="Increase Size">A^</button>
                <button onClick={handleDecreaseFontSize} className="p-1 hover:bg-[#333333] rounded text-gray-200 text-xs" title="Decrease Size">Av</button>

                <div className="relative">
                  <button onClick={() => setShowCasePicker(!showCasePicker)} className="p-1 hover:bg-[#333333] rounded text-gray-200 text-xs flex items-center">
                    Aa <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </button>
                  {showCasePicker && (
                    <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-xl rounded py-1 z-50 w-36 text-xs text-gray-200">
                      <button onClick={() => handleChangeCase('sentence')} className="w-full text-left px-3 py-1 hover:bg-[#333333]">Sentence case.</button>
                      <button onClick={() => handleChangeCase('lower')} className="w-full text-left px-3 py-1 hover:bg-[#333333]">lowercase</button>
                      <button onClick={() => handleChangeCase('upper')} className="w-full text-left px-3 py-1 hover:bg-[#333333]">UPPERCASE</button>
                      <button onClick={() => handleChangeCase('capitalize')} className="w-full text-left px-3 py-1 hover:bg-[#333333]">Capitalize Each Word</button>
                    </div>
                  )}
                </div>

                <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="p-1 hover:bg-[#333333] rounded text-purple-400 font-bold" title="Clear Formatting">
                  A<span className="text-[10px] text-pink-400">⌫</span>
                </button>
              </div>

              <div className="flex items-center gap-0.5 relative">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 px-1.5 rounded ${editor.isActive('bold') ? 'bg-[#3b3a39] border border-gray-400 text-white font-bold' : 'hover:bg-[#333333] text-gray-200'}`} title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 px-1.5 rounded ${editor.isActive('italic') ? 'bg-[#3b3a39] border border-gray-400 text-white' : 'hover:bg-[#333333] text-gray-200'}`} title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 px-1.5 rounded flex items-center ${editor.isActive('underline') ? 'bg-[#3b3a39] border border-gray-400 text-white' : 'hover:bg-[#333333] text-gray-200'}`} title="Underline">
                  <UnderlineIcon className="w-3.5 h-3.5" />
                  <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                </button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1 px-1.5 rounded ${editor.isActive('strike') ? 'bg-[#3b3a39] text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Strikethrough">
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`p-1 px-1.5 rounded ${editor.isActive('subscript') ? 'bg-[#3b3a39] text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Subscript">
                  <SubscriptIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`p-1 px-1.5 rounded ${editor.isActive('superscript') ? 'bg-[#3b3a39] text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Superscript">
                  <SuperscriptIcon className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button onClick={() => setShowHighlightPicker(!showHighlightPicker)} className="p-1 px-1.5 rounded hover:bg-[#333333] flex flex-col items-center" title="Highlight">
                    <span className="text-amber-300 text-xs font-bold leading-none">✎</span>
                    <span className="w-3.5 h-1 bg-yellow-400 mt-0.5" />
                  </button>
                  {showHighlightPicker && (
                    <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-xl rounded p-2 z-50 flex gap-1">
                      {highlightColors.map((h) => (
                        <div key={h} onClick={() => { if (h === 'transparent') editor.chain().focus().unsetHighlight().run(); else editor.chain().focus().setHighlight({ color: h }).run(); setShowHighlightPicker(false); }} className="w-5 h-5 rounded cursor-pointer border border-gray-600 hover:scale-110" style={{ backgroundColor: h }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-1 px-1.5 rounded hover:bg-[#333333] flex flex-col items-center" title="Font Color">
                    <span className="text-gray-100 text-xs font-bold leading-none">A</span>
                    <span className="w-3.5 h-1 bg-red-600 mt-0.5" />
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-xl rounded p-2 z-50 flex gap-1">
                      {textColors.map((c) => (
                        <div key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }} className="w-5 h-5 rounded cursor-pointer border border-gray-600 hover:scale-110" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Font ⬚</span>
            </div>

            {/* Paragraph */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-0.5">
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 px-1.5 rounded flex items-center ${editor.isActive('bulletList') ? 'bg-[#3b3a39] text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Bullets">
                  <List className="w-3.5 h-3.5 text-blue-400" />
                  <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-gray-400" />
                </button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 px-1.5 rounded flex items-center ${editor.isActive('orderedList') ? 'bg-[#3b3a39] text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Numbering">
                  <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                  <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-gray-400" />
                </button>
                <button onClick={() => editor.chain().focus().toggleTaskList().run()} className="p-1 px-1.5 rounded hover:bg-[#333333] text-blue-400" title="Checklist">
                  <ListTodo className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-1 px-1.5 rounded hover:bg-[#333333] text-gray-300" title="Decrease Indent">⇤</button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-1 px-1.5 rounded hover:bg-[#333333] text-gray-300" title="Increase Indent">⇥</button>
              </div>

              <div className="flex items-center gap-0.5">
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1 px-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#3b3a39] border border-gray-400 text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Align Left">
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1 px-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#3b3a39] border border-gray-400 text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Center">
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1 px-1.5 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-[#3b3a39] border border-gray-400 text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Align Right">
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1 px-1.5 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-[#3b3a39] border border-gray-400 text-white' : 'hover:bg-[#333333] text-gray-300'}`} title="Justify">
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button onClick={() => setShowSpacingPicker(!showSpacingPicker)} className="p-1 px-1.5 rounded hover:bg-[#333333] flex items-center text-blue-400" title="Line Spacing">
                    ↕ <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-gray-400" />
                  </button>
                  {showSpacingPicker && (
                    <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-xl rounded py-1 z-50 w-28 text-xs text-gray-200">
                      {['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map((val) => (
                        <button key={val} onClick={() => { (editor.chain().focus() as any).setLineHeight(val).run(); setShowSpacingPicker(false); }} className="w-full text-left px-3 py-1 hover:bg-[#333333]">
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Paragraph ⬚</span>
            </div>

            {/* Styles Gallery */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className="w-20 h-11 bg-white rounded-xs border border-gray-300 shadow-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all text-black">
                  <span className="font-serif italic text-xs">Emphasis</span>
                </button>
                <button onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()} className="w-24 h-11 bg-white rounded-xs border border-gray-300 shadow-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all text-[#1f497d]">
                  <span className="font-semibold text-xs">Heading 3</span>
                </button>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className="w-20 h-11 bg-white rounded-xs border border-gray-300 shadow-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all text-black">
                  <span className="font-bold text-xs">Strong</span>
                </button>
                <button onClick={() => editor.chain().focus().setColor('#7f7f7f').run()} className="w-20 h-11 bg-white rounded-xs border border-gray-300 shadow-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all text-[#7f7f7f]">
                  <span className="text-xs">Subtitle</span>
                </button>
                <button onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()} className="w-20 h-11 bg-white rounded-xs border border-gray-300 shadow-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all text-black">
                  <span className="font-serif text-lg font-normal">Title</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Styles ⬚</span>
            </div>

            {/* Editing */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex flex-col gap-0.5 text-[11px] text-gray-200">
                <button onClick={() => onOpenFindReplace('find')} className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-[#333333] rounded">
                  <Search className="w-3 h-3 text-blue-400" />
                  <span>Find</span>
                </button>
                <button onClick={() => onOpenFindReplace('replace')} className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-[#333333] rounded">
                  <Replace className="w-3 h-3 text-purple-400" />
                  <span>Replace</span>
                </button>
                <button onClick={() => editor.chain().focus().selectAll().run()} className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-[#333333] rounded">
                  <MousePointer className="w-3 h-3 text-emerald-400" />
                  <span>Select</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Editing ⬚</span>
            </div>

            {/* Acrobat */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <button onClick={onExportPdf} className="flex flex-col items-center justify-center p-1 px-3 hover:bg-[#333333] rounded text-gray-200" title="Create PDF">
                <Printer className="w-6 h-6 text-rose-500" />
                <span className="text-[10px] font-normal mt-0.5 text-center leading-tight">Create<br />a PDF</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Adobe Acrobat</span>
            </div>
          </>
        )}

        {/* ======================= 2. INSERT TAB (MATCHING SCREENSHOT 0) ======================= */}
        {activeTab === 'insert' && (
          <>
            {/* Pages */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button onClick={handleInsertCoverPage} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400" title="Insert Cover Page">
                  <FilePlus className="w-5 h-5" />
                  <span className="text-[10px]">Cover Page</span>
                </button>
                <button
                  onClick={() => {
                    if (!editor) return;
                    if ((editor.commands as any).setPageBreak) {
                      (editor.commands as any).setPageBreak();
                    } else {
                      editor.chain().focus().insertContent('<div data-type="page-break" class="word-manual-page-break"></div>').run();
                    }
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-gray-300"
                  title="Page Break (Ctrl+Enter)"
                >
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px]">Page Break</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Pages</span>
            </div>

            {/* Tables */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a] relative">
              <button onClick={() => setShowTablePicker(!showTablePicker)} className="p-1 px-3 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400">
                <TableIcon className="w-5 h-5" />
                <span className="text-[10px]">Table</span>
              </button>
              {showTablePicker && (
                <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-3 z-50 w-48 text-gray-200">
                  <div className="text-xs font-semibold mb-2">Insert Table</div>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const r = Math.floor(idx / 5) + 1;
                      const c = (idx % 5) + 1;
                      const isHovered = r <= tableGrid.rows && c <= tableGrid.cols;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setTableGrid({ rows: r, cols: c })}
                          onClick={() => handleInsertTable(r, c)}
                          className={`w-5 h-5 border rounded-2xs cursor-pointer ${isHovered ? 'bg-blue-600 border-blue-400' : 'bg-[#333333] border-gray-600'}`}
                        />
                      );
                    })}
                  </div>
                  <button onClick={() => handleInsertTable(tableGrid.rows, tableGrid.cols)} className="w-full py-1 bg-[#0078d4] text-white text-xs rounded hover:bg-blue-600">
                    Insert {tableGrid.rows}x{tableGrid.cols}
                  </button>
                </div>
              )}
              <span className="text-[10px] text-gray-400 text-center font-normal">Tables</span>
            </div>

            {/* Illustrations */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                {/* PICTURES - Fully wired to ImageInsertModal */}
                <button
                  onClick={onOpenImageModal}
                  className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-emerald-400 group"
                  title="Insert Pictures (From Computer or Web)"
                >
                  <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold">Pictures</span>
                </button>
                <button onClick={handleInsertTextBox} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400" title="Insert Callout Shape">
                  <PlusSquare className="w-5 h-5" />
                  <span className="text-[10px]">Shapes</span>
                </button>
                <button onClick={handleInsertTableOfContents} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-cyan-400" title="Generate Table of Figures">
                  <PieChart className="w-5 h-5" />
                  <span className="text-[10px]">Chart</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Illustrations</span>
            </div>

            {/* Links & Comments */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const url = prompt('Enter Link URL:');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span className="text-[10px]">Link</span>
                </button>
                <button
                  onClick={() => alert('Comment added at current selection.')}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px]">Comment</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Links & Comments</span>
            </div>

            {/* Header & Footer */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                {/* Header Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowHeaderPicker(!showHeaderPicker);
                      setShowFooterPicker(false);
                      setShowPageNumPicker(false);
                    }}
                    className={`p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center group transition-colors ${
                      pageSettings.showHeader ? 'text-blue-400 bg-[#2d3748]' : 'text-gray-200 hover:text-white'
                    }`}
                    title="Insert or customize page Header"
                  >
                    <PanelTop className="w-5 h-5 text-blue-400" />
                    <span className="text-[10px] flex items-center gap-0.5">
                      Header <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </button>
                  {showHeaderPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-2 z-50 w-64 text-gray-200">
                      <div className="text-xs font-semibold px-2 py-1 border-b border-[#3e3e42] mb-1 flex items-center justify-between">
                        <span>Header</span>
                        {pageSettings.showHeader && (
                          <span className="text-[10px] text-emerald-400 font-normal">Active</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const val = prompt('Enter Header Text:', pageSettings.headerText || documentTitle || '');
                          if (val !== null) {
                            onPageSettingsChange({
                              ...pageSettings,
                              showHeader: val.trim().length > 0,
                              headerText: val
                            });
                          }
                          setShowHeaderPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">✏️ Edit / Custom Header...</span>
                        <span className="text-[10px] text-gray-400">Type custom header text</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            showHeader: true,
                            headerText: documentTitle || 'Word AI Studio Document'
                          });
                          setShowHeaderPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">📄 Document Title</span>
                        <span className="text-[10px] text-gray-400">"{documentTitle || 'Document'}"</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            showHeader: true,
                            headerText: '21EE511 – ENGINEERING EXPLORATION V'
                          });
                          setShowHeaderPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">🎓 Academic / Course Header</span>
                        <span className="text-[10px] text-gray-400">21EE511 – ENGINEERING EXPLORATION V</span>
                      </button>
                      {pageSettings.showHeader && (
                        <div className="border-t border-[#3e3e42] mt-1 pt-1">
                          <button
                            onClick={() => {
                              onPageSettingsChange({
                                ...pageSettings,
                                showHeader: false,
                                headerText: ''
                              });
                              setShowHeaderPicker(false);
                            }}
                            className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded font-medium"
                          >
                            🗑️ Remove Header
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFooterPicker(!showFooterPicker);
                      setShowHeaderPicker(false);
                      setShowPageNumPicker(false);
                    }}
                    className={`p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center group transition-colors ${
                      pageSettings.showFooter ? 'text-teal-400 bg-[#2d3748]' : 'text-gray-200 hover:text-white'
                    }`}
                    title="Insert or customize page Footer"
                  >
                    <PanelBottom className="w-5 h-5 text-teal-400" />
                    <span className="text-[10px] flex items-center gap-0.5">
                      Footer <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </button>
                  {showFooterPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-2 z-50 w-64 text-gray-200">
                      <div className="text-xs font-semibold px-2 py-1 border-b border-[#3e3e42] mb-1 flex items-center justify-between">
                        <span>Footer</span>
                        {pageSettings.showFooter && (
                          <span className="text-[10px] text-emerald-400 font-normal">Active</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const val = prompt('Enter Footer Text:', pageSettings.footerText || '');
                          if (val !== null) {
                            onPageSettingsChange({
                              ...pageSettings,
                              showFooter: val.trim().length > 0,
                              footerText: val
                            });
                          }
                          setShowFooterPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">✏️ Edit / Custom Footer...</span>
                        <span className="text-[10px] text-gray-400">Type custom footer text</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            showFooter: true,
                            footerText: 'SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY'
                          });
                          setShowFooterPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">🏛️ Institute / College</span>
                        <span className="text-[10px] text-gray-400">Sri Shakthi Inst. of Eng & Tech</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            showFooter: true,
                            footerText: 'ANNA UNIVERSITY: CHENNAI 600025'
                          });
                          setShowFooterPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">🎓 University Affiliation</span>
                        <span className="text-[10px] text-gray-400">ANNA UNIVERSITY: CHENNAI 600025</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            showFooter: true,
                            footerText: 'CONFIDENTIAL & PROPRIETARY'
                          });
                          setShowFooterPicker(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-[#0078d4] hover:text-white rounded flex flex-col"
                      >
                        <span className="font-medium">🔒 Confidentiality</span>
                        <span className="text-[10px] text-gray-400">CONFIDENTIAL & PROPRIETARY</span>
                      </button>
                      {pageSettings.showFooter && (
                        <div className="border-t border-[#3e3e42] mt-1 pt-1">
                          <button
                            onClick={() => {
                              onPageSettingsChange({
                                ...pageSettings,
                                showFooter: false,
                                footerText: ''
                              });
                              setShowFooterPicker(false);
                            }}
                            className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded font-medium"
                          >
                            🗑️ Remove Footer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Page Number Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPageNumPicker(!showPageNumPicker);
                      setShowHeaderPicker(false);
                      setShowFooterPicker(false);
                    }}
                    className={`p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center group transition-colors ${
                      pageSettings.pageNumberPosition && pageSettings.pageNumberPosition !== 'none'
                        ? 'text-indigo-400 bg-[#2d3748]'
                        : 'text-gray-200 hover:text-white'
                    }`}
                    title="Insert Page Numbers"
                  >
                    <Hash className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] flex items-center gap-0.5">
                      Page # <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </button>
                  {showPageNumPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-2 z-50 w-56 text-gray-200">
                      <div className="text-xs font-semibold px-2 py-1 border-b border-[#3e3e42] mb-1 flex items-center justify-between">
                        <span>Page Number</span>
                        {pageSettings.pageNumberPosition && pageSettings.pageNumberPosition !== 'none' && (
                          <span className="text-[10px] text-emerald-400 font-normal">Active</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            pageNumberPosition: 'bottom-right',
                            showFooter: true
                          });
                          setShowPageNumPicker(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center justify-between ${
                          pageSettings.pageNumberPosition === 'bottom-right'
                            ? 'bg-[#0078d4] text-white'
                            : 'hover:bg-[#333333]'
                        }`}
                      >
                        <span>Bottom of Page (Right)</span>
                        <span className="text-[10px] opacity-75">Page 1</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            pageNumberPosition: 'bottom-center',
                            showFooter: true
                          });
                          setShowPageNumPicker(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center justify-between ${
                          pageSettings.pageNumberPosition === 'bottom-center'
                            ? 'bg-[#0078d4] text-white'
                            : 'hover:bg-[#333333]'
                        }`}
                      >
                        <span>Bottom of Page (Center)</span>
                        <span className="text-[10px] opacity-75">- 1 -</span>
                      </button>
                      <button
                        onClick={() => {
                          onPageSettingsChange({
                            ...pageSettings,
                            pageNumberPosition: 'top-right',
                            showHeader: true
                          });
                          setShowPageNumPicker(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center justify-between ${
                          pageSettings.pageNumberPosition === 'top-right'
                            ? 'bg-[#0078d4] text-white'
                            : 'hover:bg-[#333333]'
                        }`}
                      >
                        <span>Top of Page (Right)</span>
                        <span className="text-[10px] opacity-75">Page 1</span>
                      </button>
                      {pageSettings.pageNumberPosition && pageSettings.pageNumberPosition !== 'none' && (
                        <div className="border-t border-[#3e3e42] mt-1 pt-1">
                          <button
                            onClick={() => {
                              onPageSettingsChange({
                                ...pageSettings,
                                pageNumberPosition: 'none'
                              });
                              setShowPageNumPicker(false);
                            }}
                            className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded font-medium"
                          >
                            🗑️ Remove Page Numbers
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Header & Footer</span>
            </div>

            {/* Text Elements */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button onClick={handleInsertTextBox} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-purple-400" title="Text Box">
                  <Type className="w-5 h-5" />
                  <span className="text-[10px]">Text Box</span>
                </button>
                <button onClick={handleInsertWordArt} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-pink-400" title="WordArt">
                  <span className="w-5 h-5 font-black text-sm text-pink-400 flex items-center justify-center">A</span>
                  <span className="text-[10px]">WordArt</span>
                </button>
                <button
                  onClick={() => {
                    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    editor.chain().focus().insertContent(` ${today} `).run();
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-emerald-400"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-[10px]">Date & Time</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Text</span>
            </div>

            {/* Symbols */}
            <div className="flex flex-col justify-between pr-2.5">
              <button onClick={onOpenSymbolsModal} className="p-1 px-3 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400" title="Insert Math / Currency Symbols">
                <span className="w-5 h-5 text-base font-serif flex items-center justify-center">Ω</span>
                <span className="text-[10px]">Symbol</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Symbols</span>
            </div>
          </>
        )}

        {/* ======================= 3. DESIGN TAB (MATCHING SCREENSHOT 1) ======================= */}
        {activeTab === 'design' && (
          <>
            {/* Document Formatting Themes */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleApplyTheme('Office Blue', '#0078d4', 'Calibri')} className="w-20 h-11 bg-white rounded-xs border border-gray-300 p-1 text-black flex flex-col justify-between hover:ring-2 hover:ring-blue-400">
                  <span className="font-bold text-[10px] text-blue-700">TITLE</span>
                  <span className="text-[8px] text-gray-600">Heading 1</span>
                </button>
                <button onClick={() => handleApplyTheme('Executive Slate', '#2b579a', "'Times New Roman'")} className="w-20 h-11 bg-white rounded-xs border border-gray-300 p-1 text-black flex flex-col justify-between hover:ring-2 hover:ring-blue-400">
                  <span className="font-serif font-bold text-[10px] text-navy-800">TITLE</span>
                  <span className="font-serif text-[8px] text-gray-700">Heading 1</span>
                </button>
                <button onClick={() => handleApplyTheme('Emerald Report', '#107c41', 'Georgia')} className="w-20 h-11 bg-white rounded-xs border border-gray-300 p-1 text-black flex flex-col justify-between hover:ring-2 hover:ring-blue-400">
                  <span className="font-serif font-bold text-[10px] text-emerald-800">TITLE</span>
                  <span className="text-[8px] text-emerald-600">Heading 1</span>
                </button>
                <button onClick={() => handleApplyTheme('Modern Crimson', '#d83b01', "'Segoe UI'")} className="w-20 h-11 bg-white rounded-xs border border-gray-300 p-1 text-black flex flex-col justify-between hover:ring-2 hover:ring-blue-400">
                  <span className="font-sans font-bold text-[10px] text-rose-700">TITLE</span>
                  <span className="text-[8px] text-rose-600">Heading 1</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Document Formatting</span>
            </div>

            {/* Page Background (Watermark, Page Color, Page Borders) */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a] relative">
              <div className="flex items-center gap-2">
                {/* Watermark */}
                <div className="relative">
                  <button onClick={() => setShowWatermarkPicker(!showWatermarkPicker)} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-rose-400" title="Watermark">
                    <Stamp className="w-5 h-5" />
                    <span className="text-[10px]">Watermark</span>
                  </button>
                  {showWatermarkPicker && (
                    <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-2 z-50 w-36 text-xs text-gray-200">
                      {['none', 'DRAFT', 'CONFIDENTIAL', 'URGENT'].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            onPageSettingsChange({ ...pageSettings, watermark: w as any });
                            setShowWatermarkPicker(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#333333] rounded"
                        >
                          {w === 'none' ? 'No Watermark' : w}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Color */}
                <div className="relative">
                  <button onClick={() => setShowPageColorPicker(!showPageColorPicker)} className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400" title="Page Color">
                    <Palette className="w-5 h-5" />
                    <span className="text-[10px]">Page Color</span>
                  </button>
                  {showPageColorPicker && (
                    <div className="absolute top-full left-0 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-2 z-50 w-36 text-xs text-gray-200 space-y-1">
                      {[
                        { label: 'White', color: '#ffffff' },
                        { label: 'Cream / Ivory', color: '#fcfbf7' },
                        { label: 'Soft Mint', color: '#f0fdf4' },
                        { label: 'Light Azure', color: '#f0f9ff' },
                        { label: 'Dark Paper', color: '#252526' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            onPageSettingsChange({ ...pageSettings, pageColor: item.color });
                            setShowPageColorPicker(false);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-[#333333] rounded flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: item.color }} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Borders */}
                <button
                  onClick={() => {
                    const next = pageSettings.pageBorder === 'box' ? 'double' : pageSettings.pageBorder === 'double' ? 'none' : 'box';
                    onPageSettingsChange({ ...pageSettings, pageBorder: next as any });
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-purple-400"
                  title="Toggle Page Border"
                >
                  <Layers className="w-5 h-5" />
                  <span className="text-[10px]">Borders: {pageSettings.pageBorder || 'none'}</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Page Background</span>
            </div>
          </>
        )}

        {/* ======================= 4. LAYOUT TAB (MATCHING SCREENSHOT 2) ======================= */}
        {activeTab === 'layout' && (
          <>
            {/* Page Setup */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                {(['normal', 'narrow', 'wide'] as PageMargins[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => onPageSettingsChange({ ...pageSettings, margins: m })}
                    className={`px-2 py-1 rounded text-xs capitalize ${pageSettings.margins === m ? 'bg-[#0078d4] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'}`}
                  >
                    {m}
                  </button>
                ))}
                <div className="h-5 w-px bg-gray-600 mx-1" />
                {(['portrait', 'landscape'] as PageOrientation[]).map((ori) => (
                  <button
                    key={ori}
                    onClick={() => onPageSettingsChange({ ...pageSettings, orientation: ori })}
                    className={`px-2 py-1 rounded text-xs capitalize ${pageSettings.orientation === ori ? 'bg-[#0078d4] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'}`}
                  >
                    {ori}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Page Setup</span>
            </div>

            {/* Columns */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageSettingsChange({ ...pageSettings, columns: 1 })}
                  className={`px-2.5 py-1 rounded text-xs ${pageSettings.columns === 1 || !pageSettings.columns ? 'bg-[#0078d4] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'}`}
                >
                  1 Column
                </button>
                <button
                  onClick={() => onPageSettingsChange({ ...pageSettings, columns: 2 })}
                  className={`px-2.5 py-1 rounded text-xs ${pageSettings.columns === 2 ? 'bg-[#0078d4] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'}`}
                >
                  2 Columns
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Columns</span>
            </div>
          </>
        )}

        {/* ======================= 5. REFERENCES TAB (MATCHING SCREENSHOT 3) ======================= */}
        {activeTab === 'references' && (
          <>
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <button onClick={handleInsertTableOfContents} className="p-1 px-3 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400">
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-bold">Table of Contents</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Table of Contents</span>
            </div>

            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button onClick={handleInsertFootnote} className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-purple-400">
                  <span className="font-bold text-xs">ab¹</span>
                  <span className="text-[10px]">Insert Footnote</span>
                </button>
                <button onClick={handleInsertCitation} className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-emerald-400">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-[10px]">Insert Citation</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Citations & Footnotes</span>
            </div>
          </>
        )}

        {/* ======================= 6. MAILINGS TAB (MATCHING SCREENSHOT 4) ======================= */}
        {activeTab === 'mailings' && (
          <>
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const recipient = prompt('Enter Recipient Name:', 'Valued Stakeholder');
                    if (recipient) {
                      editor.chain().focus().insertContent(`<p>Dear ${recipient},</p><p>We are pleased to provide this personalized memorandum regarding your account deliverables.</p>`).run();
                    }
                  }}
                  className="p-1 px-3 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Start Mail Merge</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().insertContent(' «Full_Name», «Company» ').run();
                  }}
                  className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-gray-200"
                >
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px]">Insert Merge Field</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Mail Merge</span>
            </div>
          </>
        )}

        {/* ======================= 7. REVIEW TAB (MATCHING SCREENSHOT 5) ======================= */}
        {activeTab === 'review' && (
          <>
            {/* Proofing */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button onClick={onToggleProofreading} className={`p-1 px-2.5 rounded flex flex-col items-center text-emerald-400 ${isProofreadingOpen ? 'bg-[#333333]' : 'hover:bg-[#333333]'}`}>
                  <SpellCheck className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Spelling & Grammar</span>
                </button>

                {/* Thesaurus - Fully wired */}
                <button onClick={onOpenThesaurusModal} className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-purple-400">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px]">Thesaurus</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Proofing</span>
            </div>

            {/* Speech */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <button onClick={handleReadAloud} className={`p-1 px-3 rounded flex flex-col items-center transition-colors ${isReadingAloud ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'hover:bg-[#333333] text-blue-400'}`}>
                <Volume2 className="w-5 h-5" />
                <span className="text-[10px] font-bold">{isReadingAloud ? 'Stop Reading' : 'Read Aloud'}</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Speech</span>
            </div>

            {/* Language / Translation - Fully wired */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <button onClick={onOpenTranslateModal} className="p-1 px-3 hover:bg-[#333333] rounded flex flex-col items-center text-cyan-400">
                <Languages className="w-5 h-5" />
                <span className="text-[10px] font-bold">Translate</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Language</span>
            </div>
          </>
        )}

        {/* ======================= 8. VIEW TAB ======================= */}
        {activeTab === 'view' && (
          <>
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button onClick={onToggleFocusMode} className={`p-1 px-2.5 rounded flex flex-col items-center ${isFocusMode ? 'bg-[#3b3a39] text-white' : 'hover:bg-[#333333] text-gray-200'}`}>
                  <Maximize2 className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px]">Focus</span>
                </button>
                <button onClick={() => onPageSettingsChange({ ...pageSettings, isDarkMode: !pageSettings.isDarkMode })} className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-gray-200">
                  <Moon className="w-5 h-5 text-amber-300" />
                  <span className="text-[10px]">Switch Modes</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Views</span>
            </div>

            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex flex-col gap-1 text-[11px] text-gray-200 select-none">
                <label className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1 hover:bg-[#333333] rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={showRuler}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleRuler();
                    }}
                    className="accent-[#0078d4] rounded w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Ruler</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1 hover:bg-[#333333] rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={showGridlines}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleGridlines();
                    }}
                    className="accent-[#0078d4] rounded w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Gridlines</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1 hover:bg-[#333333] rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={isNavigationOpen}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleNavigation();
                    }}
                    className="accent-[#0078d4] rounded w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Navigation Pane</span>
                </label>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Show</span>
            </div>

            {/* Zoom Controls (Matching Word 365 View Tab) */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageSettingsChange({ ...pageSettings, zoom: 70 })}
                  className={`p-1 px-2.5 rounded flex flex-col items-center transition-colors ${
                    pageSettings.zoom === 70 ? 'bg-[#3b3a39] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'
                  }`}
                  title="One Page (70%): Fits entire page on screen matching document preview"
                >
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px]">One Page</span>
                </button>
                <button
                  onClick={() => onPageSettingsChange({ ...pageSettings, zoom: 100 })}
                  className={`p-1 px-2 rounded flex flex-col items-center transition-colors ${
                    pageSettings.zoom === 100 ? 'bg-[#3b3a39] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'
                  }`}
                  title="100% Zoom (Actual Size)"
                >
                  <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-amber-300">100</span>
                  <span className="text-[10px]">100%</span>
                </button>
                <button
                  onClick={() => onPageSettingsChange({ ...pageSettings, zoom: 120 })}
                  className={`p-1 px-2 rounded flex flex-col items-center transition-colors ${
                    pageSettings.zoom === 120 ? 'bg-[#3b3a39] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'
                  }`}
                  title="Page Width (120%)"
                >
                  <Maximize2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px]">Page Width</span>
                </button>
                <button
                  onClick={() => onPageSettingsChange({ ...pageSettings, zoom: 55 })}
                  className={`p-1 px-2 rounded flex flex-col items-center transition-colors ${
                    pageSettings.zoom === 55 ? 'bg-[#3b3a39] text-white font-bold' : 'hover:bg-[#333333] text-gray-200'
                  }`}
                  title="Multiple Pages (55%)"
                >
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px]">Multiple Pages</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Zoom</span>
            </div>
          </>
        )}

        {/* ======================= 9. ACROBAT TAB ======================= */}
        {activeTab === 'acrobat' && (
          <div className="flex items-center gap-3">
            <button onClick={onExportPdf} className="p-2 px-4 bg-[#2b2b2b] hover:bg-[#333333] rounded-lg border border-[#444444] flex items-center gap-2 text-rose-400 font-bold">
              <Printer className="w-5 h-5" />
              <span>Convert to Adobe PDF</span>
            </button>
          </div>
        )}

        {/* ======================= 10. AI COPILOT TAB ======================= */}
        {activeTab === 'copilot' && (
          <div className="flex items-center gap-2">
            <button onClick={onOpenInlineAi} className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-xs hover:brightness-110">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <div className="text-left">
                <div className="font-bold text-xs">Inline AI (Ctrl+K)</div>
                <div className="text-[10px] text-blue-100">Edit selection directly</div>
              </div>
            </button>
            <button onClick={onToggleCopilot} className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${isCopilotOpen ? 'bg-[#0078d4] text-white border-blue-400 font-bold' : 'bg-[#2b2b2b] border-[#444444] text-white'}`}>
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">🤖</div>
              <div className="text-left">
                <div className="font-semibold text-xs">Copilot Sidebar</div>
                <div className="text-[10px] text-gray-400">Ask & Modify Doc</div>
              </div>
            </button>
            <button onClick={onOpenSettings} className="px-3 py-2 bg-[#2b2b2b] border border-[#444444] hover:bg-[#333333] text-gray-200 rounded-lg flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-xs">AI Settings</span>
            </button>
          </div>
        )}

        {/* ======================= 11. PICTURE FORMAT TAB (MATCHES SCREENSHOT) ======================= */}
        {activeTab === 'pictureFormat' && (
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {/* Adjust Group */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('image', {
                      filter: 'brightness(130%) contrast(105%)'
                    }).run();
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400"
                  title="Corrections: High Brightness"
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-[10px]">Brightness</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('image', {
                      filter: 'contrast(150%)'
                    }).run();
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400"
                  title="Corrections: High Contrast"
                >
                  <Contrast className="w-4 h-4" />
                  <span className="text-[10px]">Contrast</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      editor.chain().focus().updateAttributes('image', {
                        filter: 'grayscale(100%)'
                      }).run();
                    }}
                    className="px-1.5 py-0.5 text-[10px] hover:bg-[#333333] rounded text-gray-300 text-left"
                    title="Grayscale"
                  >
                    B&W
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().updateAttributes('image', {
                        filter: 'sepia(80%)'
                      }).run();
                    }}
                    className="px-1.5 py-0.5 text-[10px] hover:bg-[#333333] rounded text-amber-300 text-left"
                    title="Sepia"
                  >
                    Sepia
                  </button>
                </div>
                <button
                  onClick={() => {
                    editor.chain().focus().updateAttributes('image', {
                      filter: '',
                      frameStyle: 'none',
                      width: null,
                      height: null,
                      alignment: 'center'
                    }).run();
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-rose-400 ml-1"
                  title="Reset Picture to Default"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[10px]">Reset</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Adjust</span>
            </div>

            {/* Picture Styles / Frames Gallery */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                {/* None */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'none' }).run()}
                  className="w-8 h-8 rounded border border-gray-600 hover:border-blue-400 bg-[#333333] flex items-center justify-center text-[10px] text-gray-300 transition-transform hover:scale-105"
                  title="None / Borderless"
                >
                  None
                </button>

                {/* Simple White Frame */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'simple-frame' }).run()}
                  className="w-8 h-8 rounded border-2 border-white bg-blue-900/40 shadow-sm flex items-center justify-center text-[9px] text-white font-bold transition-transform hover:scale-105"
                  title="Simple White Frame"
                >
                  Frame
                </button>

                {/* Rounded Corners */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'rounded' }).run()}
                  className="w-8 h-8 rounded-lg border border-gray-500 bg-[#333333] flex items-center justify-center text-[9px] text-gray-200 transition-transform hover:scale-105"
                  title="Rounded Corners"
                >
                  Round
                </button>

                {/* Circle / Oval */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'circle' }).run()}
                  className="w-8 h-8 rounded-full border-2 border-blue-400 bg-blue-900/40 flex items-center justify-center text-[9px] text-blue-300 font-bold transition-transform hover:scale-105"
                  title="Circle / Oval"
                >
                  Oval
                </button>

                {/* Drop Shadow */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'shadow' }).run()}
                  className="w-8 h-8 rounded border border-gray-600 bg-gray-700 shadow-xl flex items-center justify-center text-[9px] text-gray-200 transition-transform hover:scale-105"
                  title="Drop Shadow"
                >
                  Shadow
                </button>

                {/* Metal Frame */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'metal' }).run()}
                  className="w-8 h-8 rounded border-4 border-slate-300 bg-slate-800 flex items-center justify-center text-[9px] text-slate-200 transition-transform hover:scale-105"
                  title="Metal Frame"
                >
                  Metal
                </button>

                {/* Soft Edge Glow */}
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { frameStyle: 'soft-edge' }).run()}
                  className="w-8 h-8 rounded-md border border-cyan-400/50 bg-cyan-900/30 shadow-[0_0_8px_rgba(6,182,212,0.6)] flex items-center justify-center text-[9px] text-cyan-300 transition-transform hover:scale-105"
                  title="Soft Edge Glow"
                >
                  Glow
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Picture Styles</span>
            </div>

            {/* Position & Move */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                {/* Nudge arrows */}
                <div className="grid grid-cols-3 gap-0.5 w-16">
                  <div />
                  <button
                    onClick={() => {
                      const cur = editor.getAttributes('image');
                      editor.chain().focus().updateAttributes('image', {
                        yOffset: (cur.yOffset || 0) - 20
                      }).run();
                    }}
                    className="p-1 bg-[#333333] hover:bg-blue-600 rounded flex items-center justify-center text-gray-200"
                    title="Nudge Up 20px"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <div />
                  <button
                    onClick={() => {
                      const cur = editor.getAttributes('image');
                      editor.chain().focus().updateAttributes('image', {
                        xOffset: (cur.xOffset || 0) - 20
                      }).run();
                    }}
                    className="p-1 bg-[#333333] hover:bg-blue-600 rounded flex items-center justify-center text-gray-200"
                    title="Nudge Left 20px"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().updateAttributes('image', {
                        xOffset: 0,
                        yOffset: 0
                      }).run();
                    }}
                    className="p-1 bg-[#333333] hover:bg-amber-600 rounded flex items-center justify-center text-amber-300"
                    title="Center / Reset Position"
                  >
                    <Move className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      const cur = editor.getAttributes('image');
                      editor.chain().focus().updateAttributes('image', {
                        xOffset: (cur.xOffset || 0) + 20
                      }).run();
                    }}
                    className="p-1 bg-[#333333] hover:bg-blue-600 rounded flex items-center justify-center text-gray-200"
                    title="Nudge Right 20px"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <div />
                  <button
                    onClick={() => {
                      const cur = editor.getAttributes('image');
                      editor.chain().focus().updateAttributes('image', {
                        yOffset: (cur.yOffset || 0) + 20
                      }).run();
                    }}
                    className="p-1 bg-[#333333] hover:bg-blue-600 rounded flex items-center justify-center text-gray-200"
                    title="Nudge Down 20px"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <div />
                </div>

                {/* Alignment */}
                <div className="flex flex-col gap-0.5 ml-1">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'left', xOffset: 0 }).run()}
                      className="p-1 hover:bg-[#333333] rounded text-gray-300"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'center', xOffset: 0 }).run()}
                      className="p-1 hover:bg-[#333333] rounded text-blue-400"
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'right', xOffset: 0 }).run()}
                      className="p-1 hover:bg-[#333333] rounded text-gray-300"
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => editor.chain().focus().updateAttributes('image', { wrapMode: 'infront' }).run()}
                    className="px-1.5 py-0.5 bg-[#0078d4]/30 hover:bg-[#0078d4] text-[9px] text-blue-200 rounded border border-blue-400/40 text-center"
                    title="Enable Free Float Mode (Drag anywhere across pages)"
                  >
                    Free Float
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Position & Nudge</span>
            </div>

            {/* Wrap Text Mode */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { wrapMode: 'inline', alignment: 'center' }).run()}
                  className="px-1.5 py-1 text-[10px] hover:bg-[#333333] rounded text-gray-200 border border-gray-600 text-left"
                  title="In Line with Text"
                >
                  In Line
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { wrapMode: 'square', alignment: 'float-left' }).run()}
                  className="px-1.5 py-1 text-[10px] hover:bg-[#333333] rounded text-gray-200 border border-gray-600 text-left"
                  title="Square: Float Left with Text Wrap"
                >
                  Square L
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { wrapMode: 'infront' }).run()}
                  className="px-1.5 py-1 text-[10px] hover:bg-[#0078d4] rounded text-blue-200 border border-blue-500 text-left font-semibold"
                  title="In Front of Text: Free Floating"
                >
                  In Front
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { wrapMode: 'behind' }).run()}
                  className="px-1.5 py-1 text-[10px] hover:bg-[#333333] rounded text-gray-200 border border-gray-600 text-left"
                  title="Behind Text"
                >
                  Behind
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Wrap Text</span>
            </div>

            {/* Rotate & Flip */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const cur = editor.getAttributes('image');
                    const next = ((cur.rotation || 0) + 90) % 360;
                    editor.chain().focus().updateAttributes('image', { rotation: next }).run();
                  }}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-cyan-400"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[10px]">+90°</span>
                </button>
                <button
                  onClick={() => {
                    const cur = editor.getAttributes('image');
                    let next = ((cur.rotation || 0) - 90) % 360;
                    if (next < 0) next += 360;
                    editor.chain().focus().updateAttributes('image', { rotation: next }).run();
                  }}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-cyan-400"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[10px]">-90°</span>
                </button>
                <button
                  onClick={() => {
                    const cur = editor.getAttributes('image');
                    const currentFilter = cur.filter || '';
                    const hasFlip = currentFilter.includes('scaleX(-1)');
                    const newFilter = hasFlip
                      ? currentFilter.replace('scaleX(-1)', '').trim()
                      : `${currentFilter} scaleX(-1)`.trim();
                    editor.chain().focus().updateAttributes('image', { filter: newFilter }).run();
                  }}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-indigo-400"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="text-[10px]">Flip H</span>
                </button>
                <button
                  onClick={() => {
                    const cur = editor.getAttributes('image');
                    const currentFilter = cur.filter || '';
                    const hasFlip = currentFilter.includes('scaleY(-1)');
                    const newFilter = hasFlip
                      ? currentFilter.replace('scaleY(-1)', '').trim()
                      : `${currentFilter} scaleY(-1)`.trim();
                    editor.chain().focus().updateAttributes('image', { filter: newFilter }).run();
                  }}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-indigo-400"
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                  <span className="text-[10px]">Flip V</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Rotate & Flip</span>
            </div>

            {/* Size & Dimensions */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()}
                  className="px-1.5 py-1 text-xs hover:bg-[#333333] rounded text-gray-200 border border-gray-600"
                  title="25% Width"
                >
                  25%
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
                  className="px-1.5 py-1 text-xs hover:bg-[#333333] rounded text-gray-200 border border-gray-600"
                  title="50% Width"
                >
                  50%
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '75%' }).run()}
                  className="px-1.5 py-1 text-xs hover:bg-[#333333] rounded text-gray-200 border border-gray-600"
                  title="75% Width"
                >
                  75%
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
                  className="px-1.5 py-1 text-xs hover:bg-[#333333] rounded text-gray-200 border border-gray-600"
                  title="100% Full Width"
                >
                  100%
                </button>
                <button
                  onClick={() => {
                    const customWidth = prompt('Enter Image Width (e.g. 350px, 60%, 450px):', '400px');
                    if (customWidth) {
                      editor.chain().focus().updateAttributes('image', { width: customWidth }).run();
                    }
                  }}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-cyan-400"
                  title="Custom Image Width"
                >
                  <Crop className="w-4 h-4" />
                  <span className="text-[10px]">Custom</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Size</span>
            </div>

            {/* Delete Picture */}
            <div className="flex flex-col justify-between pr-2.5">
              <button
                onClick={() => editor.chain().focus().deleteSelection().run()}
                className="p-1 px-2.5 hover:bg-red-500/20 text-red-400 rounded flex flex-col items-center transition-colors"
                title="Delete Selected Picture"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px]">Delete</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Remove</span>
            </div>
          </div>
        )}

        {/* ======================= 12. TABLE DESIGN TAB ======================= */}
        {activeTab === 'tableDesign' && (
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {/* Table Style Options */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex flex-col gap-1 text-xs text-gray-200">
                <button
                  onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                  className="px-2 py-0.5 rounded hover:bg-[#333333] text-left flex items-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-xs bg-blue-500 flex items-center justify-center text-[9px] text-white">✓</span>
                  Header Row
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
                  className="px-2 py-0.5 rounded hover:bg-[#333333] text-left flex items-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-xs bg-blue-500 flex items-center justify-center text-[9px] text-white">✓</span>
                  First Column
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Table Options</span>
            </div>

            {/* Table Styles Gallery */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => editor.chain().focus().updateAttributes('table', { tableStyle: 'default' }).run()}
                  className="px-2.5 py-1.5 border border-gray-600 rounded bg-[#2b2b2b] hover:border-blue-400 text-xs text-gray-200 font-medium transition-transform hover:scale-105"
                  title="Plain Grid Table"
                >
                  Plain Grid
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('table', { tableStyle: 'blue-header' }).run()}
                  className="px-2.5 py-1.5 border-2 border-blue-500 rounded bg-blue-900/40 hover:border-blue-400 text-xs text-blue-200 font-bold transition-transform hover:scale-105"
                  title="Accent Blue Header Table"
                >
                  Blue Header
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('table', { tableStyle: 'dark-header' }).run()}
                  className="px-2.5 py-1.5 border border-slate-500 rounded bg-slate-800 hover:border-slate-300 text-xs text-slate-200 font-bold transition-transform hover:scale-105"
                  title="Dark Slate Header Table"
                >
                  Dark Slate
                </button>
                <button
                  onClick={() => editor.chain().focus().updateAttributes('table', { tableStyle: 'green-header' }).run()}
                  className="px-2.5 py-1.5 border-2 border-emerald-500 rounded bg-emerald-900/40 hover:border-emerald-400 text-xs text-emerald-200 font-bold transition-transform hover:scale-105"
                  title="Emerald Green Engineering Table"
                >
                  Engineering
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Table Styles</span>
            </div>

            {/* Cell Shading / Background Color */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a] relative">
              <button
                onClick={() => setShowCellColorPicker(!showCellColorPicker)}
                className="p-1 px-2.5 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400"
                title="Cell Shading Color"
              >
                <PaintBucket className="w-4 h-4" />
                <span className="text-[10px]">Shading</span>
              </button>
              {showCellColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3e3e42] shadow-2xl rounded p-2 z-50 w-44 text-gray-200">
                  <div className="text-xs font-semibold px-1 mb-1">Cell Color</div>
                  <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                    {[
                      { name: 'White', color: '#ffffff' },
                      { name: 'Light Gray', color: '#f3f4f6' },
                      { name: 'Soft Blue', color: '#dbeafe' },
                      { name: 'Soft Yellow', color: '#fef9c3' },
                      { name: 'Soft Green', color: '#dcfce7' },
                      { name: 'Soft Red', color: '#fee2e2' },
                      { name: 'Purple', color: '#f3e8ff' },
                      { name: 'Slate', color: '#334155' },
                      { name: 'Dark Navy', color: '#1e3a8a' },
                      { name: 'None', color: '' }
                    ].map((c) => (
                      <div
                        key={c.name}
                        onClick={() => {
                          editor.chain().focus().updateAttributes('tableCell', { backgroundColor: c.color }).run();
                          setShowCellColorPicker(false);
                        }}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c.color || 'transparent' }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().updateAttributes('tableCell', { backgroundColor: null }).run();
                      setShowCellColorPicker(false);
                    }}
                    className="w-full text-center py-1 text-[11px] text-gray-300 hover:bg-[#333333] rounded border border-gray-600"
                  >
                    No Color
                  </button>
                </div>
              )}
              <span className="text-[10px] text-gray-400 text-center font-normal">Shading</span>
            </div>

            {/* Delete Table */}
            <div className="flex flex-col justify-between pr-2.5">
              <button
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1 px-2.5 hover:bg-red-500/20 text-red-400 rounded flex flex-col items-center transition-colors"
                title="Delete Table"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px]">Delete Table</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center font-normal">Remove</span>
            </div>
          </div>
        )}

        {/* ======================= 13. TABLE LAYOUT TAB ======================= */}
        {activeTab === 'tableLayout' && (
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {/* Rows & Columns Group */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400"
                  title="Insert Row Above"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-[10px]">Row Above</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-blue-400"
                  title="Insert Row Below"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-[10px]">Row Below</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-emerald-400"
                  title="Insert Column Left"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-[10px]">Col Left</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-emerald-400"
                  title="Insert Column Right"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-[10px]">Col Right</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Rows & Columns</span>
            </div>

            {/* Delete Group */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="p-1 px-2 hover:bg-red-500/20 text-red-400 rounded flex flex-col items-center"
                  title="Delete Row"
                >
                  <Rows className="w-4 h-4" />
                  <span className="text-[10px]">Del Row</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="p-1 px-2 hover:bg-red-500/20 text-red-400 rounded flex flex-col items-center"
                  title="Delete Column"
                >
                  <Columns className="w-4 h-4" />
                  <span className="text-[10px]">Del Col</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Delete</span>
            </div>

            {/* Merge & Split */}
            <div className="flex flex-col justify-between pr-2.5 border-r border-[#3a3a3a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor.chain().focus().mergeCells().run()}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-amber-400"
                  title="Merge Selected Cells"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-[10px]">Merge</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().splitCell().run()}
                  className="p-1 px-2 hover:bg-[#333333] rounded flex flex-col items-center text-indigo-400"
                  title="Split Cells"
                >
                  <Grid className="w-4 h-4" />
                  <span className="text-[10px]">Split</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Merge & Split</span>
            </div>

            {/* Cell Alignment */}
            <div className="flex flex-col justify-between pr-2.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-gray-300"
                  title="Align Text Left"
                >
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-[10px]">Left</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-gray-300"
                  title="Align Text Center"
                >
                  <AlignCenter className="w-4 h-4" />
                  <span className="text-[10px]">Center</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className="p-1 px-1.5 hover:bg-[#333333] rounded flex flex-col items-center text-gray-300"
                  title="Align Text Right"
                >
                  <AlignRight className="w-4 h-4" />
                  <span className="text-[10px]">Right</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-400 text-center font-normal">Alignment</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
