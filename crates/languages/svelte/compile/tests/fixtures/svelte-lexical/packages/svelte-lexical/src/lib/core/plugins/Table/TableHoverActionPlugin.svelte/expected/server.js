import * as $ from 'svelte/internal/server';

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

export default function TableHoverActionPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const BUTTON_WIDTH_PX = 20;
		const editor = getEditor();
		const isEditable = getIsEditable();
		let isShownRow = writable(false);
		let isShownColumn = writable(false);
		let shouldListenMouseMove = false;
		let position = writable('');
		const tableSetRef = new Set();
		let tableCellDOMNodeRef = null;
		let { anchorElem } = $$props;

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

					const { y: editorElemY, left: editorElemLeft } = anchorElem.getBoundingClientRect();

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

								shouldListenMouseMove = tableSetRef.size > 0;
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

		if ($.store_get($$store_subs ??= {}, '$isEditable', isEditable)) {
			$$renderer.push('<!--[0-->');

			if ($.store_get($$store_subs ??= {}, '$isShownRow', isShownRow)) {
				$$renderer.push(`<!--[0--><button type="button"${$.attr_class(`${editor._config.theme.tableAddRows}`)}${$.attr_style($.store_get($$store_subs ??= {}, '$position', position))}></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if ($.store_get($$store_subs ??= {}, '$isShownColumn', isShownColumn)) {
				$$renderer.push(`<!--[0--><button type="button"${$.attr_class(`${editor._config.theme.tableAddColumns}`)}${$.attr_style($.store_get($$store_subs ??= {}, '$position', position))}></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}