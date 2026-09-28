import * as $ from 'svelte/internal/server';

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

export default function TableCellResizerPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const MIN_ROW_HEIGHT = 33;
		const MIN_COLUMN_WIDTH = 92;
		let editor = getEditor();
		let targetRef = null;
		let resizerRef = null;
		let tableRectRef = null;
		let hasTable = false;
		let pointerStartPosRef = null;
		let pointerCurrentPos = null;
		let activeCell = null;
		let draggingDirection = null;

		const resetState = () => {
			activeCell = null;
			targetRef = null;
			draggingDirection = null;
			pointerStartPosRef = null;
			tableRectRef = null;
		};

		const isHeightChanging = (direction) => {
			if (direction === 'bottom') {
				return true;
			}

			return false;
		};

		const updateRowHeight = (heightChange) => {
			editor.update(
				() => {
					if (!activeCell) {
						throw new Error('TableCellResizer: Expected active cell.');
					}

					const tableCellNode = getNearestNodeFromDOMNode(activeCell.elem);

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
					if (!activeCell) {
						throw new Error('TableCellResizer: Expected active cell.');
					}

					const tableCellNode = getNearestNodeFromDOMNode(activeCell.elem);

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

				if (!activeCell) {
					throw new Error('TableCellResizer: Expected active cell.');
				}

				if (pointerStartPosRef) {
					const { x, y } = pointerStartPosRef;

					if (activeCell === null) {
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

			if (!activeCell) {
				throw new Error('TableCellResizer: Expected active cell.');
			}

			pointerStartPosRef = { x: event.clientX, y: event.clientY };
			pointerCurrentPos = pointerStartPosRef;
			draggingDirection = direction;
			document.addEventListener('pointerup', pointerUpHandler(direction));
		};

		const getResizers = () => {
			if (activeCell) {
				const { height, width, top, left } = activeCell.elem.getBoundingClientRect();
				const zoom = calculateZoomLevel(activeCell.elem);
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

				if (draggingDirection && pointerCurrentPos && tableRect) {
					if (isHeightChanging(draggingDirection)) {
						styles[draggingDirection].left = `${window.scrollX + tableRect.left}px`;
						styles[draggingDirection].top = `${window.scrollY + pointerCurrentPos.y / zoom}px`;
						styles[draggingDirection].height = '3px';
						styles[draggingDirection].width = `${tableRect.width}px`;
					} else {
						styles[draggingDirection].top = `${window.scrollY + tableRect.top}px`;
						styles[draggingDirection].left = `${window.scrollX + pointerCurrentPos.x / zoom}px`;
						styles[draggingDirection].width = '3px';
						styles[draggingDirection].height = `${tableRect.height}px`;
					}

					styles[draggingDirection]['background-color'] = '#adf';
					styles[draggingDirection]['mix-blend-mode'] = 'unset';
				}

				return styles;
			}

			return { bottom: null, left: null, right: null, top: null };
		};

		let resizerStyles = $.derived(() => {
			if (activeCell) {
				return getResizers();
			} else {
				return { bottom: null, left: null, right: null, top: null };
			}
		});

		Portal($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				if (activeCell != null) {
					$$renderer.push(`<!--[0--><div class="SL_Theme__tableCellResizer svelte-44612d"${$.attr_style(resizerStyles().right ? cssStylesToString(resizerStyles().right) : undefined)} role="button" tabindex="-1"></div> <div class="SL_Theme__tableCellResizer svelte-44612d"${$.attr_style(resizerStyles().bottom ? cssStylesToString(resizerStyles().bottom) : undefined)} role="button" tabindex="-1"></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}