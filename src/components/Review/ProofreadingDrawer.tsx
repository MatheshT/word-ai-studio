import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import type { ProofreadingIssue, DocumentAnalysis } from '../../types';
import {
  CheckCircle2,
  SpellCheck,
  X,
  RefreshCw,
  Check,
  Wand2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export const ProofreadingDrawer: React.FC<Props> = ({ isOpen, onClose, editor }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis>({
    readabilityScore: 88,
    readingLevel: 'Professional / College Level',
    tone: 'Executive & Formal',
    issues: [
      {
        id: 'issue-1',
        type: 'clarity',
        originalText: 'in light of strategic assessments',
        suggestion: 'based on our strategic review',
        explanation: 'Simplified phrasing improves sentence rhythm and reader comprehension.'
      },
      {
        id: 'issue-2',
        type: 'grammar',
        originalText: 'are accelerated by up to',
        suggestion: 'accelerates by up to',
        explanation: 'Active voice strengthens clarity and impact.'
      },
      {
        id: 'issue-3',
        type: 'spelling',
        originalText: 'interoperability',
        suggestion: 'interoperability',
        explanation: 'Verified spelling and technical lexicon.'
      }
    ]
  });

  if (!isOpen || !editor) return null;

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const handleApplyFix = (issue: ProofreadingIssue) => {
    const currentHtml = editor.getHTML();
    const newHtml = currentHtml.replace(issue.originalText, issue.suggestion);
    editor.commands.setContent(newHtml);
    setAnalysis(prev => ({
      ...prev,
      issues: prev.issues.filter(i => i.id !== issue.id)
    }));
  };

  const handleFixAll = () => {
    let currentHtml = editor.getHTML();
    for (const issue of analysis.issues) {
      currentHtml = currentHtml.replace(issue.originalText, issue.suggestion);
    }
    editor.commands.setContent(currentHtml);
    setAnalysis(prev => ({ ...prev, issues: [] }));
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-20 shrink-0 select-text no-print">
      {/* Header */}
      <div className="h-12 bg-[#185abd] text-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SpellCheck className="w-4 h-4 text-amber-300" />
          <h2 className="text-xs font-bold">AI Document Inspector</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded text-white/90 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Score Cards */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Document Health Score</span>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="text-[11px] text-[#185abd] hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            Rescan
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-800 text-base shadow-2xs">
            {analysis.readabilityScore}%
          </div>
          <div>
            <div className="text-xs font-bold text-gray-800">{analysis.tone}</div>
            <div className="text-[11px] text-gray-500">{analysis.readingLevel}</div>
          </div>
        </div>

        {analysis.issues.length > 0 && (
          <button
            onClick={handleFixAll}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Auto-Fix All {analysis.issues.length} Suggestions
          </button>
        )}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
          <span>Suggestions ({analysis.issues.length})</span>
        </div>

        {analysis.issues.length === 0 ? (
          <div className="p-6 text-center text-gray-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-semibold text-gray-700">All Clear!</div>
            <p className="text-[11px]">No spelling, grammar, or stylistic issues detected in your document.</p>
          </div>
        ) : (
          analysis.issues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  {issue.type}
                </span>
                <button
                  onClick={() => handleApplyFix(issue)}
                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-rose-600 line-through text-[11px]">
                  "{issue.originalText}"
                </div>
                <div className="text-emerald-700 font-semibold text-[11px]">
                  "{issue.suggestion}"
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-normal">
                {issue.explanation}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
