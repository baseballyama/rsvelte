import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	$computeTableMapSkipCellCheck as computeTableMapSkipCellCheck,
	$getTableNodeFromLexicalNodeOrThrow as getTableNodeFromLexicalNodeOrThrow,
	$getTableRowIndexFromTableCellNode as getTableRowIndexFromTableCellNode,
	$isTableCellNode as isTableCellNode,
	$isTableRowNode as isTableRowNode,
	getDOMCellFromTarget,
	getTableElement,
	TableNode
} from '@lexical/table';

import { calculateZoomLevel, mergeRegister } from '@lexical/utils';

import {
	$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
	isHTMLElement,
	SKIP_SCROLL_INTO_VIEW_TAG
} from 'lexical';

import { getEditor } from '$lib/core/composerContext.js';
import Portal from '$lib/components/generic/portal/Portal.svelte';
import { cssStylesToString } from '../util/cssStylesUtil.js';

var root = $.from_html(`<div class="SL_Theme__tableCellResizer svelte-44612d" role="button" tabindex="-1"></div> <div class="SL_Theme__tableCellResizer svelte-44612d" role="button" tabindex="-1"></div>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function TableCellResizerPlugin($$anchor, $$props) {
	$.push($$props, true);

	const MIN_ROW_HEIGHT = 33;
	const MIN_COLUMN_WIDTH = 92;
	let editor = getEditor();
	let targetRef = null;
	let resizerRef = null;
	let tableRectRef = null;
	let hasTable = $.state(false);
	let pointerStartPosRef = null;
	let pointerCurrentPos = $.state(null);
	let activeCell = $.state(null);
	let draggingDirection = $.state(null);

	const resetState = () => {
		$.set(activeCell, null);
		targetRef = null;
		$.set(draggingDirection, null);
		pointerStartPosRef = null;
		tableRectRef = null;
	};

	$.user_effect(() => {
		const tableKeys = new Set();

		return mergeRegister(
			editor.registerMutationListener(TableNode, (nodeMutations) => {
				for (const [nodeKey, mutation] of nodeMutations) {
					if (mutation === 'destroyed') {
						tableKeys.delete(nodeKey);
					} else {
						tableKeys.add(nodeKey);
					}
				}

				$.set(hasTable, tableKeys.size > 0);
			}),
			editor.registerNodeTransform(TableNode, (tableNode) => {
				if (tableNode.getColWidths()) {
					return tableNode;
				}

				const numColumns = tableNode.getColumnCount();
				const columnWidth = MIN_COLUMN_WIDTH;

				tableNode.setColWidths(Array(numColumns).fill(columnWidth));

				return tableNode;
			})
		);
	});

	$.user_effect(() => {
		if (!$.get(hasTable)) {
			return;
		}

		const onPointerMove = (event) => {
			const target = event.target;

			if (!isHTMLElement(target)) {
				return;
			}

			if ($.get(draggingDirection)) {
				event.preventDefault();
				event.stopPropagation();
				$.set(pointerCurrentPos, { x: event.clientX, y: event.clientY }, true);

				return;
			}

			if (resizerRef && resizerRef.contains(target)) {
				return;
			}

			if (targetRef !== target) {
				targetRef = target;

				const cell = getDOMCellFromTarget(target);

				if (cell && $.get(activeCell) !== cell) {
					editor.getEditorState().read(
						() => {
							const tableCellNode = getNearestNodeFromDOMNode(cell.elem);

							if (!tableCellNode) {
								throw new Error('TableCellResizer: Table cell node not found.');
							}

							const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
							const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

							if (!tableElement) {
								throw new Error('TableCellResizer: Table element not found.');
							}

							targetRef = target;
							tableRectRef = tableElement.getBoundingClientRect();
							$.set(activeCell, cell);
						},
						{ editor }
					);
				} else if (cell == null) {
					resetState();
				}
			}
		};

		const onPointerDown = (event) => {
			const isTouchEvent = event.pointerType === 'touch';

			if (isTouchEvent) {
				onPointerMove(event);
			}
		};

		const resizerContainer = resizerRef;

		resizerContainer?.addEventListener('pointermove', onPointerMove, { capture: true });

		const removeRootListener = editor.registerRootListener((rootElement, prevRootElement) => {
			prevRootElement?.removeEventListener('pointermove', onPointerMove);
			prevRootElement?.removeEventListener('pointerdown', onPointerDown);
			rootElement?.addEventListener('pointermove', onPointerMove);
			rootElement?.addEventListener('pointerdown', onPointerDown);
		});

		return () => {
			removeRootListener();
			resizerContainer?.removeEventListener('pointermove', onPointerMove);
		};
	});

	const isHeightChanging = (direction) => {
		if (direction === 'bottom') {
			return true;
		}

		return false;
	};

	const updateRowHeight = (heightChange) => {
		editor.update(
			() => {
				if (!$.get(activeCell)) {
					throw new Error('TableCellResizer: Expected active cell.');
				}

				const tableCellNode = getNearestNodeFromDOMNode($.get(activeCell).elem);

				if (!isTableCellNode(tableCellNode)) {
					throw new Error('TableCellResizer: Table cell node not found.');
				}

				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
				const baseRowIndex = getTableRowIndexFromTableCellNode(tableCellNode);
				const tableRows = tableNode.getChildren();

				// Determine if this is a full row merge by checking colspan
				const isFullRowMerge = tableCellNode.getColSpan() === tableNode.getColumnCount();

				// For full row merges, apply to first row. For partial merges, apply to last row
				const tableRowIndex = isFullRowMerge
					? baseRowIndex
					: baseRowIndex + tableCellNode.getRowSpan() - 1;

				if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
					throw new Error('Expected table cell to be inside of table row.');
				}

				const tableRow = tableRows[tableRowIndex];

				if (!isTableRowNode(tableRow)) {
					throw new Error('Expected table row');
				}

				let height = tableRow.getHeight();

				if (height === undefined) {
					const rowCells = tableRow.getChildren();

					height = Math.min(...rowCells.map((cell) => getCellNodeHeight(cell, editor) ?? Infinity));
				}

				const newHeight = Math.max(height + heightChange, MIN_ROW_HEIGHT);

				tableRow.setHeight(newHeight);
			},
			{ tag: SKIP_SCROLL_INTO_VIEW_TAG }
		);
	};

	const getCellNodeHeight = (cell, activeEditor) => {
		const domCellNode = activeEditor.getElementByKey(cell.getKey());

		return domCellNode?.clientHeight;
	};

	const getCellColumnIndex = (tableCellNode, tableMap) => {
		for (let row = 0; row < tableMap.length; row++) {
			for (let column = 0; column < tableMap[row].length; column++) {
				if (tableMap[row][column].cell === tableCellNode) {
					return column;
				}
			}
		}
	};

	const updateColumnWidth = (widthChange) => {
		editor.update(
			() => {
				if (!$.get(activeCell)) {
					throw new Error('TableCellResizer: Expected active cell.');
				}

				const tableCellNode = getNearestNodeFromDOMNode($.get(activeCell).elem);

				if (!isTableCellNode(tableCellNode)) {
					throw new Error('TableCellResizer: Table cell node not found.');
				}

				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
				const [tableMap] = computeTableMapSkipCellCheck(tableNode, null, null);
				const columnIndex = getCellColumnIndex(tableCellNode, tableMap);

				if (columnIndex === undefined) {
					throw new Error('TableCellResizer: Table column not found.');
				}

				const colWidths = tableNode.getColWidths();

				if (!colWidths) {
					return;
				}

				const width = colWidths[columnIndex];

				if (width === undefined) {
					return;
				}

				const newColWidths = [...colWidths];
				const newWidth = Math.max(width + widthChange, MIN_COLUMN_WIDTH);

				newColWidths[columnIndex] = newWidth;
				tableNode.setColWidths(newColWidths);
			},
			{ tag: SKIP_SCROLL_INTO_VIEW_TAG }
		);
	};

	const pointerUpHandler = (direction) => {
		const handler = (event) => {
			event.preventDefault();
			event.stopPropagation();

			if (!$.get(activeCell)) {
				throw new Error('TableCellResizer: Expected active cell.');
			}

			if (pointerStartPosRef) {
				const { x, y } = pointerStartPosRef;

				if ($.get(activeCell) === null) {
					return;
				}

				const zoom = calculateZoomLevel(event.target);

				if (isHeightChanging(direction)) {
					const heightChange = (event.clientY - y) / zoom;

					updateRowHeight(heightChange);
				} else {
					const widthChange = (event.clientX - x) / zoom;

					updateColumnWidth(widthChange);
				}

				resetState();
				document.removeEventListener('pointerup', handler);
			}
		};

		return handler;
	};

	const toggleResize = (direction) => (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (!$.get(activeCell)) {
			throw new Error('TableCellResizer: Expected active cell.');
		}

		pointerStartPosRef = { x: event.clientX, y: event.clientY };
		$.set(pointerCurrentPos, pointerStartPosRef, true);
		$.set(draggingDirection, direction, true);
		document.addEventListener('pointerup', pointerUpHandler(direction));
	};

	const getResizers = () => {
		if ($.get(activeCell)) {
			const { height, width, top, left } = $.get(activeCell).elem.getBoundingClientRect();
			const zoom = calculateZoomLevel($.get(activeCell).elem);
			const zoneWidth = 16; // Pixel width of the zone where you can drag the edge

			const styles = {
				bottom: {
					'background-color': 'none',
					cursor: 'row-resize',
					height: `${zoneWidth}px`,
					left: `${window.scrollX + left}px`,
					top: `${window.scrollY + top + height - zoneWidth / 2}px`,
					width: `${width}px`
				},
				right: {
					'background-color': 'none',
					cursor: 'col-resize',
					height: `${height}px`,
					left: `${window.scrollX + left + width - zoneWidth / 2}px`,
					top: `${window.scrollY + top}px`,
					width: `${zoneWidth}px`
				}
			};

			const tableRect = tableRectRef;

			if ($.get(draggingDirection) && $.get(pointerCurrentPos) && tableRect) {
				if (isHeightChanging($.get(draggingDirection))) {
					styles[$.get(draggingDirection)].left = `${window.scrollX + tableRect.left}px`;
					styles[$.get(draggingDirection)].top = `${window.scrollY + $.get(pointerCurrentPos).y / zoom}px`;
					styles[$.get(draggingDirection)].height = '3px';
					styles[$.get(draggingDirection)].width = `${tableRect.width}px`;
				} else {
					styles[$.get(draggingDirection)].top = `${window.scrollY + tableRect.top}px`;
					styles[$.get(draggingDirection)].left = `${window.scrollX + $.get(pointerCurrentPos).x / zoom}px`;
					styles[$.get(draggingDirection)].width = '3px';
					styles[$.get(draggingDirection)].height = `${tableRect.height}px`;
				}

				styles[$.get(draggingDirection)]['background-color'] = '#adf';
				styles[$.get(draggingDirection)]['mix-blend-mode'] = 'unset';
			}

			return styles;
		}

		return { bottom: null, left: null, right: null, top: null };
	};

	let resizerStyles = $.derived(() => {
		if ($.get(activeCell)) {
			return getResizers();
		} else {
			return { bottom: null, left: null, right: null, top: null };
		}
	});

	Portal($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var div_1 = $.first_child(fragment_1);
					var event_handler = $.derived(() => toggleResize('right'));
					var div_2 = $.sibling(div_1, 2);
					var event_handler_1 = $.derived(() => toggleResize('bottom'));

					$.template_effect(
						($0, $1) => {
							$.set_style(div_1, $0);
							$.set_style(div_2, $1);
						},
						[
							() => $.get(resizerStyles).right
								? cssStylesToString($.get(resizerStyles).right)
								: undefined,

							() => $.get(resizerStyles).bottom
								? cssStylesToString($.get(resizerStyles).bottom)
								: undefined
						]
					);

					$.delegated('pointerdown', div_1, function (...$$args) {
						$.get(event_handler)?.apply(this, $$args);
					});

					$.delegated('pointerdown', div_2, function (...$$args) {
						$.get(event_handler_1)?.apply(this, $$args);
					});

					$.append($$anchor, fragment_1);
				};

				$.if(node, ($$render) => {
					if ($.get(activeCell) != null) $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => resizerRef = $$value, () => resizerRef);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['pointerdown']);