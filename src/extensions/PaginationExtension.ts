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
      onPaginationUpdate: undefined
    };
  },

  addCommands() {
    return {
      setPaginationConfig:
        (config: Partial<PaginationOptions>) =>
        () => {
          Object.assign(this.options, config);
          return true;
        }
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    let lastBreakPositions: number[] = [];
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
          const calculatePageBreaks = () => {
            isScheduling = false;
            if (!editorView || !editorView.dom || editorView.isDestroyed) return;

            const opts = extension.options;
            const usableHeight = Math.max(300, opts.pageHeight - opts.padTop - opts.padBottom);
            const dom = editorView.dom as HTMLElement;
            const children = Array.from(dom.children) as HTMLElement[];

            let accumulatedHeight = 0;
            let pageNumber = 1;
            const breakPositions: { pos: number; pageNumber: number }[] = [];

            for (let i = 0; i < children.length; i++) {
              const child = children[i];
              if (
                child.classList.contains('word-auto-page-break') ||
                child.getAttribute('data-type') === 'page-break-widget'
              ) {
                continue;
              }

              const isManualBreak =
                child.getAttribute('data-type') === 'page-break' ||
                child.classList.contains('word-manual-page-break');

              let nodePos = -1;
              try {
                nodePos = editorView.posAtDOM(child, 0);
              } catch {
                continue;
              }

              if (nodePos < 0) continue;

              if (isManualBreak) {
                pageNumber++;
                accumulatedHeight = 0;
                breakPositions.push({ pos: nodePos, pageNumber });
                continue;
              }

              const childHeight = child.offsetHeight || 24;

              if (accumulatedHeight + childHeight > usableHeight && accumulatedHeight > 30) {
                pageNumber++;
                accumulatedHeight = childHeight;
                breakPositions.push({ pos: nodePos, pageNumber });
              } else {
                accumulatedHeight += childHeight;
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

            // Only notify React if the page numbers actually changed!
            if (activePage !== lastReported.current || totalPages !== lastReported.total) {
              lastReported = { current: activePage, total: totalPages };
              opts.onPaginationUpdate?.({
                currentPage: activePage,
                totalPages
              });
            }

            // Compare with last break positions before dispatching any transaction
            const currentPosList = breakPositions.map((b) => b.pos);
            const hasChanged =
              currentPosList.length !== lastBreakPositions.length ||
              currentPosList.some((p, idx) => p !== lastBreakPositions[idx]);

            if (!hasChanged) {
              return;
            }

            lastBreakPositions = currentPosList;

            // Build Widget Decorations
            const decorations: Decoration[] = [];
            const doc = editorView.state.doc;

            for (const bp of breakPositions) {
              if (bp.pos < 0 || bp.pos > doc.content.size) continue;

              const widgetDom = document.createElement('div');
              widgetDom.className = 'word-auto-page-break select-none';
              widgetDom.setAttribute('data-type', 'page-break-widget');
              widgetDom.setAttribute('data-page-break', String(bp.pageNumber));
              widgetDom.style.marginLeft = `-${opts.padLeft}px`;
              widgetDom.style.marginRight = `-${opts.padRight}px`;
              widgetDom.style.width = `calc(100% + ${opts.padLeft + opts.padRight}px)`;

              const textColor = opts.isDarkPaper ? '#a0a0a0' : '#6b7280';
              const dividerColor = opts.isDarkPaper ? '#383838' : '#e5e7eb';

              widgetDom.innerHTML = `
                <!-- Bottom Footer of Previous Page -->
                <div style="background-color: ${opts.pageBgColor}; height: ${opts.padBottom}px; padding: 0 ${opts.padLeft}px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid ${dividerColor}; color: ${textColor}; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);">
                  <span style="opacity: 0.7; font-size: 10px; font-weight: 500;">${opts.documentTitle || 'Document'}</span>
                  <span style="font-weight: 600;">Page ${bp.pageNumber - 1} of ${totalPages}</span>
                </div>

                <!-- Dark Workspace Desk Gap between the two physical sheets -->
                <div style="height: 32px; background-color: #1a1a1a; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 3px 6px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.5);">
                  <div style="position: absolute; left: 0; right: 0; height: 1px; background-color: #2e2e2e;"></div>
                  <span style="position: relative; background-color: #262626; color: #a3a3a3; font-size: 10px; font-weight: 600; padding: 2px 12px; border-radius: 9999px; border: 1px solid #3d3d3d; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #0078d4;"></span>
                    Page ${bp.pageNumber}
                  </span>
                </div>

                <!-- Top Header of Next Page -->
                <div style="background-color: ${opts.pageBgColor}; height: ${opts.padTop}px; padding: 0 ${opts.padLeft}px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${dividerColor}; color: ${textColor}; font-size: 11px; box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.15);">
                  <span style="opacity: 0.7; font-size: 10px; font-weight: 500;">${opts.documentTitle || 'Document'}</span>
                  <span style="opacity: 0.5; font-size: 10px;">Header</span>
                </div>
              `;

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

          // Initial calculation after mount
          setTimeout(calculatePageBreaks, 100);

          return {
            update(view, prevState) {
              // Crucial guard: Only calculate if document or selection changed!
              if (
                prevState &&
                prevState.doc.eq(view.state.doc) &&
                prevState.selection.eq(view.state.selection)
              ) {
                return;
              }

              if (isScheduling) return;
              isScheduling = true;
              requestAnimationFrame(calculatePageBreaks);
            }
          };
        }
      })
    ];
  }
});
