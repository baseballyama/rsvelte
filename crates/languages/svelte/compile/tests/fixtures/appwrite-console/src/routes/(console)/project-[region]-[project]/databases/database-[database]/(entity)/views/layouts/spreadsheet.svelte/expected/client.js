import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { debounce } from '$lib/helpers/debounce';
import { scrollStore, sheetHeightStore } from './store';
import { onMount, onDestroy, tick } from 'svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { SideSheet } from '$database/(entity)';
import { SvelteSet } from 'svelte/reactivity';

var root = $.from_html(`<div class="no-sql-editor desktop svelte-88spcx"><!></div>`);
var root_1 = $.from_html(`<div><!> <div class="no-sql-editor svelte-88spcx"><!></div></div>`);

export default function Spreadsheet($$anchor, $$props) {
	$.push($$props, true);

	const $sheetHeightStore = () => $.store_get(sheetHeightStore, '$sheetHeightStore', $$stores);
	const $scrollStore = () => $.store_get(scrollStore, '$scrollStore', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let sideSheetOptions = $.prop($$props, 'sideSheetOptions', 3, null),
		sideSheetStateCallbacks = $.prop($$props, 'sideSheetStateCallbacks', 3, null),
		showEditorSideSheet = $.prop($$props, 'showEditorSideSheet', 15, false);

	/* this sheet is only on mobile */
	let spreadsheetWrapper;

	let spreadsheetGridContainer;

	/** resizing logic variables */
	let resizeObserver;

	let mutationObserver;

	/** to avoid querySelector for perf! */
	let cachedElements = new SvelteSet();

	/** writable store to prevent jumps when changing views */
	let spreadsheetHeight = $.state($.proxy($sheetHeightStore()));

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
		const currentHeight = parseFloat($.get(spreadsheetHeight));
		const heightChanged = Math.abs(currentHeight - finalHeight) > 1;

		if (heightChanged) {
			const newHeight = `${finalHeight}px`;

			$.set(spreadsheetHeight, newHeight);
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
		if (sideSheetStateCallbacks()) {
			if (isOpen) {
				sideSheetStateCallbacks().onOpen?.();
			} else {
				sideSheetStateCallbacks().onClose?.();
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
			spreadsheetGridContainer.scrollLeft = $scrollStore();
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

	let previousShowEditorSideSheet = showEditorSideSheet();

	$.user_effect(() => {
		if (showEditorSideSheet() !== previousShowEditorSideSheet) {
			manageStateCallbacks(showEditorSideSheet());
			previousShowEditorSideSheet = showEditorSideSheet();
		}
	});

	var $$exports = { saveGridSheetScroll, restoreGridSheetScroll };
	var div = root_1();

	$.event('resize', $.window, handleResize);

	let classes;
	let styles;
	var node = $.child(div);

	$.snippet(node, () => $$props.children);

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			let styles_1;
			var node_2 = $.child(div_2);

			$.snippet(node_2, () => $$props.noSqlEditor ?? $.noop);
			$.reset(div_2);
			$.template_effect(() => styles_1 = $.set_style(div_2, '', styles_1, { height: $.get(spreadsheetHeight) }));
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			{
				const topEndActions = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.snippet(node_3, () => $$props.sideSheetHeaderAction ?? $.noop);
					$.append($$anchor, fragment_1);
				};

				let $0 = $.derived(() => sideSheetOptions()?.submit);
				let $1 = $.derived(() => sideSheetOptions()?.sideSheetTitle ?? 'Edit document');

				SideSheet($$anchor, {
					noContentPadding: true,
					get submit() {
						return $.get($0);
					},

					cancel: {
						onClick: () => {
							// fires state callback.
							showEditorSideSheet(false);
						}
					},

					get title() {
						return $.get($1);
					},

					get show() {
						return showEditorSideSheet();
					},

					set show($$value) {
						showEditorSideSheet($$value);
					},
					topEndActions,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						$.snippet(node_4, () => $$props.noSqlEditor ?? $.noop);
						$.append($$anchor, fragment_2);
					},
					$$slots: { topEndActions: true, default: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if (!$isSmallViewport()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => spreadsheetWrapper = $$value, () => spreadsheetWrapper);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'spreadsheet-wrapper svelte-88spcx', null, classes, {
			'has-json-editor': typeof $$props.noSqlEditor !== 'undefined'
		});

		styles = $.set_style(div, '', styles, { height: $.get(spreadsheetHeight) });
	});

	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}