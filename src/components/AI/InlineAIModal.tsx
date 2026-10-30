import React, { useState, useEffect, useRef } from 'react';
import type { AISettings } from '../../types';
import { AIService } from '../../services/aiService';
import {
  Sparkles,
  Check,
  X,
  RefreshCw,
  Wand2,
  CornerDownLeft
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  fullDocumentText: string;
  aiSettings: AISettings;
  onApplyChange: (newContent: string) => void;
}

export const InlineAIModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedText,
  fullDocumentText,
  aiSettings,
  onApplyChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'diff'>('preview');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setGeneratedOutput(null);
      setError(null);
      setViewMode(selectedText ? 'diff' : 'preview');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, selectedText]);

  if (!isOpen) return null;

  const handleGenerate = async (customInstruction?: string) => {
    const finalPrompt = customInstruction || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await AIService.executeInlineCommand(
        finalPrompt,
        selectedText,
        fullDocumentText,
        aiSettings
      );
      setGeneratedOutput(res.replacementText);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (generatedOutput !== null) {
      onApplyChange(generatedOutput);
      onClose();
    }
  };

  const quickActions = [
    { label: '✍️ Write Project Document', prompt: 'Write a comprehensive engineering project section with abstract, methodology, and parameters table' },
    { label: '✏️ Change This Content', prompt: 'Rewrite and elevate this content with technical rigor, clarity, and academic precision' },
    { label: '📊 Add Suitable Diagram', prompt: 'Add a suitable system architecture process flow block diagram for this project' },
    { label: '📐 Organize This Page', prompt: 'Organize this page into standard university engineering format with numbered headings and structured tables' },
    { label: '✨ Fix Grammar', prompt: 'Fix all grammar, typos, and punctuation while preserving the voice' },
    { label: '💼 Executive Tone', prompt: 'Rewrite in an executive, formal business tone' },
    { label: '✂️ Concise / Shorten', prompt: 'Condense into clear, concise sentences removing fluff' },
    { label: '📈 Expand & Elaborate', prompt: 'Elaborate on this with richer detail, context, and examples' },
    { label: '📋 Data Table', prompt: 'Organize this information into a clean structured table' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-2xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-blue-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#185abd] to-[#2b579a] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">
              Inline AI Assistant (Ctrl+K)
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
              {selectedText
                ? `${selectedText.split(/\s+/).filter(Boolean).length} words selected`
                : 'Generate at cursor'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 space-y-3">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  if (generatedOutput !== null) {
                    handleAccept();
                  } else {
                    handleGenerate();
                  }
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              placeholder={
                selectedText
                  ? "Instruct AI (e.g. 'Make it professional', 'Translate to German', 'Turn into bullets')..."
                  : "Ask AI to generate content (e.g. 'Write a project executive summary')..."
              }
              className="w-full pl-3 pr-24 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#185abd] focus:border-[#185abd] outline-none shadow-inner"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#185abd] hover:bg-[#12499c] disabled:opacity-50 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Generate</span>
                  <CornerDownLeft className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-gray-500 font-medium mr-1 flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-[#185abd]" /> Quick:
            </span>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(action.prompt);
                  handleGenerate(action.prompt);
                }}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60 rounded-full transition-colors font-medium"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Preview / Diff Area */}
          {generatedOutput !== null && (
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div className="bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Proposed Changes</span>
                  {selectedText && (
                    <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 text-[10px]">
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          viewMode === 'preview' ? 'bg-[#185abd] text-white font-semibold' : 'text-gray-600'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => setViewMode('diff')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          viewMode === 'diff' ? 'bg-[#185abd] text-white font-semibold' : 'text-gray-600'
                        }`}
                      >
                        Diff View
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  Ready to Apply
                </span>
              </div>

              {/* View Content */}
              <div className="p-4 text-xs text-gray-800 max-h-60 overflow-y-auto bg-white font-serif leading-relaxed">
                {viewMode === 'diff' && selectedText ? (
                  <div className="space-y-3 font-sans">
                    <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded text-rose-800">
                      <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                        - Original Text (To be replaced)
                      </div>
                      <div className="line-through opacity-80">{selectedText}</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded text-emerald-900">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        + Proposed AI Replacement
                      </div>
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedOutput }}
                        className="prose-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: generatedOutput }}
                    className="prose-xs max-w-none"
                  />
                )}
              </div>

              {/* Action Toolbar */}
              <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => handleGenerate()}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 rounded-md flex items-center gap-1.5 transition-colors font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept & Apply to Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
