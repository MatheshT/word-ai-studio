import React, { useState, useEffect } from 'react';
import { BookOpen, X, Check, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialWord: string;
  onReplaceWord: (newWord: string) => void;
}

const COMMON_SYNONYMS: Record<string, string[]> = {
  important: ['critical', 'essential', 'paramount', 'vital', 'crucial', 'significant'],
  good: ['exceptional', 'superb', 'exemplary', 'competent', 'favorable', 'commendable'],
  bad: ['suboptimal', 'deficient', 'adverse', 'detrimental', 'unfavorable'],
  fast: ['rapid', 'expedited', 'swift', 'accelerated', 'prompt'],
  improve: ['enhance', 'elevate', 'optimize', 'refine', 'augment', 'upgrade'],
  create: ['author', 'develop', 'engineer', 'formulate', 'generate', 'establish'],
  help: ['facilitate', 'assist', 'empower', 'augment', 'support'],
  change: ['transition', 'transform', 'reconfigure', 'adapt', 'modify'],
  strategy: ['methodology', 'roadmap', 'architecture', 'initiative', 'blueprint'],
  show: ['demonstrate', 'illustrate', 'exhibit', 'exemplify', 'manifest']
};

export const ThesaurusModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialWord,
  onReplaceWord
}) => {
  const [searchTerm, setSearchTerm] = useState(initialWord || 'important');
  const [synonyms, setSynonyms] = useState<string[]>([]);

  useEffect(() => {
    if (initialWord) setSearchTerm(initialWord.toLowerCase().trim());
  }, [initialWord]);

  useEffect(() => {
    const key = searchTerm.toLowerCase().trim();
    if (COMMON_SYNONYMS[key]) {
      setSynonyms(COMMON_SYNONYMS[key]);
    } else {
      // General fallbacks
      setSynonyms([
        `${key} (refined)`,
        `optimal ${key}`,
        `strategic ${key}`,
        `comprehensive ${key}`
      ]);
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-14 right-8 z-40 bg-[#252526] text-gray-100 rounded-xl shadow-2xl border border-[#3e3e42] w-72 overflow-hidden no-print animate-in fade-in duration-100">
      <div className="bg-[#1b1a19] px-4 py-2.5 border-b border-[#333333] flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 text-blue-400">
          <BookOpen className="w-4 h-4" />
          <span>Thesaurus (Synonyms)</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#333333] rounded text-gray-400 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search word..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#1b1a19] border border-[#444444] rounded text-white outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Synonyms for "{searchTerm}"
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {synonyms.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onReplaceWord(s);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#333333] text-xs text-blue-300 hover:text-white flex items-center justify-between group transition-colors"
              >
                <span>{s}</span>
                <span className="text-[10px] text-gray-500 group-hover:text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Apply
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
