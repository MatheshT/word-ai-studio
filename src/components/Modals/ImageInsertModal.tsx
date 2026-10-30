import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Globe, X, Check, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (src: string, alt?: string) => void;
}

const SAMPLE_IMAGES = [
  {
    name: 'Business Strategy Meeting',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Technology & Cloud Architecture',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Data Analytics & Charts',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Corporate Office Team',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60'
  }
];

export const ImageInsertModal: React.FC<Props> = ({ isOpen, onClose, onInsertImage }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewSrc(result);
        setAltText(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    const finalSrc = previewSrc || imageUrl;
    if (finalSrc.trim()) {
      onInsertImage(finalSrc.trim(), altText.trim() || 'Document Image');
      onClose();
      setPreviewSrc(null);
      setImageUrl('');
      setAltText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-[#252526] text-gray-100 rounded-xl shadow-2xl w-full max-w-xl border border-[#3e3e42] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#1b1a19] px-5 py-3.5 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold">Insert Picture</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#333333] bg-[#202020] text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#0078d4] text-white font-bold bg-[#252526]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from PC</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-[#0078d4] text-white font-bold bg-[#252526]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>From Web URL</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'samples'
                ? 'border-[#0078d4] text-white font-bold bg-[#252526]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Stock Photos</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#444444] hover:border-blue-400 hover:bg-[#2b2b2b] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="p-3 bg-[#333333] group-hover:bg-blue-600/20 rounded-full mb-2 transition-colors">
                  <Upload className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-semibold text-gray-200">
                  {previewSrc ? 'Change picture' : 'Click to select picture from this computer'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Supports JPG, PNG, GIF, WebP, SVG
                </div>
              </div>

              {previewSrc && (
                <div className="relative rounded-lg overflow-hidden border border-[#444444] max-h-48 bg-black/40 flex items-center justify-center">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-h-48 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Picture URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewSrc(null);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 text-xs bg-[#1b1a19] border border-[#444444] rounded focus:ring-1 focus:ring-blue-500 outline-none text-white"
                />
              </div>

              {imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-[#444444] max-h-48 bg-black/40 flex items-center justify-center p-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-44 max-w-full object-contain"
                    onError={() => alert('Could not load image from this URL. Please check the link.')}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto">
              {SAMPLE_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPreviewSrc(img.url);
                    setAltText(img.name);
                  }}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all group ${
                    previewSrc === img.url
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-[#444444] hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-24 w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-1.5 bg-[#1e1e1e] text-[10px] truncate text-gray-300">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alt text field */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Description / Caption (Alt Text)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Q4 Growth Trajectory Chart"
              className="w-full px-3 py-1.5 text-xs bg-[#1b1a19] border border-[#444444] rounded focus:ring-1 focus:ring-blue-500 outline-none text-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#1b1a19] px-5 py-3 border-t border-[#333333] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-300 hover:bg-[#333333] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!previewSrc && !imageUrl.trim()}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0078d4] hover:bg-blue-600 disabled:opacity-40 rounded flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Insert into Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
