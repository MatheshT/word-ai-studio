import { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Ribbon } from './components/Ribbon/Ribbon';
import { DocumentEditor } from './components/Editor/DocumentEditor';
import { StatusBar } from './components/StatusBar/StatusBar';
import { AICopilotSidebar } from './components/AI/AICopilotSidebar';
import { InlineAIModal } from './components/AI/InlineAIModal';
import { AISettingsModal } from './components/Settings/AISettingsModal';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { FindReplaceModal } from './components/Modals/FindReplaceModal';
import { VersionHistoryModal } from './components/Modals/VersionHistoryModal';
import { ImageInsertModal } from './components/Modals/ImageInsertModal';
import { SymbolsModal } from './components/Modals/SymbolsModal';
import { ThesaurusModal } from './components/Modals/ThesaurusModal';
import { TranslateModal } from './components/Modals/TranslateModal';
import { NavigationPane } from './components/Navigation/NavigationPane';
import { ProofreadingDrawer } from './components/Review/ProofreadingDrawer';
import type {
  AISettings,
  DocumentStats,
  PageSettings,
  ActionProposal,
  Template,
  DocumentSnapshot
} from './types';
import { DEFAULT_AI_SETTINGS } from './services/aiService';
import { exportToDocx, exportToHtml, exportToMarkdown } from './utils/docxExport';
import { importDocxFile } from './utils/docxImport';

export function App() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('Document 1');
  const [selectedText, setSelectedText] = useState<string>('');
  
  // Drawer & Modal states
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(true);
  const [isNavigationOpen, setIsNavigationOpen] = useState<boolean>(false);
  const [isProofreadingOpen, setIsProofreadingOpen] = useState<boolean>(false);
  const [isInlineAiOpen, setIsInlineAiOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState<boolean>(false);
  const [findReplaceMode, setFindReplaceMode] = useState<'find' | 'replace'>('find');
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isSymbolsModalOpen, setIsSymbolsModalOpen] = useState<boolean>(false);
  const [isThesaurusModalOpen, setIsThesaurusModalOpen] = useState<boolean>(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showGridlines, setShowGridlines] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{ currentPage: number; totalPages: number }>({
    currentPage: 1,
    totalPages: 1
  });

  const handlePaginationChange = useCallback((info: { currentPage: number; totalPages: number }) => {
    setPagination((prev) => {
      if (prev.currentPage === info.currentPage && prev.totalPages === info.totalPages) {
        return prev;
      }
      return info;
    });
  }, []);

  // Version Snapshots
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>([]);
  const lastSnapshotTime = useRef<number>(Date.now());

  const [pageSettings, setPageSettings] = useState<PageSettings>({
    size: 'a4',
    orientation: 'portrait',
    margins: 'normal',
    zoom: 70,
    isDarkMode: false,
    watermark: 'none',
    columns: 1
  });

  const [stats, setStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    charactersWithoutSpaces: 0,
    paragraphs: 0,
    readingTimeMinutes: 1
  });

  // Persistent AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('word_ai_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_AI_SETTINGS;
  });

  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    try {
      localStorage.setItem('word_ai_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  // Document Operations
  const handleSaveDocx = useCallback(() => {
    if (!editor) return;
    exportToDocx(editor.getHTML(), documentTitle);
  }, [editor, documentTitle]);

  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  const handleExportHtml = useCallback(() => {
    if (!editor) return;
    exportToHtml(editor.getHTML(), documentTitle);
  }, [editor, documentTitle]);

  const handleExportMarkdown = useCallback(() => {
    if (!editor) return;
    exportToMarkdown(editor.getHTML(), documentTitle);
  }, [editor, documentTitle]);

  // Keyboard Shortcuts (Ctrl+K, Ctrl+S, Ctrl+P, Ctrl+F, Ctrl+H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsInlineAiOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveDocx();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleExportPdf();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindReplaceMode('find');
        setIsFindReplaceOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindReplaceMode('replace');
        setIsFindReplaceOpen(true);
      }
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, documentTitle, handleSaveDocx, handleExportPdf, isFocusMode]);

  const handleImportDocx = async (file: File) => {
    if (!editor) return;
    try {
      const html = await importDocxFile(file);
      editor.commands.setContent(html);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      createSnapshot(html, stats.words);
    } catch (err: any) {
      alert(`Could not import .docx file: ${err.message}`);
    }
  };

  const handleNewDocument = () => {
    if (!editor) return;
    if (confirm('Create a new blank document? Any unsaved changes will be cleared.')) {
      editor.commands.setContent('<h1>Untitled Document</h1><p>Start writing here...</p>');
      setDocumentTitle('Untitled Document');
      createSnapshot('<h1>Untitled Document</h1><p>Start writing here...</p>', 5);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    if (!editor) return;
    editor.commands.setContent(template.content);
    setDocumentTitle(template.name);
    createSnapshot(template.content, stats.words);
  };

  const createSnapshot = (html: string, wordCount: number) => {
    const newSnapshot: DocumentSnapshot = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      title: documentTitle,
      html,
      wordCount
    };
    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 19)]);
  };

  const handleAutoSaveSnapshot = (html: string, wordCount: number) => {
    const now = Date.now();
    if (now - lastSnapshotTime.current > 45000) {
      lastSnapshotTime.current = now;
      createSnapshot(html, wordCount);
    }
  };

  const handleRestoreSnapshot = (snapshot: DocumentSnapshot) => {
    if (!editor) return;
    editor.commands.setContent(snapshot.html);
  };

  // Inline AI Apply Action
  const handleApplyInlineChange = (newContent: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(newContent).run();
  };

  // Copilot Proposal Apply Action
  const handleApplyProposal = (proposal: ActionProposal) => {
    if (!editor) return;

    if (proposal.type === 'replace_selection' && selectedText) {
      editor.chain().focus().insertContent(proposal.newContent).run();
    } else if (proposal.type === 'append_section') {
      const currentHtml = editor.getHTML();
      editor.commands.setContent(`${currentHtml}${proposal.newContent}`);
    } else if (proposal.type === 'full_rewrite') {
      editor.commands.setContent(proposal.newContent);
    } else {
      editor.chain().focus().insertContent(proposal.newContent).run();
    }
  };

  // Image Insert Handler (Working seamlessly with Base64 & URLs)
  const handleInsertImage = (src: string, alt?: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src, alt: alt || 'Document Image' }).run();
  };

  // Symbol Insert Handler
  const handleInsertSymbol = (symbol: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(` ${symbol} `).run();
  };

  // Thesaurus Replace Handler
  const handleReplaceWord = (newWord: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(newWord).run();
  };

  // Translation Apply Handler
  const handleApplyTranslation = (translatedHtml: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(translatedHtml).run();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#e1dfdd]">
      {/* 1. Complete Microsoft Word Ribbon */}
      {!isFocusMode && (
        <Ribbon
          editor={editor}
          documentTitle={documentTitle}
          onTitleChange={setDocumentTitle}
          pageSettings={pageSettings}
          onPageSettingsChange={setPageSettings}
          onSaveDocx={handleSaveDocx}
          onExportPdf={handleExportPdf}
          onExportHtml={handleExportHtml}
          onExportMarkdown={handleExportMarkdown}
          onImportDocx={handleImportDocx}
          onNewDocument={handleNewDocument}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
          isCopilotOpen={isCopilotOpen}
          onOpenInlineAi={() => setIsInlineAiOpen(true)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenFindReplace={(m) => {
            setFindReplaceMode(m);
            setIsFindReplaceOpen(true);
          }}
          onToggleNavigation={() => setIsNavigationOpen(!isNavigationOpen)}
          isNavigationOpen={isNavigationOpen}
          onToggleProofreading={() => setIsProofreadingOpen(!isProofreadingOpen)}
          isProofreadingOpen={isProofreadingOpen}
          onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          showRuler={showRuler}
          onToggleRuler={() => setShowRuler(!showRuler)}
          showGridlines={showGridlines}
          onToggleGridlines={() => setShowGridlines(!showGridlines)}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenSymbolsModal={() => setIsSymbolsModalOpen(true)}
          onOpenThesaurusModal={() => setIsThesaurusModalOpen(true)}
          onOpenTranslateModal={() => setIsTranslateModalOpen(true)}
        />
      )}

      {/* 2. Main Workspace (Navigation Pane + Canvas + Copilot / Proofreader) */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isFocusMode && (
          <NavigationPane
            isOpen={isNavigationOpen}
            onClose={() => setIsNavigationOpen(false)}
            editor={editor}
            totalPages={pagination.totalPages}
          />
        )}

        <DocumentEditor
          onEditorReady={setEditor}
          documentTitle={documentTitle}
          pageSettings={pageSettings}
          onPageSettingsChange={setPageSettings}
          onStatsChange={setStats}
          onSelectionChange={setSelectedText}
          onAutoSaveSnapshot={handleAutoSaveSnapshot}
          onPaginationChange={handlePaginationChange}
          showRuler={showRuler}
          showGridlines={showGridlines}
        />

        {!isFocusMode && (
          <ProofreadingDrawer
            isOpen={isProofreadingOpen}
            onClose={() => setIsProofreadingOpen(false)}
            editor={editor}
          />
        )}

        {!isFocusMode && (
          <AICopilotSidebar
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            selectedText={selectedText}
            fullDocumentText={editor?.getText() || ''}
            aiSettings={aiSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onApplyProposal={handleApplyProposal}
          />
        )}
      </div>

      {/* 3. Word Status Bar */}
      {!isFocusMode && (
        <StatusBar
          stats={stats}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          zoom={pageSettings.zoom}
          onZoomChange={(zoom) => setPageSettings((prev) => ({ ...prev, zoom }))}
          aiSettings={aiSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 4. Modals */}
      <InlineAIModal
        isOpen={isInlineAiOpen}
        onClose={() => setIsInlineAiOpen(false)}
        selectedText={selectedText}
        fullDocumentText={editor?.getText() || ''}
        aiSettings={aiSettings}
        onApplyChange={handleApplyInlineChange}
      />

      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSave={handleSaveSettings}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <FindReplaceModal
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        editor={editor}
        initialMode={findReplaceMode}
      />

      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        snapshots={snapshots}
        onRestoreSnapshot={handleRestoreSnapshot}
      />

      {/* Image Insert Modal */}
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />

      {/* Symbols Modal */}
      <SymbolsModal
        isOpen={isSymbolsModalOpen}
        onClose={() => setIsSymbolsModalOpen(false)}
        onInsertSymbol={handleInsertSymbol}
      />

      {/* Thesaurus Modal */}
      <ThesaurusModal
        isOpen={isThesaurusModalOpen}
        onClose={() => setIsThesaurusModalOpen(false)}
        initialWord={selectedText || 'important'}
        onReplaceWord={handleReplaceWord}
      />

      {/* Translate Modal */}
      <TranslateModal
        isOpen={isTranslateModalOpen}
        onClose={() => setIsTranslateModalOpen(false)}
        selectedText={selectedText}
        fullDocumentText={editor?.getText() || ''}
        aiSettings={aiSettings}
        onApplyTranslation={handleApplyTranslation}
      />
    </div>
  );
}

export default App;
