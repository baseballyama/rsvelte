import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	$getTableAndElementByKey as getTableAndElementByKey,
	$getTableColumnIndexFromTableCellNode as getTableColumnIndexFromTableCellNode,
	getTableElement,
	$getTableRowIndexFromTableCellNode as getTableRowIndexFromTableCellNode,
	$insertTableColumnAtSelection as insertTableColumnAtSelection,
	$insertTableRowAtSelection as insertTableRowAtSelection,
	$isTableCellNode as isTableCellNode,
	$isTableNode as isTableNode,
	TableCellNode,
	TableNode,
	TableRowNode
} from '@lexical/table';

import {
	$findMatchingParent as findMatchingParent,
	isHTMLElement,
	mergeRegister
} from '@lexical/utils';

import { $getNearestNodeFromDOMNode as getNearestNodeFromDOMNode } from 'lexical';
import { useDebounce } from '../CodeBlock/CodeActionMenuPlugin/utils.js';
import { getEditor, getIsEditable } from '$lib/core/composerContext.js';
import { onDestroy, onMount } from 'svelte';
import { writable } from 'svelte/store';
import { CAN_USE_DOM } from '@lexical/utils';
import { getThemeSelector } from '../util/getThemeSelector.js';

var root = $.from_html(`<button type="button"></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function TableHoverActionPlugin($$anchor, $$props) {
	$.push($$props, true);

	const $isShownRow = () => $.store_get(isShownRow, '$isShownRow', $$stores);
	const $isShownColumn = () => $.store_get(isShownColumn, '$isShownColumn', $$stores);
	const $position = () => $.store_get(position, '$position', $$stores);
	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const BUTTON_WIDTH_PX = 20;
	const editor = getEditor();
	const isEditable = getIsEditable();
	let isShownRow = writable(false);
	let isShownColumn = writable(false);
	let shouldListenMouseMove = $.state(false);
	let position = writable('');
	const tableSetRef = new Set();
	let tableCellDOMNodeRef = null;

	function getMouseInfo(event) {
		const target = event.target;

		if (isHTMLElement(target)) {
			const themeSelector = getThemeSelector(editor._config.theme.tableCell);
			const tableDOMNode = target.closest(`td${themeSelector}, th${themeSelector}`);
			const isOutside = !(tableDOMNode || target.closest(`button${getThemeSelector(editor._config.theme.tableAddRows)}`) || target.closest(`button${getThemeSelector(editor._config.theme.tableAddColumns)}`) || target.closest('div.SL_Theme__tableCellResizer'));

			return { isOutside, tableDOMNode };
		} else {
			return { isOutside: true, tableDOMNode: null };
		}
	}

	const debouncedOnMouseMove = useDebounce(
		(event) => {
			const { isOutside, tableDOMNode } = getMouseInfo(event);

			if (isOutside) {
				$.store_set(isShownRow, false);
				$.store_set(isShownColumn, false);

				return;
			}

			if (!tableDOMNode) {
				return;
			}

			tableCellDOMNodeRef = tableDOMNode;

			let hoveredRowNode = null;
			let hoveredColumnNode = null;
			let tableDOMElement = null;

			editor.getEditorState().read(
				() => {
					const maybeTableCell = getNearestNodeFromDOMNode(tableDOMNode);

					if (isTableCellNode(maybeTableCell)) {
						const table = findMatchingParent(maybeTableCell, (node) => isTableNode(node));

						if (!isTableNode(table)) {
							return;
						}

						tableDOMElement = getTableElement(table, editor.getElementByKey(table.getKey()));

						if (tableDOMElement) {
							const rowCount = table.getChildrenSize();
							const colCount = table.getChildAtIndex(0)?.getChildrenSize();
							const rowIndex = getTableRowIndexFromTableCellNode(maybeTableCell);
							const colIndex = getTableColumnIndexFromTableCellNode(maybeTableCell);

							if (rowIndex === rowCount - 1) {
								hoveredRowNode = maybeTableCell;
							} else if (colIndex === colCount - 1) {
								hoveredColumnNode = maybeTableCell;
							}
						}
					}
				},
				{ editor }
			);

			if (tableDOMElement) {
				const {
					width: tableElemWidth,
					y: tableElemY,
					right: tableElemRight,
					left: tableElemLeft,
					bottom: tableElemBottom,
					height: tableElemHeight
				} = tableDOMElement.getBoundingClientRect();

				// Adjust for using the scrollable table container
				const parentElement = tableDOMElement.parentElement;

				let tableHasScroll = false;

				if (parentElement && parentElement.classList.contains('PlaygroundEditorTheme__tableScrollableWrapper')) {
					tableHasScroll = parentElement.scrollWidth > parentElement.clientWidth;
				}

				const { y: editorElemY, left: editorElemLeft } = $$props.anchorElem.getBoundingClientRect();

				if (hoveredRowNode) {
					$.store_set(isShownColumn, false);
					$.store_set(isShownRow, true);

					$.store_set(position, `height: ${BUTTON_WIDTH_PX}px; ` + `left: ${tableHasScroll && parentElement
						? parentElement.offsetLeft
						: tableElemLeft - editorElemLeft}px; ` + `top: ${tableElemBottom - editorElemY + 5}px; ` + `width: ${tableHasScroll && parentElement ? parentElement.offsetWidth : tableElemWidth}px;`);
				} else if (hoveredColumnNode) {
					$.store_set(isShownColumn, true);
					$.store_set(isShownRow, false);
					$.store_set(position, `height: ${tableElemHeight}px; ` + `left: ${tableElemRight - editorElemLeft + 5}px; ` + `top: ${tableElemY - editorElemY}px; ` + `width: ${BUTTON_WIDTH_PX}px;`);
				}
			}
		},
		50,
		250
	);

	$.user_effect(() => {
		if (!CAN_USE_DOM) return;

		if (!$.get(shouldListenMouseMove)) {
			$.store_set(isShownRow, false);
			$.store_set(isShownColumn, false);
			debouncedOnMouseMove.cancel();
			document.removeEventListener('mousemove', debouncedOnMouseMove);

			return;
		}

		document.addEventListener('mousemove', debouncedOnMouseMove);

		return () => document.removeEventListener('mousemove', debouncedOnMouseMove);
	});

	onDestroy(() => {
		$.store_set(isShownRow, false);
		$.store_set(isShownColumn, false);
		debouncedOnMouseMove.cancel();

		if (CAN_USE_DOM) {
			document.removeEventListener('mousemove', debouncedOnMouseMove);
		}
	});

	onMount(() => {
		// Hide the buttons on any table dimensions change to prevent last row cells
		// overlap behind the 'Add Row' button when text entry changes cell height
		const tableResizeObserver = new ResizeObserver(() => {
			$.store_set(isShownRow, false);
			$.store_set(isShownColumn, false);
		});

		return mergeRegister(editor.registerMutationListener(
			TableNode,
			(mutations) => {
				editor.getEditorState().read(
					() => {
						let resetObserver = false;

						for (const [key, type] of mutations) {
							switch (type) {
								case 'created':
									{
										tableSetRef.add(key);
										resetObserver = true;

										break;
									}

								case 'destroyed':
									{
										tableSetRef.delete(key);
										resetObserver = true;

										break;
									}

								default:
									break;
							}
						}

						if (resetObserver) {
							// Reset resize observers
							tableResizeObserver.disconnect();

							for (const tableKey of tableSetRef) {
								const { tableElement } = getTableAndElementByKey(tableKey);

								tableResizeObserver.observe(tableElement);
							}

							$.set(shouldListenMouseMove, tableSetRef.size > 0);
						}
					},
					{ editor }
				);
			},
			{ skipInitialization: false }
		));
	});

	const insertAction = (insertRow) => {
		editor.update(() => {
			if (tableCellDOMNodeRef) {
				const maybeTableNode = getNearestNodeFromDOMNode(tableCellDOMNodeRef);

				maybeTableNode?.selectEnd();

				if (insertRow) {
					insertTableRowAtSelection();
					$.store_set(isShownRow, false);
				} else {
					insertTableColumnAtSelection();
					$.store_set(isShownColumn, false);
				}
			}
		});
	};

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var button = root();

					$.template_effect(() => {
						$.set_class(button, 1, `${editor._config.theme.tableAddRows}`);
						$.set_style(button, $position());
					});

					$.delegated('click', button, () => insertAction(true));
					$.append($$anchor, button);
				};

				$.if(node_2, ($$render) => {
					if ($isShownRow()) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var button_1 = root();

					$.template_effect(() => {
						$.set_class(button_1, 1, `${editor._config.theme.tableAddColumns}`);
						$.set_style(button_1, $position());
					});

					$.delegated('click', button_1, () => insertAction(false));
					$.append($$anchor, button_1);
				};

				$.if(node_3, ($$render) => {
					if ($isShownColumn()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($isEditable()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);