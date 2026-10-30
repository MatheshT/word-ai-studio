import React, { useState } from 'react';
import type { Template } from '../../types';
import { WORD_TEMPLATES } from '../../utils/templates';
import { X, FileText, Check, LayoutTemplate, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesModal: React.FC<Props> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTemplate, setActiveTemplate] = useState<Template>(WORD_TEMPLATES[0]);

  if (!isOpen) return null;

  const categories = ['All', 'Business', 'Academic', 'Personal'];

  const filtered = selectedCategory === 'All'
    ? WORD_TEMPLATES
    : WORD_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#185abd] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <LayoutTemplate className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Microsoft Word Document Templates</h2>
              <p className="text-xs text-blue-100">Start with professionally styled proposals, resumes, agendas, and research papers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-gray-500 mr-2">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#185abd] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Body: Left grid + Right preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Templates Grid */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 grid grid-cols-1 gap-3.5">
            {filtered.map((t) => {
              const isSelected = activeTemplate.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTemplate(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-[#185abd] bg-blue-50/50 shadow-xs ring-2 ring-[#185abd]/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-10 h-12 rounded-md shadow-2xs flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: t.previewColor }}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-900 truncate">{t.name}</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Template Live Preview */}
          <div className="w-1/2 p-6 bg-gray-50 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-xs font-bold text-gray-700">Preview: {activeTemplate.name}</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> AI-Ready Template
              </span>
            </div>

            <div className="flex-1 bg-white border border-gray-300 shadow-xs rounded-lg p-5 overflow-y-auto text-xs font-serif leading-relaxed text-gray-800">
              <div
                dangerouslySetInnerHTML={{ __html: activeTemplate.content }}
                className="prose prose-xs max-w-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSelectTemplate(activeTemplate);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#185abd] hover:bg-[#12499c] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                Use This Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
