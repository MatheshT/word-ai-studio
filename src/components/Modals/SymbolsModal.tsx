import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: string) => void;
}

const SYMBOLS_CATEGORIES = [
  {
    category: 'Common Math',
    symbols: ['±', '×', '÷', '≠', '≈', '≤', '≥', '√', '∞', '∑', '∏', '∫', '∆', '∂', '‰', '½', '¼', '¾']
  },
  {
    category: 'Greek Alphabet',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Ω', 'Σ', 'Δ']
  },
  {
    category: 'Currency',
    symbols: ['$', '€', '£', '¥', '₹', '₩', '₽', '₿', '¢', '¤']
  },
  {
    category: 'Legal & Typographic',
    symbols: ['©', '®', '™', '§', '¶', '†', '‡', '•', '–', '—', '“', '”', '‘', '’', '«', '»', '…']
  },
  {
    category: 'Arrows',
    symbols: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇔', '➔', '➤', '↳', '↵']
  }
];

export const SymbolsModal: React.FC<Props> = ({ isOpen, onClose, onInsertSymbol }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('±');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-[#252526] text-gray-100 rounded-xl shadow-2xl w-full max-w-lg border border-[#3e3e42] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1b1a19] px-5 py-3 border-b border-[#333333] flex items-center justify-between">
          <h2 className="text-sm font-bold">Insert Symbol</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#333333] rounded text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {SYMBOLS_CATEGORIES.map((cat, idx) => (
            <div key={idx}>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {cat.category}
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {cat.symbols.map((sym, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => setSelectedSymbol(sym)}
                    onDoubleClick={() => {
                      onInsertSymbol(sym);
                      onClose();
                    }}
                    className={`h-9 rounded border flex items-center justify-center text-base font-serif transition-colors ${
                      selectedSymbol === sym
                        ? 'bg-[#0078d4] text-white border-blue-400 font-bold'
                        : 'bg-[#1e1e1e] border-[#3e3e42] hover:bg-[#333333] text-gray-200'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1b1a19] px-5 py-3 border-t border-[#333333] flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Selected: <span className="font-bold text-white text-base ml-1">{selectedSymbol}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333333] rounded">
              Cancel
            </button>
            <button
              onClick={() => {
                onInsertSymbol(selectedSymbol);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0078d4] hover:bg-blue-600 rounded flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Insert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
