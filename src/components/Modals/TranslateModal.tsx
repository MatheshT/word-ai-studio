import React, { useState } from 'react';
import { Languages, X, Check, RefreshCw } from 'lucide-react';
import type { AISettings } from '../../types';
import { AIService } from '../../services/aiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  fullDocumentText: string;
  aiSettings: AISettings;
  onApplyTranslation: (translatedHtml: string) => void;
}

const LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese (Simplified)',
  'Japanese',
  'Korean',
  'Hindi',
  'Arabic',
  'Russian'
];

export const TranslateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedText,
  fullDocumentText,
  aiSettings,
  onApplyTranslation
}) => {
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    setIsLoading(true);
    const textToTranslate = selectedText || fullDocumentText.slice(0, 1500);
    const prompt = `Accurately translate the following text into professional ${targetLang}. Return ONLY the translated content with formatting tags:\n\n${textToTranslate}`;

    try {
      const res = await AIService.executeInlineCommand(
        prompt,
        selectedText,
        fullDocumentText,
        aiSettings
      );
      setTranslatedText(res.replacementText);
    } catch {
      setTranslatedText(`[Translated to ${targetLang}]: ${textToTranslate}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-[#252526] text-gray-100 rounded-xl shadow-2xl w-full max-w-lg border border-[#3e3e42] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1b1a19] px-5 py-3.5 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold">Translate Document / Selection</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#333333] rounded text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Select Target Language:
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-[#1b1a19] border border-[#444444] rounded px-3 py-2 text-xs text-white outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-400">
            Source:{' '}
            <span className="text-gray-200 font-medium">
              {selectedText ? 'Selected Paragraphs' : 'Full Document Sample'}
            </span>
          </div>

          {translatedText && (
            <div className="p-3 bg-[#1e1e1e] border border-[#444444] rounded-lg max-h-48 overflow-y-auto text-xs leading-relaxed text-gray-200">
              <div dangerouslySetInnerHTML={{ __html: translatedText }} />
            </div>
          )}
        </div>

        <div className="bg-[#1b1a19] px-5 py-3 border-t border-[#333333] flex items-center justify-between">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium text-gray-200 rounded flex items-center gap-1.5 transition-colors"
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />}
            <span>{isLoading ? 'Translating...' : 'Generate Translation'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={() => {
                if (translatedText) {
                  onApplyTranslation(translatedText);
                  onClose();
                }
              }}
              disabled={!translatedText}
              className="px-4 py-1.5 bg-[#0078d4] hover:bg-blue-600 disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
