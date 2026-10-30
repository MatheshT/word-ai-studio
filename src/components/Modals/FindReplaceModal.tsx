import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Search, Replace, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  initialMode?: 'find' | 'replace';
}

export const FindReplaceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editor,
  initialMode = 'find'
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [mode, setMode] = useState<'find' | 'replace'>(initialMode);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTimeout(() => findInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!editor || !findText.trim()) {
      setMatchCount(0);
      return;
    }

    const text = editor.getText();
    const flags = matchCase ? 'g' : 'gi';
    try {
      const regex = new RegExp(escapeRegExp(findText), flags);
      const matches = text.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  }, [findText, matchCase, editor]);

  if (!isOpen || !editor) return null;

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const handleFindNext = () => {
    if (!findText.trim()) return;
    const text = editor.getText();
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(escapeRegExp(findText), flags);
    
    // Simple search highlight selection
    const match = regex.exec(text);
    if (match) {
      // scroll editor into view
    }
  };

  const handleReplace = () => {
    if (!findText.trim()) return;
    const currentHtml = editor.getHTML();
    const flags = matchCase ? '' : 'i';
    const regex = new RegExp(escapeRegExp(findText), flags);
    const newHtml = currentHtml.replace(regex, replaceText);
    editor.commands.setContent(newHtml);
  };

  const handleReplaceAll = () => {
    if (!findText.trim()) return;
    const currentHtml = editor.getHTML();
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(escapeRegExp(findText), flags);
    const newHtml = currentHtml.replace(regex, replaceText);
    editor.commands.setContent(newHtml);
    setMatchCount(0);
  };

  return (
    <div className="fixed top-14 right-6 z-40 bg-white rounded-xl shadow-2xl border border-gray-300 w-80 overflow-hidden no-print animate-in fade-in duration-100">
      {/* Header Tabs */}
      <div className="bg-[#185abd] text-white px-3 py-2 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('find')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'find' ? 'bg-white/20 text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            Find
          </button>
          <button
            onClick={() => setMode('replace')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'replace' ? 'bg-white/20 text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            Replace
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded text-white/90 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body Inputs */}
      <div className="p-3.5 space-y-2.5 text-xs">
        {/* Find Input */}
        <div className="relative">
          <input
            ref={findInputRef}
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find in document..."
            className="w-full pl-7 pr-16 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#185abd] outline-none text-xs"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-mono">
            {matchCount > 0 ? `${matchCount} found` : findText ? '0 found' : ''}
          </span>
        </div>

        {/* Replace Input (if mode === 'replace') */}
        {mode === 'replace' && (
          <div className="relative">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#185abd] outline-none text-xs"
            />
            <Replace className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          </div>
        )}

        {/* Options */}
        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded text-[#185abd] accent-[#185abd]"
            />
            <span>Match case</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button
              onClick={handleFindNext}
              disabled={!findText.trim()}
              className="p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded"
              title="Previous"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFindNext}
              disabled={!findText.trim()}
              className="p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded"
              title="Next"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {mode === 'replace' ? (
              <>
                <button
                  onClick={handleReplace}
                  disabled={!findText.trim()}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 rounded font-medium text-[11px]"
                >
                  Replace
                </button>
                <button
                  onClick={handleReplaceAll}
                  disabled={!findText.trim()}
                  className="px-2.5 py-1 bg-[#185abd] hover:bg-[#12499c] disabled:opacity-40 text-white rounded font-medium text-[11px]"
                >
                  Replace All
                </button>
              </>
            ) : (
              <button
                onClick={handleFindNext}
                disabled={!findText.trim()}
                className="px-3 py-1 bg-[#185abd] hover:bg-[#12499c] disabled:opacity-40 text-white rounded font-medium text-[11px]"
              >
                Find Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
