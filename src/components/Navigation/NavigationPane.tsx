import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import type { OutlineItem } from '../../types';
import { ListTree, X, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  totalPages?: number;
}

export const NavigationPane: React.FC<Props> = ({ isOpen, onClose, editor, totalPages = 1 }) => {
  const [activeTab, setActiveTab] = useState<'headings' | 'pages'>('headings');
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const extractOutline = () => {
      const items: OutlineItem[] = [];
      const doc = editor.state.doc;

      doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level;
          const text = node.textContent;
          if (text.trim()) {
            items.push({
              id: `heading-${pos}`,
              level,
              text,
              pos
            });
          }
        }
      });

      setOutline(items);
    };

    extractOutline();
    editor.on('update', extractOutline);
    return () => {
      editor.off('update', extractOutline);
    };
  }, [editor]);

  if (!isOpen) return null;

  const handleHeadingClick = (pos: number) => {
    if (!editor) return;
    editor.commands.setTextSelection(pos);
    const element = editor.view.domAtPos(pos).node;
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-md z-20 shrink-0 select-none no-print">
      {/* Header */}
      <div className="h-10 bg-[#f3f2f1] border-b border-gray-200 px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
          <ListTree className="w-4 h-4 text-[#185abd]" />
          <span>Navigation</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Close Navigation Pane"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-medium">
        <button
          onClick={() => setActiveTab('headings')}
          className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
            activeTab === 'headings'
              ? 'border-[#185abd] text-[#185abd] bg-white font-semibold'
              : 'border-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          Headings ({outline.length})
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
            activeTab === 'pages'
              ? 'border-[#185abd] text-[#185abd] bg-white font-semibold'
              : 'border-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pages ({totalPages})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 text-xs">
        {activeTab === 'headings' && (
          <div className="space-y-0.5">
            {outline.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs italic">
                No headings found in document. Use Heading 1, 2, or 3 to build an outline.
              </div>
            ) : (
              outline.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHeadingClick(item.pos)}
                  className={`w-full text-left py-1.5 px-2 rounded hover:bg-blue-50 text-gray-700 hover:text-[#185abd] flex items-center gap-1.5 transition-colors group ${
                    item.level === 1 ? 'font-semibold text-xs text-gray-900' : item.level === 2 ? 'pl-4 text-[11px]' : 'pl-6 text-[10px] text-gray-600'
                  }`}
                >
                  <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#185abd] shrink-0" />
                  <span className="truncate">{item.text}</span>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="p-2 space-y-3">
            {Array.from({ length: totalPages }).map((_, pIdx) => (
              <div
                key={pIdx}
                onClick={() => {
                  if (!editor) return;
                  // Scroll to approximate location for this page
                  const dom = editor.view.dom as HTMLElement;
                  const targetScroll = pIdx * 1000;
                  dom.parentElement?.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }}
                className="border-2 border-gray-300 hover:border-[#185abd] rounded p-2 bg-white shadow-xs cursor-pointer hover:shadow-md transition-all"
              >
                <div className="h-28 bg-gray-50 border border-gray-100 rounded flex flex-col p-2 space-y-1 overflow-hidden pointer-events-none opacity-70">
                  <div className="h-2 w-3/4 bg-gray-300 rounded" />
                  <div className="h-1.5 w-full bg-gray-200 rounded" />
                  <div className="h-1.5 w-5/6 bg-gray-200 rounded" />
                  <div className="h-8 w-full bg-blue-50 border border-blue-100 rounded mt-1" />
                </div>
                <div className="text-[10px] text-center text-gray-600 font-medium mt-1">
                  Page {pIdx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
