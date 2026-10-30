import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface PaginationOptions {
  pageHeight: number;
  padTop: number;
  padBottom: number;
  padLeft: number;
  padRight: number;
  documentTitle: string;
  pageBgColor: string;
  isDarkPaper: boolean;
  showHeader?: boolean;
  headerText?: string;
  showFooter?: boolean;
  footerText?: string;
  pageNumberPosition?: 'bottom-right' | 'bottom-center' | 'top-right' | 'none';
  onPaginationUpdate?: (info: { currentPage: number; totalPages: number }) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pagination: {
      setPaginationConfig: (config: Partial<PaginationOptions>) => ReturnType;
    };
  }
}

export const paginationPluginKey = new PluginKey('pagination');

export const PaginationExtension = Extension.create<PaginationOptions>({
  name: 'pagination',

  addOptions() {
    return {
      pageHeight: 1123,
      padTop: 64,
      padBottom: 64,
      padLeft: 64,
      padRight: 64,
      documentTitle: 'Document',
      pageBgColor: '#ffffff',
      isDarkPaper: false,
      showHeader: false,
      headerText: '',
      showFooter: false,
      footerText: '',
      pageNumberPosition: 'none',
      onPaginationUpdate: undefined
    };
  },

  addCommands() {
    return {
      setPaginationConfig:
        (config: Partial<PaginationOptions>) =>
        ({ view }: any) => {
          Object.assign(this.options, config);
          if (view && !view.isDestroyed) {
            const tr = view.state.tr.setMeta('force_pagination_update', true);
            view.dispatch(tr);
          }
          return true;
        }
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    let lastBreaks: { pos: number; unusedHeight: number; spacerHeight: number }[] = [];
    let lastReported = { current: 0, total: 0 };
    let isScheduling = false;

    return [
      new Plugin({
        key: paginationPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(paginationPluginKey);
            if (meta) {
              return meta;
            }
            return oldSet.map(tr.mapping, tr.doc);
          }
        },
        props: {
          decorations(state) {
            return this.getState(state);
          }
        },
        view(editorView) {
          const calculatePageBreaks = (forceUpdate = false) => {
            isScheduling = false;
            if (!editorView || !editorView.dom || editorView.isDestroyed) return;

            const opts = extension.options;
            // Usable content area height on one page
            const usableHeight = Math.max(300, opts.pageHeight - opts.padTop - opts.padBottom);
            const doc = editorView.state.doc;

            let accumulatedHeight = 0;
            let pageNumber = 1;
            const breakPositions: {
              pos: number;
              pageNumber: number;
              unusedHeight: number;
              spacerHeight: number;
            }[] = [];

            // Filter out existing pagination widgets to measure clean ProseMirror block elements
            const nonWidgetChildren = Array.from(editorView.dom.children).filter(
              (el: any) =>
                !el.classList.contains('word-auto-page-break') &&
                el.getAttribute('data-type') !== 'page-break-widget'
            );

            let currentPos = 0;
            for (let i = 0; i < doc.childCount; i++) {
              const node = doc.child(i);
              const nodePos = currentPos;
              currentPos += node.nodeSize;

              // Manual Page Break node
              if (node.type.name === 'pageBreak') {
                const unusedHeight = Math.max(0, usableHeight - accumulatedHeight);
                const spacerHeight = unusedHeight + opts.padBottom + 32 + opts.padTop;
                pageNumber++;
                breakPositions.push({
                  pos: nodePos,
                  pageNumber,
                  unusedHeight,
                  spacerHeight
                });
                accumulatedHeight = 0;
                continue;
              }

              // Measure the rendered DOM element corresponding to this block
              const domNode = (nonWidgetChildren[i] as HTMLElement) || null;
              let nodeHeight = 24;
              if (domNode) {
                const style = window.getComputedStyle(domNode);
                const marginTop = parseFloat(style.marginTop) || 0;
                const marginBottom = parseFloat(style.marginBottom) || 0;
                nodeHeight = (domNode.offsetHeight || 24) + marginTop + marginBottom;
              }

              // If block overflows the remaining usable space on the page, move the entire block to next page!
              // Uses a safe margin threshold so tables and paragraphs never bleed into the desk gap
              if (accumulatedHeight + nodeHeight > usableHeight && accumulatedHeight > 20) {
                const unusedHeight = Math.max(0, usableHeight - accumulatedHeight);
                const spacerHeight = unusedHeight + opts.padBottom + 32 + opts.padTop;
                pageNumber++;
                breakPositions.push({
                  pos: nodePos,
                  pageNumber,
                  unusedHeight,
                  spacerHeight
                });
                accumulatedHeight = nodeHeight;
              } else {
                accumulatedHeight += nodeHeight;
              }
            }

            const totalPages = Math.max(1, pageNumber);

            // Determine active current page from cursor
            const selPos = editorView.state.selection.from;
            let activePage = 1;
            for (const bp of breakPositions) {
              if (selPos >= bp.pos) {
                activePage = bp.pageNumber;
              }
            }

            // Only notify React if page counts actually changed
            if (activePage !== lastReported.current || totalPages !== lastReported.total) {
              lastReported = { current: activePage, total: totalPages };
              opts.onPaginationUpdate?.({
                currentPage: activePage,
                totalPages
              });
            }

            // Guard against redundant transactions
            const hasChanged =
              forceUpdate ||
              breakPositions.length !== lastBreaks.length ||
              breakPositions.some(
                (b, idx) =>
                  b.pos !== lastBreaks[idx]?.pos ||
                  Math.abs(b.unusedHeight - (lastBreaks[idx]?.unusedHeight || 0)) > 2 ||
                  Math.abs(b.spacerHeight - (lastBreaks[idx]?.spacerHeight || 0)) > 2
              );

            if (!hasChanged) {
              return;
            }

            lastBreaks = breakPositions.map((b) => ({
              pos: b.pos,
              unusedHeight: b.unusedHeight,
              spacerHeight: b.spacerHeight
            }));

            // Build Widget Decorations with pixel-perfect spacers
            const decorations: Decoration[] = [];

            for (const bp of breakPositions) {
              if (bp.pos < 0 || bp.pos > doc.content.size) continue;

              const widgetDom = document.createElement('div');
              widgetDom.className = 'word-auto-page-break select-none';
              widgetDom.setAttribute('data-type', 'page-break-widget');
              widgetDom.setAttribute('data-page-break', String(bp.pageNumber));
              widgetDom.style.marginLeft = `-${opts.padLeft}px`;
              widgetDom.style.marginRight = `-${opts.padRight}px`;
              widgetDom.style.width = `calc(100% + ${opts.padLeft + opts.padRight}px)`;
              widgetDom.style.height = `${bp.spacerHeight}px`;
              widgetDom.style.display = 'flex';
              widgetDom.style.flexDirection = 'column';
              widgetDom.style.justifyContent = 'flex-end';
              widgetDom.style.boxSizing = 'border-box';

              const textColor = opts.isDarkPaper ? '#9ca3af' : '#6b7280';
              const dividerColor = opts.isDarkPaper ? '#383838' : '#e5e7eb';

              const prevFooterText = opts.showFooter ? (opts.footerText || '') : '';
              const nextHeaderText = opts.showHeader ? (opts.headerText || '') : '';

              const prevPageNum =
                opts.pageNumberPosition === 'bottom-right'
                  ? `Page ${bp.pageNumber - 1} of ${totalPages}`
                  : opts.pageNumberPosition === 'bottom-center'
                  ? `- ${bp.pageNumber - 1} -`
                  : '';

              const nextTopPageNum =
                opts.pageNumberPosition === 'top-right'
                  ? `Page ${bp.pageNumber} of ${totalPages}`
                  : '';

              widgetDom.innerHTML = `
                <!-- 1. White paper spacer: fills remaining body height of previous page -->
                <div style="height: ${bp.unusedHeight}px; background-color: ${opts.pageBgColor}; width: 100%;"></div>

                <!-- 2. Bottom margin / Footer of previous page -->
                <div class="cursor-pointer group hover:bg-blue-50/10 transition-colors" style="background-color: ${opts.pageBgColor}; height: ${opts.padBottom}px; padding: 0 ${opts.padLeft}px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid ${dividerColor}; color: ${textColor}; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); box-sizing: border-box;" title="Click to edit Footer">
                  <span style="font-size: 10px; font-weight: 500; font-family: sans-serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%;">${prevFooterText}</span>
                  <span style="font-weight: 500; font-family: sans-serif; font-size: 10px; margin-left: auto;">${prevPageNum}</span>
                </div>

                <!-- 3. Dark Workspace Desk Gap between the two physical sheets -->
                <div style="height: 32px; background-color: #1a1a1a; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 3px 6px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.5); box-sizing: border-box;">
                  <div style="position: absolute; left: 0; right: 0; height: 1px; background-color: #2e2e2e;"></div>
                  <span style="position: relative; background-color: #262626; color: #a3a3a3; font-size: 10px; font-weight: 600; padding: 2px 12px; border-radius: 9999px; border: 1px solid #3d3d3d; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #0078d4;"></span>
                    Page ${bp.pageNumber}
                  </span>
                </div>

                <!-- 4. Top margin / Header of next page -->
                <div class="cursor-pointer group hover:bg-blue-50/10 transition-colors" style="background-color: ${opts.pageBgColor}; height: ${opts.padTop}px; padding: 0 ${opts.padLeft}px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${dividerColor}; color: ${textColor}; font-size: 11px; box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.15); box-sizing: border-box;" title="Click to edit Header">
                  <span style="font-size: 10px; font-weight: 500; font-family: sans-serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%;">${nextHeaderText}</span>
                  <span style="font-weight: 500; font-family: sans-serif; font-size: 10px; margin-left: auto;">${nextTopPageNum}</span>
                </div>
              `;

              // Click-to-edit interactions on the footer and header sections
              widgetDom.addEventListener('click', (e) => {
                const rect = widgetDom.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                // Click in segment 2 (Footer)
                if (clickY >= bp.unusedHeight && clickY < bp.unusedHeight + opts.padBottom) {
                  const current = opts.footerText || '';
                  const text = prompt('Edit Footer Text (leave blank to remove):', current);
                  if (text !== null) {
                    window.dispatchEvent(new CustomEvent('word-edit-footer', { detail: text }));
                  }
                  return;
                }
                // Click in segment 4 (Header)
                if (clickY >= bp.unusedHeight + opts.padBottom + 32) {
                  const current = opts.headerText || '';
                  const text = prompt('Edit Header Text (leave blank to remove):', current);
                  if (text !== null) {
                    window.dispatchEvent(new CustomEvent('word-edit-header', { detail: text }));
                  }
                  return;
                }
              });

              decorations.push(
                Decoration.widget(bp.pos, widgetDom, {
                  side: -1,
                  stopEvent: () => true
                })
              );
            }

            const newSet = DecorationSet.create(doc, decorations);
            const tr = editorView.state.tr.setMeta(paginationPluginKey, newSet);
            editorView.dispatch(tr);
          };

          // Run calculations after layout settles
          setTimeout(() => calculatePageBreaks(true), 50);
          setTimeout(() => calculatePageBreaks(true), 250);
          setTimeout(() => calculatePageBreaks(true), 600);

          return {
            update(view, prevState) {
              const forceUpdate = Boolean(view.state.tr.getMeta('force_pagination_update'));
              if (
                !forceUpdate &&
                prevState &&
                prevState.doc.eq(view.state.doc) &&
                prevState.selection.eq(view.state.selection)
              ) {
                return;
              }

              if (isScheduling) return;
              isScheduling = true;
              requestAnimationFrame(() => calculatePageBreaks(forceUpdate));
            }
          };
        }
      })
    ];
  }
});
