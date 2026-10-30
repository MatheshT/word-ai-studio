import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import {
  Move,
  RotateCw,
  Layout,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Trash2,
  Check
} from 'lucide-react';

export const ResizableImageNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  deleteNode
}) => {
  const {
    src,
    alt,
    width = 300,
    alignment = 'center',
    wrapMode = 'inline',
    frameStyle = 'none',
    filter = '',
    rotation = 0,
    xOffset = 0,
    yOffset = 0
  } = node.attrs;

  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // Live state during mouse drag operations
  const [liveWidth, setLiveWidth] = useState<number>(
    typeof width === 'number' ? width : parseInt(String(width), 10) || 300
  );
  const [liveRotation, setLiveRotation] = useState<number>(rotation || 0);
  const [liveX, setLiveX] = useState<number>(xOffset || 0);
  const [liveY, setLiveY] = useState<number>(yOffset || 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLiveWidth(typeof width === 'number' ? width : parseInt(String(width), 10) || 300);
  }, [width]);

  useEffect(() => {
    setLiveRotation(rotation || 0);
  }, [rotation]);

  useEffect(() => {
    setLiveX(xOffset || 0);
  }, [xOffset]);

  useEffect(() => {
    setLiveY(yOffset || 0);
  }, [yOffset]);

  // Handle Free Move / Dragging anywhere
  const handleStartDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const initialX = liveX;
    const initialY = liveY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      const newX = Math.round(initialX + deltaX);
      const newY = Math.round(initialY + deltaY);
      setLiveX(newX);
      setLiveY(newY);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      const deltaX = upEvent.clientX - startMouseX;
      const deltaY = upEvent.clientY - startMouseY;
      const finalX = Math.round(initialX + deltaX);
      const finalY = Math.round(initialY + deltaY);
      setIsDragging(false);
      updateAttributes({
        xOffset: finalX,
        yOffset: finalY
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle Corner & Edge Resizing
  const handleStartResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const initialW = liveWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newW = initialW;

      if (direction.includes('e')) {
        newW = Math.max(60, Math.min(1000, initialW + deltaX));
      } else if (direction.includes('w')) {
        newW = Math.max(60, Math.min(1000, initialW - deltaX));
      }
      setLiveWidth(Math.round(newW));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      updateAttributes({
        width: Math.round(liveWidth),
        height: 'auto'
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle Rotation Pin Dragging
  const handleStartRotate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const radians = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let degrees = Math.round(radians * (180 / Math.PI)) + 90;
      if (degrees < 0) degrees += 360;
      // Snap to 45 degree increments if close
      if (Math.abs(degrees % 45) < 4) {
        degrees = Math.round(degrees / 45) * 45;
      }
      setLiveRotation(degrees);
    };

    const onMouseUp = () => {
      setIsRotating(false);
      updateAttributes({ rotation: liveRotation });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const isSelected = selected || isHovered || isDragging || isResizing || isRotating;

  // Determine wrapper layout alignment styles
  let alignStyle: React.CSSProperties = {};
  if (wrapMode === 'infront') {
    alignStyle = {
      position: 'relative',
      zIndex: 30,
      display: 'inline-block'
    };
  } else if (wrapMode === 'behind') {
    alignStyle = {
      position: 'relative',
      zIndex: 1,
      display: 'inline-block',
      opacity: 0.85
    };
  } else if (alignment === 'float-left') {
    alignStyle = { float: 'left', marginRight: '1.5rem', marginBottom: '0.75rem' };
  } else if (alignment === 'float-right') {
    alignStyle = { float: 'right', marginLeft: '1.5rem', marginBottom: '0.75rem' };
  } else if (alignment === 'left') {
    alignStyle = { display: 'block', margin: '0.75rem auto 0.75rem 0' };
  } else if (alignment === 'right') {
    alignStyle = { display: 'block', margin: '0.75rem 0 0.75rem auto' };
  } else {
    // Default center
    alignStyle = { display: 'flex', justifyContent: 'center', margin: '0.75rem 0' };
  }

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper not-prose select-none my-2 transition-all relative"
      style={{
        ...alignStyle,
        transform: `translate(${liveX}px, ${liveY}px)`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!selected) setShowLayoutMenu(false);
      }}
    >
      <div
        ref={containerRef}
        className={`relative inline-block group touch-none ${
          isSelected ? 'ring-2 ring-[#0078d4] ring-offset-2 ring-offset-white' : ''
        }`}
        style={{
          width: `${liveWidth}px`,
          transform: `rotate(${liveRotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Rendered Image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          data-frame={frameStyle}
          className="block w-full h-auto pointer-events-none select-none transition-shadow"
          style={{
            filter: filter || undefined,
            userSelect: 'none'
          }}
          draggable={false}
        />

        {/* Word 365 Selection Controls (Handles, Rotation, Move Bar, Layout) */}
        {isSelected && (
          <>
            {/* Top Rotation Handle with Stem Line */}
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-40 group"
              onMouseDown={handleStartRotate}
              title={`Rotate Image: ${liveRotation}°`}
            >
              <div className="w-5 h-5 rounded-full bg-white border-2 border-[#0078d4] shadow-md flex items-center justify-center hover:bg-blue-50 transition-transform hover:scale-125">
                <RotateCw className="w-3 h-3 text-[#0078d4]" />
              </div>
              <div className="w-0.5 h-2 bg-[#0078d4]" />
            </div>

            {/* Drag to Move Center Banner */}
            <div
              onMouseDown={handleStartDrag}
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1e293b]/90 hover:bg-[#0078d4] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg border border-white/40 cursor-move flex items-center gap-1 z-30 transition-colors pointer-events-auto"
              title="Click and drag to move image anywhere on page"
            >
              <Move className="w-3 h-3" />
              <span>Drag to Move</span>
            </div>

            {/* 8 Word-style Circular Resize Handles */}
            {/* North-West */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'nw')}
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-nwse-resize z-40 hover:scale-125 transition-transform"
            />
            {/* North */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'n')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-ns-resize z-40 hover:scale-125 transition-transform"
            />
            {/* North-East */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'ne')}
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-nesw-resize z-40 hover:scale-125 transition-transform"
            />
            {/* East */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'e')}
              className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-ew-resize z-40 hover:scale-125 transition-transform"
            />
            {/* South-East */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'se')}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-nwse-resize z-40 hover:scale-125 transition-transform"
            />
            {/* South */}
            <div
              onMouseDown={(e) => handleStartResize(e, 's')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-ns-resize z-40 hover:scale-125 transition-transform"
            />
            {/* South-West */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'sw')}
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-nesw-resize z-40 hover:scale-125 transition-transform"
            />
            {/* West */}
            <div
              onMouseDown={(e) => handleStartResize(e, 'w')}
              className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border border-[#0078d4] rounded-full shadow cursor-ew-resize z-40 hover:scale-125 transition-transform"
            />

            {/* Word Layout Options Floating Button (Matches Screenshot [⌒]) */}
            <div className="absolute top-1 -right-8 z-40">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLayoutMenu(!showLayoutMenu);
                }}
                className="w-6 h-6 bg-white hover:bg-gray-100 border border-gray-400 rounded shadow-md flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors"
                title="Layout Options (Text Wrapping & Positioning)"
              >
                <Layout className="w-3.5 h-3.5" />
              </button>

              {/* Word Layout Options Popup Dialog */}
              {showLayoutMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-8 top-0 w-52 bg-[#252526] text-gray-100 rounded-lg shadow-2xl border border-[#3e3e42] p-2 z-50 text-xs"
                >
                  <div className="font-semibold text-[11px] text-gray-300 pb-1 border-b border-[#3e3e42] mb-1.5 flex items-center justify-between">
                    <span>Layout Options</span>
                    <button
                      onClick={() => setShowLayoutMenu(false)}
                      className="text-gray-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* With Text Wrapping options */}
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Text Wrapping
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <button
                      onClick={() => {
                        updateAttributes({ wrapMode: 'inline', alignment: 'center' });
                        setShowLayoutMenu(false);
                      }}
                      className={`p-1.5 text-left rounded text-[11px] flex items-center justify-between ${
                        wrapMode === 'inline' ? 'bg-[#0078d4] text-white' : 'hover:bg-[#333333]'
                      }`}
                    >
                      <span>In Line</span>
                      {wrapMode === 'inline' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ wrapMode: 'square', alignment: 'float-left' });
                        setShowLayoutMenu(false);
                      }}
                      className={`p-1.5 text-left rounded text-[11px] flex items-center justify-between ${
                        wrapMode === 'square' && alignment === 'float-left'
                          ? 'bg-[#0078d4] text-white'
                          : 'hover:bg-[#333333]'
                      }`}
                    >
                      <span>Square Left</span>
                      {wrapMode === 'square' && alignment === 'float-left' && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ wrapMode: 'square', alignment: 'float-right' });
                        setShowLayoutMenu(false);
                      }}
                      className={`p-1.5 text-left rounded text-[11px] flex items-center justify-between ${
                        wrapMode === 'square' && alignment === 'float-right'
                          ? 'bg-[#0078d4] text-white'
                          : 'hover:bg-[#333333]'
                      }`}
                    >
                      <span>Square Right</span>
                      {wrapMode === 'square' && alignment === 'float-right' && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ wrapMode: 'infront' });
                        setShowLayoutMenu(false);
                      }}
                      className={`p-1.5 text-left rounded text-[11px] flex items-center justify-between ${
                        wrapMode === 'infront' ? 'bg-[#0078d4] text-white' : 'hover:bg-[#333333]'
                      }`}
                      title="Freely float and drag anywhere on page"
                    >
                      <span>In Front</span>
                      {wrapMode === 'infront' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ wrapMode: 'behind' });
                        setShowLayoutMenu(false);
                      }}
                      className={`p-1.5 text-left rounded text-[11px] flex items-center justify-between col-span-2 ${
                        wrapMode === 'behind' ? 'bg-[#0078d4] text-white' : 'hover:bg-[#333333]'
                      }`}
                      title="Behind text like a watermark/background"
                    >
                      <span>Behind Text</span>
                      {wrapMode === 'behind' && <Check className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Quick Alignment / Reset */}
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Position Alignment
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      onClick={() => {
                        updateAttributes({ alignment: 'left', xOffset: 0 });
                        setLiveX(0);
                      }}
                      className="flex-1 py-1 bg-[#333333] hover:bg-blue-600 rounded flex justify-center"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ alignment: 'center', xOffset: 0 });
                        setLiveX(0);
                      }}
                      className="flex-1 py-1 bg-[#333333] hover:bg-blue-600 rounded flex justify-center"
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ alignment: 'right', xOffset: 0 });
                        setLiveX(0);
                      }}
                      className="flex-1 py-1 bg-[#333333] hover:bg-blue-600 rounded flex justify-center"
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateAttributes({ xOffset: 0, yOffset: 0, rotation: 0 });
                        setLiveX(0);
                        setLiveY(0);
                        setLiveRotation(0);
                      }}
                      className="px-2 py-1 bg-[#333333] hover:bg-amber-600 text-[10px] rounded"
                      title="Reset Position and Rotation"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Delete option */}
                  <div className="pt-1 border-t border-[#3e3e42]">
                    <button
                      onClick={() => deleteNode()}
                      className="w-full py-1 text-rose-400 hover:bg-rose-500/20 rounded flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Picture</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Size & Rotation Badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-40">
              {liveWidth}px {liveRotation ? `• ${liveRotation}°` : ''}{' '}
              {liveX || liveY ? `• (${liveX}, ${liveY})` : ''}
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
