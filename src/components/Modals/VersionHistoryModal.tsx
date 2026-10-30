import React, { useState } from 'react';
import type { DocumentSnapshot } from '../../types';
import { History, X, RotateCcw, Clock, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshots: DocumentSnapshot[];
  onRestoreSnapshot: (snapshot: DocumentSnapshot) => void;
}

export const VersionHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshots,
  onRestoreSnapshot
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<DocumentSnapshot | null>(
    snapshots[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#185abd] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <History className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Document Version History</h2>
              <p className="text-xs text-blue-100">Review earlier snapshots and restore previous revisions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Snapshots Timeline */}
          <div className="w-72 border-r border-gray-200 p-4 overflow-y-auto space-y-2 bg-gray-50">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Saved Revisions ({snapshots.length})
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-8">
                No previous snapshots yet. Edits will auto-save here.
              </div>
            ) : (
              snapshots.map((snap, idx) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <button
                    key={snap.id}
                    onClick={() => setSelectedSnapshot(snap)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-white border-[#185abd] shadow-xs ring-2 ring-[#185abd]/10'
                        : 'bg-white/60 border-gray-200 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        {idx === 0 ? 'Current Version' : `Revision ${snapshots.length - idx}`}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {snap.wordCount} words
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{snap.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Snapshot Content Preview */}
          <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden bg-white">
            {selectedSnapshot ? (
              <>
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#185abd]" />
                    <span className="text-xs font-bold text-gray-800">
                      Preview: {selectedSnapshot.timestamp.toLocaleString()} ({selectedSnapshot.wordCount} words)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onRestoreSnapshot(selectedSnapshot);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-[#185abd] hover:bg-[#12499c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore This Revision
                  </button>
                </div>

                <div className="flex-1 border border-gray-200 rounded-lg p-5 overflow-y-auto text-xs font-serif leading-relaxed text-gray-800 shadow-inner bg-gray-50/30">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedSnapshot.html }}
                    className="prose prose-xs max-w-none"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                Select a revision from the left to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
