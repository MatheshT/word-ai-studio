import React from 'react';
import type { DocumentStats, AISettings } from '../../types';
import { Sparkles, Minus, Plus, Settings } from 'lucide-react';

interface Props {
  stats: DocumentStats;
  zoom: number;
  currentPage?: number;
  totalPages?: number;
  onZoomChange: (newZoom: number) => void;
  aiSettings: AISettings;
  onOpenSettings: () => void;
  isAiProcessing?: boolean;
}

export const StatusBar: React.FC<Props> = ({
  stats,
  zoom,
  currentPage = 1,
  totalPages = 1,
  onZoomChange,
  aiSettings,
  onOpenSettings,
  isAiProcessing = false
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(200, zoom + 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(50, zoom - 10));
  };

  return (
    <footer className="h-6 bg-[#1b1a19] border-t border-[#2d2d2d] text-gray-300 text-[11px] flex items-center justify-between px-3 select-none z-30 shrink-0 font-normal no-print">
      {/* Left side: Document Stats */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-200">Page {currentPage} of {totalPages}</span>
        <span
          className="cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
          title={`${stats.characters} characters with spaces`}
        >
          {stats.words.toLocaleString()} words
        </span>
        <span className="hidden sm:inline text-gray-500">|</span>
        <span className="hidden sm:inline text-gray-400">English (United States)</span>
        <span className="hidden sm:inline text-gray-500">|</span>
        <span className="text-gray-400">Accessibility: Good to go</span>
      </div>

      {/* Center: AI Status Indicator */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
            isAiProcessing
              ? 'bg-amber-400 text-amber-950 animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15'
          }`}
          title="Click to configure AI Provider & Model"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>
            {isAiProcessing
              ? 'AI Working...'
              : `AI: ${aiSettings.provider === 'demo' ? 'Demo Mode' : aiSettings.provider.toUpperCase()} (${aiSettings.model})`}
          </span>
          <Settings className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      </div>

      {/* Right side: View icons & Zoom Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-400 mr-2">
          <span title="Read Mode" className="hover:text-white cursor-pointer">📖</span>
          <span title="Print Layout" className="text-blue-400 cursor-pointer">📄</span>
          <span title="Web Layout" className="hover:text-white cursor-pointer">🌐</span>
        </div>

        <button
          onClick={handleZoomOut}
          className="p-0.5 hover:bg-white/20 rounded transition-colors"
          title="Zoom out"
        >
          <Minus className="w-3 h-3" />
        </button>

        <input
          type="range"
          min="50"
          max="200"
          step="5"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        <button
          onClick={handleZoomIn}
          className="p-0.5 hover:bg-white/20 rounded transition-colors"
          title="Zoom in"
        >
          <Plus className="w-3 h-3" />
        </button>

        <span className="w-9 text-right font-mono text-[11px]">{zoom}%</span>
      </div>
    </footer>
  );
};
