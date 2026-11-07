import * as $ from 'svelte/internal/server';
import { debounce } from '$lib/helpers/debounce';
import { scrollStore, sheetHeightStore } from './store';
import { onMount, onDestroy, tick } from 'svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { SideSheet } from '$database/(entity)';
import { SvelteSet } from 'svelte/reactivity';

export default function Spreadsheet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			children,
			noSqlEditor,
			sideSheetHeaderAction,
			sideSheetOptions = null,
			sideSheetStateCallbacks = null,
			showEditorSideSheet = false

			/* this sheet is only on mobile */
		} = $$props;

		let spreadsheetWrapper;
		let spreadsheetGridContainer;

		/** resizing logic variables */
		let resizeObserver;

		let mutationObserver;

		/** to avoid querySelector for perf! */
		let cachedElements = new SvelteSet();

		/** writable store to prevent jumps when changing views */
		let spreadsheetHeight = $.store_get($$store_subs ??= {}, '$sheetHeightStore', sheetHeightStore);

		const handleResize = debounce(() => resizeSheet(), 125);

		function observeElement(selector) {
			const element = document.querySelector(selector);

			if (element && !cachedElements.has(element)) {
				cachedElements.add(element);
				resizeObserver.observe(element);
			}
		}

		/** get the actual spreadsheet-container */
		function initSpreadsheetGridContainer() {
			if (spreadsheetGridContainer) return true;

			spreadsheetGridContainer = spreadsheetWrapper?.querySelector('.spreadsheet-container');

			return !!spreadsheetGridContainer;
		}

		/** adjust height to fill remaining viewport space */
		function resizeSheet() {
			if (!spreadsheetWrapper) return;

			const wrapperRect = spreadsheetWrapper.getBoundingClientRect();
			const wrapperTop = wrapperRect.top;
			const viewportHeight = window.innerHeight;
			const availableHeight = viewportHeight - wrapperTop;
			const finalHeight = Math.max(100, availableHeight);
			const currentHeight = parseFloat(spreadsheetHeight);
			const heightChanged = Math.abs(currentHeight - finalHeight) > 1;

			if (heightChanged) {
				const newHeight = `${finalHeight}px`;

				spreadsheetHeight = newHeight;
				sheetHeightStore.set(newHeight);
			}
		}

		function addObservers() {
			/** grab the sheet container */
			initSpreadsheetGridContainer();

			resizeObserver = new ResizeObserver(handleResize);

			/** banners */
			observeElement('.top-banner');

			/** expand / collapse tabs */
			observeElement('.layout-header');

			/** just in case */
			resizeObserver.observe(document.body);

			/** add an observer when a banner pops-in */
			mutationObserver = new MutationObserver(() => {
				observeElement('.top-banner');
			});

			mutationObserver.observe(document.body, { childList: true, subtree: true });
		}

		function manageStateCallbacks(isOpen) {
			if (sideSheetStateCallbacks) {
				if (isOpen) {
					sideSheetStateCallbacks.onOpen?.();
				} else {
					sideSheetStateCallbacks.onClose?.();
				}
			}
		}

		/** save grid sheet scroll for restore */
		function saveGridSheetScroll() {
			if (initSpreadsheetGridContainer()) {
				scrollStore.set(spreadsheetGridContainer.scrollLeft || 0);
			}
		}

		/** restore grid sheet scroll from before */
		function restoreGridSheetScroll() {
			if (initSpreadsheetGridContainer() && spreadsheetGridContainer.scrollWidth > 0) {
				spreadsheetGridContainer.scrollTop = 0;
				spreadsheetGridContainer.scrollLeft = $.store_get($$store_subs ??= {}, '$scrollStore', scrollStore);
			}
		}

		onMount(async () => {
			await tick();
			addObservers();
			resizeSheet();
		});

		onDestroy(() => {
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
		});

		let previousShowEditorSideSheet = showEditorSideSheet;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class('spreadsheet-wrapper svelte-88spcx', void 0, { 'has-json-editor': typeof noSqlEditor !== 'undefined' })}${$.attr_style('', { height: spreadsheetHeight })}>`);
			children($$renderer);
			$$renderer.push(`<!----> <div class="no-sql-editor svelte-88spcx">`);

			if (!$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
				$$renderer.push(`<!--[0--><div class="no-sql-editor desktop svelte-88spcx"${$.attr_style('', { height: spreadsheetHeight })}>`);
				noSqlEditor?.($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				{
					function topEndActions($$renderer) {
						sideSheetHeaderAction?.($$renderer);
						$$renderer.push(`<!---->`);
					}

					SideSheet($$renderer, {
						noContentPadding: true,
						submit: sideSheetOptions?.submit,
						cancel: {
							onClick: () => {
								// fires state callback.
								showEditorSideSheet = false;
							}
						},
						title: sideSheetOptions?.sideSheetTitle ?? 'Edit document',
						get show() {
							return showEditorSideSheet;
						},

						set show($$value) {
							showEditorSideSheet = $$value;
							$$settled = false;
						},
						topEndActions,
						children: ($$renderer) => {
							noSqlEditor?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { topEndActions: true, default: true }
					});
				}
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, {
			showEditorSideSheet,
			saveGridSheetScroll,
			restoreGridSheetScroll
		});
	});
}