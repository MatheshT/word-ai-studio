import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PageSettings } from '../../types';

interface WordRulerProps {
  pageWidth: number; // in pixels
  pageHeight: number; // in pixels
  zoom: number; // zoom percentage (e.g. 100)
  totalPages?: number;
  pageSettings: PageSettings;
  onPageSettingsChange: (settings: PageSettings) => void;
  showRuler: boolean;
  children: React.ReactNode;
}

export const WordRulerContainer: React.FC<WordRulerProps> = ({
  pageWidth,
  pageHeight,
  zoom,
  totalPages = 1,
  pageSettings,
  onPageSettingsChange,
  showRuler,
  children
}) => {
  // Tab stop styles (cycles through: left, center, right, decimal)
  const tabStops = ['└', '┴', '┘', '┴·'];
  const [tabStopIndex, setTabStopIndex] = useState<number>(0);

  // Margins in pixels (default calculated based on pageSettings.margins)
  const defaultLeft =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 72; // ~1 inch in 96dpi approx
  const defaultRight =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 72;
  const defaultTop =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 72;
  const defaultBottom =
    pageSettings.margins === 'narrow' ? 38 : pageSettings.margins === 'wide' ? 120 : 72;

  const leftMargin = pageSettings.customMargins?.left ?? defaultLeft;
  const rightMargin = pageSettings.customMargins?.right ?? defaultRight;
  const topMargin = pageSettings.customMargins?.top ?? defaultTop;
  const bottomMargin = pageSettings.customMargins?.bottom ?? defaultBottom;
  const firstLineIndent = pageSettings.firstLineIndent ?? 0;

  // Active guide lines when dragging markers
  const [activeGuide, setActiveGuide] = useState<{
    type: 'vertical' | 'horizontal';
    position: number;
    label: string;
  } | null>(null);

  // Dragging state
  const draggingRef = useRef<'left' | 'right' | 'firstLine' | 'top' | 'bottom' | null>(null);
  const startDragRef = useRef<{ startX: number; startY: number; initialVal: number }>({
    startX: 0,
    startY: 0,
    initialVal: 0
  });

  const handleMouseDown = (
    e: React.MouseEvent,
    marker: 'left' | 'right' | 'firstLine' | 'top' | 'bottom'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = marker;
    let initialVal = 0;
    if (marker === 'left') initialVal = leftMargin;
    else if (marker === 'right') initialVal = rightMargin;
    else if (marker === 'firstLine') initialVal = firstLineIndent;
    else if (marker === 'top') initialVal = topMargin;
    else if (marker === 'bottom') initialVal = bottomMargin;

    startDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialVal
    };

    if (marker === 'left') {
      setActiveGuide({ type: 'vertical', position: leftMargin, label: `Left Margin: ${(leftMargin / 37.8).toFixed(1)} cm` });
    } else if (marker === 'right') {
      setActiveGuide({ type: 'vertical', position: pageWidth - rightMargin, label: `Right Margin: ${(rightMargin / 37.8).toFixed(1)} cm` });
    } else if (marker === 'firstLine') {
      setActiveGuide({ type: 'vertical', position: leftMargin + firstLineIndent, label: `First Line Indent: ${((leftMargin + firstLineIndent) / 37.8).toFixed(1)} cm` });
    } else if (marker === 'top') {
      setActiveGuide({ type: 'horizontal', position: topMargin, label: `Top Margin: ${(topMargin / 37.8).toFixed(1)} cm` });
    } else if (marker === 'bottom') {
      setActiveGuide({ type: 'horizontal', position: pageHeight - bottomMargin, label: `Bottom Margin: ${(bottomMargin / 37.8).toFixed(1)} cm` });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const zoomScale = zoom / 100;
    const deltaX = (e.clientX - startDragRef.current.startX) / zoomScale;
    const deltaY = (e.clientY - startDragRef.current.startY) / zoomScale;

    if (draggingRef.current === 'left') {
      const newLeft = Math.max(20, Math.min(pageWidth - rightMargin - 150, Math.round(startDragRef.current.initialVal + deltaX)));
      onPageSettingsChange({
        ...pageSettings,
        customMargins: {
          left: newLeft,
          right: rightMargin,
          top: topMargin,
          bottom: bottomMargin
        }
      });
      setActiveGuide({ type: 'vertical', position: newLeft, label: `Left Margin: ${(newLeft / 37.8).toFixed(1)} cm` });
    } else if (draggingRef.current === 'right') {
      const newRight = Math.max(20, Math.min(pageWidth - leftMargin - 150, Math.round(startDragRef.current.initialVal - deltaX)));
      onPageSettingsChange({
        ...pageSettings,
        customMargins: {
          left: leftMargin,
          right: newRight,
          top: topMargin,
          bottom: bottomMargin
        }
      });
      setActiveGuide({ type: 'vertical', position: pageWidth - newRight, label: `Right Margin: ${(newRight / 37.8).toFixed(1)} cm` });
    } else if (draggingRef.current === 'firstLine') {
      const newIndent = Math.max(-leftMargin + 10, Math.min(150, Math.round(startDragRef.current.initialVal + deltaX)));
      onPageSettingsChange({
        ...pageSettings,
        firstLineIndent: newIndent
      });
      setActiveGuide({ type: 'vertical', position: leftMargin + newIndent, label: `Indent: ${(newIndent / 37.8).toFixed(1)} cm` });
    } else if (draggingRef.current === 'top') {
      const newTop = Math.max(20, Math.min(pageHeight - bottomMargin - 150, Math.round(startDragRef.current.initialVal + deltaY)));
      onPageSettingsChange({
        ...pageSettings,
        customMargins: {
          left: leftMargin,
          right: rightMargin,
          top: newTop,
          bottom: bottomMargin
        }
      });
      setActiveGuide({ type: 'horizontal', position: newTop, label: `Top Margin: ${(newTop / 37.8).toFixed(1)} cm` });
    } else if (draggingRef.current === 'bottom') {
      const newBottom = Math.max(20, Math.min(pageHeight - topMargin - 150, Math.round(startDragRef.current.initialVal - deltaY)));
      onPageSettingsChange({
        ...pageSettings,
        customMargins: {
          left: leftMargin,
          right: rightMargin,
          top: topMargin,
          bottom: newBottom
        }
      });
      setActiveGuide({ type: 'horizontal', position: pageHeight - newBottom, label: `Bottom Margin: ${(newBottom / 37.8).toFixed(1)} cm` });
    }
  }, [pageWidth, pageHeight, zoom, leftMargin, rightMargin, topMargin, bottomMargin, firstLineIndent, onPageSettingsChange, pageSettings]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
    setActiveGuide(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Convert pixels to cm markings for top ruler (approx 37.795 px per cm)
  const pxPerCm = 37.795;
  const totalCm = Math.floor(pageWidth / pxPerCm);

  // Cycle margins on double click or margin preset click
  const handleCycleMargins = () => {
    const nextMargin =
      pageSettings.margins === 'normal'
        ? 'narrow'
        : pageSettings.margins === 'narrow'
        ? 'wide'
        : 'normal';
    onPageSettingsChange({
      ...pageSettings,
      margins: nextMargin,
      customMargins: undefined
    });
  };

  return (
    <div className="flex flex-col items-center relative select-none">
      {/* 1. Top Horizontal Microsoft Word Ruler */}
      {showRuler && (
        <div
          className="sticky top-0 z-30 mb-2 flex items-center shadow-md bg-[#191919] border-y border-[#333333] select-none no-print"
          style={{
            width: `${pageWidth * (zoom / 100) + 30}px`,
            maxWidth: '100%'
          }}
        >
          {/* Left Corner Tab Stop Selector Button */}
          <button
            onClick={() => setTabStopIndex((prev) => (prev + 1) % tabStops.length)}
            className="w-7 h-6 flex items-center justify-center bg-[#202020] hover:bg-[#2c2c2c] text-gray-200 border-r border-[#333333] font-bold text-xs cursor-pointer transition-colors shrink-0"
            title={`Tab Stop Selector (${tabStops[tabStopIndex]} tab). Click to cycle.`}
          >
            {tabStops[tabStopIndex]}
          </button>

          {/* Scaled Horizontal Ruler Track matching page width */}
          <div
            className="h-6 relative overflow-visible flex-1"
            style={{
              width: `${pageWidth * (zoom / 100)}px`,
              transformOrigin: 'left center'
            }}
            onDoubleClick={handleCycleMargins}
            title="Word Ruler - Drag indent triangles or margin handles to adjust indentation"
          >
            {/* Inner track scaled with zoom */}
            <div
              className="h-full relative overflow-hidden"
              style={{
                width: `${pageWidth}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'left center',
                backgroundColor: '#202020'
              }}
            >
              {/* Left Margin Shaded Zone */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#141414] border-r border-[#383838]"
                style={{ width: `${leftMargin}px` }}
              />

              {/* Printable White/Lighter Zone */}
              <div
                className="absolute top-0 bottom-0 bg-[#252526]"
                style={{
                  left: `${leftMargin}px`,
                  width: `${Math.max(0, pageWidth - leftMargin - rightMargin)}px`
                }}
              />

              {/* Right Margin Shaded Zone */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-[#141414] border-l border-[#383838]"
                style={{ width: `${rightMargin}px` }}
              />

              {/* Ruler Centimeter Numbers & Subdivisions */}
              <div className="absolute inset-0 flex pointer-events-none">
                {Array.from({ length: totalCm + 1 }).map((_, i) => {
                  const leftPos = i * pxPerCm;
                  if (leftPos > pageWidth) return null;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 flex flex-col justify-end text-gray-400 font-mono text-[9px]"
                      style={{ left: `${leftPos}px` }}
                    >
                      {/* Main Tick Line */}
                      <div className="h-2 w-px bg-gray-500 self-center" />
                      {/* Intermediate ticks (0.25, 0.5, 0.75 cm) */}
                      {i < totalCm && (
                        <>
                          <div
                            className="absolute bottom-0 h-1 w-px bg-gray-600/70"
                            style={{ left: `${pxPerCm * 0.25}px` }}
                          />
                          <div
                            className="absolute bottom-0 h-1.5 w-px bg-gray-500"
                            style={{ left: `${pxPerCm * 0.5}px` }}
                          />
                          <div
                            className="absolute bottom-0 h-1 w-px bg-gray-600/70"
                            style={{ left: `${pxPerCm * 0.75}px` }}
                          />
                        </>
                      )}
                      {/* Number Label */}
                      {i > 0 && (
                        <span className="absolute bottom-2.5 -translate-x-1/2 text-gray-300 font-semibold select-none">
                          {i}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Left Margin Boundary Line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-500/60 pointer-events-none"
                style={{ left: `${leftMargin}px` }}
              />

              {/* Right Margin Boundary Line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-500/60 pointer-events-none"
                style={{ right: `${rightMargin}px` }}
              />

              {/* Top Triangle: First Line Indent Marker */}
              <div
                className="absolute top-0 cursor-ew-resize z-20 group -translate-x-1/2"
                style={{ left: `${leftMargin + firstLineIndent}px` }}
                onMouseDown={(e) => handleMouseDown(e, 'firstLine')}
                title={`First-line indent: ${(firstLineIndent / 37.8).toFixed(1)} cm (Drag to change)`}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-400 group-hover:border-t-blue-300 drop-shadow-sm" />
              </div>

              {/* Bottom Triangle: Hanging Indent Marker */}
              <div
                className="absolute bottom-1.5 cursor-ew-resize z-20 group -translate-x-1/2"
                style={{ left: `${leftMargin}px` }}
                onMouseDown={(e) => handleMouseDown(e, 'left')}
                title={`Left Margin / Hanging Indent: ${(leftMargin / 37.8).toFixed(1)} cm (Drag to adjust)`}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-blue-400 group-hover:border-b-blue-300 drop-shadow-sm" />
              </div>

              {/* Base Rectangle: Left Indent Marker */}
              <div
                className="absolute bottom-0 cursor-ew-resize z-20 group -translate-x-1/2"
                style={{ left: `${leftMargin}px` }}
                onMouseDown={(e) => handleMouseDown(e, 'left')}
                title="Left Indent & Margin"
              >
                <div className="w-2 h-1.5 bg-blue-400 group-hover:bg-blue-300 border border-blue-600 rounded-2xs" />
              </div>

              {/* Right Upward Triangle: Right Indent / Margin Marker */}
              <div
                className="absolute bottom-0 cursor-ew-resize z-20 group translate-x-1/2"
                style={{ right: `${rightMargin}px` }}
                onMouseDown={(e) => handleMouseDown(e, 'right')}
                title={`Right Margin: ${(rightMargin / 37.8).toFixed(1)} cm (Drag to adjust)`}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-400 group-hover:border-b-blue-300 drop-shadow-sm" />
                <div className="w-2 h-1 bg-blue-400 group-hover:bg-blue-300 border border-blue-600 rounded-2xs -mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Workspace Row: Left Vertical Ruler + Document Page Canvas */}
      <div className="flex justify-center relative">
        {/* Left Vertical Microsoft Word Ruler */}
        {showRuler && (() => {
          const rulerPages = Math.max(1, totalPages);
          const totalVerticalHeight = rulerPages * pageHeight + (rulerPages - 1) * 32;

          return (
            <div
              className="w-7 bg-[#1c1c1c] border-r border-[#333333] select-none mr-2 flex flex-col relative shrink-0 shadow-md rounded-l-xs no-print"
              style={{
                height: `${totalVerticalHeight * (zoom / 100)}px`,
                transformOrigin: 'top right'
              }}
              title="Vertical Word Ruler - Drag top/bottom margin handles to adjust page height margins"
            >
              <div
                className="w-full relative overflow-hidden"
                style={{
                  height: `${totalVerticalHeight}px`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                  backgroundColor: '#191919'
                }}
              >
                {Array.from({ length: rulerPages }).map((_, pIdx) => {
                  const pageTopOffset = pIdx * (pageHeight + 32);

                  return (
                    <div
                      key={pIdx}
                      className="absolute left-0 right-0"
                      style={{
                        top: `${pageTopOffset}px`,
                        height: `${pageHeight}px`
                      }}
                    >
                      {/* Top Margin Shaded Area */}
                      <div
                        className="absolute top-0 left-0 right-0 bg-[#141414] border-b border-[#383838]"
                        style={{ height: `${topMargin}px` }}
                      />

                      {/* Printable Area */}
                      <div
                        className="absolute left-0 right-0 bg-[#252526]"
                        style={{
                          top: `${topMargin}px`,
                          height: `${Math.max(0, pageHeight - topMargin - bottomMargin)}px`
                        }}
                      />

                      {/* Bottom Margin Shaded Area */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[#141414] border-t border-[#383838]"
                        style={{ height: `${bottomMargin}px` }}
                      />

                      {/* Centimeter Marks */}
                      {Array.from({ length: Math.floor(pageHeight / pxPerCm) + 1 }).map((_, i) => {
                        const topPos = i * pxPerCm;
                        if (topPos > pageHeight) return null;
                        return (
                          <div
                            key={i}
                            className="absolute left-0 right-0 flex items-center pointer-events-none"
                            style={{ top: `${topPos}px` }}
                          >
                            <div className="w-2 h-px bg-gray-500 ml-auto" />
                            {i > 0 && (
                              <span className="text-[8px] text-gray-300 font-mono font-semibold ml-0.5 -mt-2">
                                {i}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Top Margin Drag Handle on first page */}
                      {pIdx === 0 && (
                        <div
                          className="absolute left-0 right-0 cursor-ns-resize z-20 group -translate-y-1/2 flex items-center justify-end pr-0.5"
                          style={{ top: `${topMargin}px` }}
                          onMouseDown={(e) => handleMouseDown(e, 'top')}
                          title={`Top Margin: ${(topMargin / 37.8).toFixed(1)} cm`}
                        >
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-blue-400 group-hover:border-r-blue-300" />
                        </div>
                      )}

                      {/* Bottom Margin Drag Handle on last page */}
                      {pIdx === rulerPages - 1 && (
                        <div
                          className="absolute left-0 right-0 cursor-ns-resize z-20 group translate-y-1/2 flex items-center justify-end pr-0.5"
                          style={{ bottom: `${bottomMargin}px` }}
                          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                          title={`Bottom Margin: ${(bottomMargin / 37.8).toFixed(1)} cm`}
                        >
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-blue-400 group-hover:border-r-blue-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 3. Document Page Children (Canvas) */}
        <div className="relative">
          {children}

          {/* Active Vertical or Horizontal Alignment Guide during drag */}
          {activeGuide && (
            <div className="absolute inset-0 pointer-events-none z-50">
              {activeGuide.type === 'vertical' && (
                <div
                  className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-blue-500/80 transition-none"
                  style={{ left: `${activeGuide.position * (zoom / 100)}px` }}
                >
                  <span className="absolute top-2 left-1 bg-blue-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                    {activeGuide.label}
                  </span>
                </div>
              )}
              {activeGuide.type === 'horizontal' && (
                <div
                  className="absolute left-0 right-0 h-px border-t-2 border-dashed border-blue-500/80 transition-none"
                  style={{ top: `${activeGuide.position * (zoom / 100)}px` }}
                >
                  <span className="absolute left-2 top-1 bg-blue-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                    {activeGuide.label}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
