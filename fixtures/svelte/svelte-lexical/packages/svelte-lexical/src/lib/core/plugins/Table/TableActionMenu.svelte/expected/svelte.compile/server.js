import * as $ from 'svelte/internal/server';
import { getEditor } from '$lib/core/composerContext.js';

import {
	$unmergeCell as unmergeCell,
	TableCellNode,
	$insertTableRowAtSelection as _insertTableRowAtSelection,
	$insertTableColumnAtSelection as _insertTableColumnAtSelection,
	$deleteTableRowAtSelection as _deleteTableRowAtSelection,
	$deleteTableColumnAtSelection as _deleteTableColumnAtSelection,
	$getTableRowIndexFromTableCellNode as getTableRowIndexFromTableCellNode,
	TableCellHeaderStates,
	$getTableColumnIndexFromTableCellNode as getTableColumnIndexFromTableCellNode,
	getTableElement,
	$computeTableMapSkipCellCheck as computeTableMapSkipCellCheck,
	$mergeCells as mergeCells
} from '@lexical/table';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection,
	$setSelection as setSelection,
	ElementNode,
	$isTextNode as isTextNode,
	$isElementNode as isElementNode,
	isDOMNode
} from 'lexical';

import {
	$isTableSelection as isTableSelection,
	$getNodeTriplet as getNodeTriplet,
	$isTableCellNode as isTableCellNode,
	$getTableNodeFromLexicalNodeOrThrow as getTableNodeFromLexicalNodeOrThrow,
	getTableObserverFromTableElement
} from '@lexical/table';

import { onMount } from 'svelte';
import { mergeRegister } from '@lexical/utils';
import { writable } from 'svelte/store';
import Portal from '$lib/components/generic/portal/Portal.svelte';
import DropDown from '$lib/components/generic/dropdown/DropDown.svelte';
import DropDownItem from '$lib/components/generic/dropdown/DropDownItem.svelte';
import ColorPickerDialog from '$lib/components/generic/colorpicker/ColorPickerDialog.svelte';

export default function TableActionMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			onClose,
			_tableCellNode,
			setIsMenuOpen,
			contextRef,
			cellMerge,
			colorPicker
		} = $$props;

		const editor = getEditor();
		let dropDownRef = null;
		let tableCellNode = _tableCellNode;
		let selectionCounts = { columns: 1, rows: 1 };
		let canMergeCells = false;
		let canUnmergeCell = false;

		function currentCellBackgroundColor(editor) {
			return editor.getEditorState().read(() => {
				const selection = getSelection();

				if (isRangeSelection(selection) || isTableSelection(selection)) {
					const [cell] = getNodeTriplet(selection.anchor);

					if (isTableCellNode(cell)) {
						return cell.getBackgroundColor();
					}
				}

				return null;
			});
		}

		function computeSelectionCount(selection) {
			const selectionShape = selection.getShape();

			return {
				columns: selectionShape.toX - selectionShape.fromX + 1,
				rows: selectionShape.toY - selectionShape.fromY + 1
			};
		}

		function canUnmerge() {
			const selection = getSelection();

			if (isRangeSelection(selection) && !selection.isCollapsed() || isTableSelection(selection) && !selection.anchor.is(selection.focus) || !isRangeSelection(selection) && !isTableSelection(selection)) {
				return false;
			}

			const [cell] = getNodeTriplet(selection.anchor);

			return cell.__colSpan > 1 || cell.__rowSpan > 1;
		}

		function selectLastDescendant(node) {
			const lastDescendant = node.getLastDescendant();

			if (isTextNode(lastDescendant)) {
				lastDescendant.select();
			} else if (isElementNode(lastDescendant)) {
				lastDescendant.selectEnd();
			} else if (lastDescendant !== null) {
				lastDescendant.selectNext();
			}
		}

		let backgroundColor = writable(currentCellBackgroundColor(editor) || '');

		onMount(() => {
			editor.getEditorState().read(() => {
				const selection = getSelection();

				// Merge cells
				if (isTableSelection(selection)) {
					const currentSelectionCounts = computeSelectionCount(selection);

					selectionCounts = computeSelectionCount(selection);
					canMergeCells = currentSelectionCounts.columns > 1 || currentSelectionCounts.rows > 1;
				}

				// Unmerge cell
				canUnmergeCell = canUnmerge();
			});

			return mergeRegister(editor.registerMutationListener(
				TableCellNode,
				(nodeMutations) => {
					const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === 'updated';

					if (nodeUpdated) {
						editor.getEditorState().read(() => {
							tableCellNode = tableCellNode.getLatest();
						});

						$.store_set(backgroundColor, currentCellBackgroundColor(editor) || '');
					}
				},
				{ skipInitialization: true }
			));
		});

		function handleClickOutside(event) {
			if (dropDownRef != null && contextRef != null && isDOMNode(event.target) && !dropDownRef.contains(event.target) && !contextRef.contains(event.target)) {
				setIsMenuOpen(false);
			}
		}

		onMount(() => {
			window.addEventListener('click', handleClickOutside);

			return () => window.removeEventListener('click', handleClickOutside);
		});

		const clearTableSelection = () => {
			editor.update(() => {
				if (tableCellNode.isAttached()) {
					const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
					const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

					if (!tableElement) {
						throw new Error('Expected to find tableElement in DOM');
					}

					const tableObserver = getTableObserverFromTableElement(tableElement);

					if (tableObserver !== null) {
						tableObserver.$clearHighlight();
					}

					tableNode.markDirty();
					tableCellNode = tableCellNode.getLatest();
				}

				setSelection(null);
			});
		};

		const mergeTableCellsAtSelection = () => {
			editor.update(() => {
				const selection = getSelection();

				if (!isTableSelection(selection)) {
					return;
				}

				const nodes = selection.getNodes();
				const tableCells = nodes.filter(isTableCellNode);
				const targetCell = mergeCells(tableCells);

				if (targetCell) {
					selectLastDescendant(targetCell);
					onClose();
				}
			});
		};

		const unmergeTableCellsAtSelection = () => {
			editor.update(() => {
				unmergeCell();
			});
		};

		const insertTableRowAtSelection = (shouldInsertAfter) => {
			editor.update(() => {
				for (let i = 0; i < selectionCounts.rows; i++) {
					_insertTableRowAtSelection(shouldInsertAfter);
				}

				onClose();
			});
		};

		const insertTableColumnAtSelection = (shouldInsertAfter) => {
			editor.update(() => {
				for (let i = 0; i < selectionCounts.columns; i++) {
					_insertTableColumnAtSelection(shouldInsertAfter);
				}

				onClose();
			});
		};

		const deleteTableRowAtSelection = () => {
			editor.update(() => {
				_deleteTableRowAtSelection();
				onClose();
			});
		};

		const deleteTableAtSelection = () => {
			editor.update(() => {
				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);

				tableNode.remove();
				clearTableSelection();
				onClose();
			});
		};

		const deleteTableColumnAtSelection = () => {
			editor.update(() => {
				_deleteTableColumnAtSelection();
				onClose();
			});
		};

		const toggleTableRowIsHeader = () => {
			editor.update(() => {
				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
				const tableRowIndex = getTableRowIndexFromTableCellNode(tableCellNode);
				const [gridMap] = computeTableMapSkipCellCheck(tableNode, null, null);
				const rowCells = new Set();
				const newStyle = tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.ROW;

				for (let col = 0; col < gridMap[tableRowIndex].length; col++) {
					const mapCell = gridMap[tableRowIndex][col];

					if (!mapCell?.cell) {
						continue;
					}

					if (!rowCells.has(mapCell.cell)) {
						rowCells.add(mapCell.cell);
						mapCell.cell.setHeaderStyles(newStyle, TableCellHeaderStates.ROW);
					}
				}

				clearTableSelection();
				onClose();
			});
		};

		const toggleTableColumnIsHeader = () => {
			editor.update(() => {
				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
				const tableColumnIndex = getTableColumnIndexFromTableCellNode(tableCellNode);
				const [gridMap] = computeTableMapSkipCellCheck(tableNode, null, null);
				const columnCells = new Set();
				const newStyle = tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.COLUMN;

				for (let row = 0; row < gridMap.length; row++) {
					const mapCell = gridMap[row][tableColumnIndex];

					if (!mapCell?.cell) {
						continue;
					}

					if (!columnCells.has(mapCell.cell)) {
						columnCells.add(mapCell.cell);
						mapCell.cell.setHeaderStyles(newStyle, TableCellHeaderStates.COLUMN);
					}
				}

				clearTableSelection();
				onClose();
			});
		};

		const toggleRowStriping = () => {
			editor.update(() => {
				if (tableCellNode.isAttached()) {
					const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);

					if (tableNode) {
						tableNode.setRowStriping(!tableNode.getRowStriping());
					}
				}

				clearTableSelection();
				onClose();
			});
		};

		const toggleFirstRowFreeze = () => {
			editor.update(() => {
				if (tableCellNode.isAttached()) {
					const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);

					if (tableNode) {
						tableNode.setFrozenRows(tableNode.getFrozenRows() === 0 ? 1 : 0);
					}
				}

				clearTableSelection();
				onClose();
			});
		};

		const toggleFirstColumnFreeze = () => {
			editor.update(() => {
				if (tableCellNode.isAttached()) {
					const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);

					if (tableNode) {
						tableNode.setFrozenColumns(tableNode.getFrozenColumns() === 0 ? 1 : 0);
					}
				}

				clearTableSelection();
				onClose();
			});
		};

		const handleCellBackgroundColor = (value) => {
			editor.update(() => {
				const selection = getSelection();

				if (isRangeSelection(selection) || isTableSelection(selection)) {
					const [cell] = getNodeTriplet(selection.anchor);

					if (isTableCellNode(cell)) {
						cell.setBackgroundColor(value);
					}

					if (isTableSelection(selection)) {
						const nodes = selection.getNodes();

						for (let i = 0; i < nodes.length; i++) {
							const node = nodes[i];

							if (isTableCellNode(node)) {
								node.setBackgroundColor(value);
							}
						}
					}
				}
			});
		};

		const formatVerticalAlign = (value) => {
			editor.update(() => {
				const selection = getSelection();

				if (isRangeSelection(selection) || isTableSelection(selection)) {
					const [cell] = getNodeTriplet(selection.anchor);

					if (isTableCellNode(cell)) {
						cell.setVerticalAlign(value);
					}

					if (isTableSelection(selection)) {
						const nodes = selection.getNodes();

						for (let i = 0; i < nodes.length; i++) {
							const node = nodes[i];

							if (isTableCellNode(node)) {
								node.setVerticalAlign(value);
							}
						}
					}
				}
			});
		};

		Portal($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="dropdown svelte-lexical">`);

				if (cellMerge) {
					$$renderer.push('<!--[0-->');

					if (canMergeCells) {
						$$renderer.push(`<!--[0--><button type="button" class="item" data-test-id="table-merge-cells"><span class="text">Merge cells</span></button>`);
					} else if (canUnmergeCell) {
						$$renderer.push(`<!--[1--><button type="button" class="item" data-test-id="table-unmerge-cells"><span class="text">Unmerge cells</span></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <button type="button" class="item" data-test-id="table-background-color"><span class="text">Background color</span></button> <button type="button" class="item" data-test-id="table-row-striping"><span class="text">Toggle Row Striping</span></button> `);

				DropDown($$renderer, {
					buttonLabel: 'Vertical Align',
					buttonClassName: 'item',
					buttonAriaLabel: 'Formatting options for vertical alignment',
					children: ($$renderer) => {
						DropDownItem($$renderer, {
							onclick: () => {
								formatVerticalAlign('top');
							},
							class: 'item wide',
							children: ($$renderer) => {
								$$renderer.push(`<div class="icon-text-container"><i class="icon vertical-top"></i> <span class="text">Top Align</span></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropDownItem($$renderer, {
							onclick: () => {
								formatVerticalAlign('middle');
							},
							class: 'item wide',
							children: ($$renderer) => {
								$$renderer.push(`<div class="icon-text-container"><i class="icon vertical-middle"></i> <span class="text">Middle Align</span></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropDownItem($$renderer, {
							onclick: () => {
								formatVerticalAlign('bottom');
							},
							class: 'item wide',
							children: ($$renderer) => {
								$$renderer.push(`<div class="icon-text-container"><i class="icon vertical-bottom"></i> <span class="text">Bottom Align</span></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <button type="button" class="item" data-test-id="table-freeze-first-row"><span class="text">Toggle First Row Freeze</span></button> <button type="button" class="item" data-test-id="table-freeze-first-column"><span class="text">Toggle First Column Freeze</span></button> <hr/> <button type="button" class="item" data-test-id="table-insert-row-above"><span class="text">Insert
        ${$.escape(selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`)}
        above</span></button> <button type="button" class="item" data-test-id="table-insert-row-below"><span class="text">Insert
        ${$.escape(selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`)}
        below</span></button> <hr/> <button type="button" class="item" data-test-id="table-insert-column-before"><span class="text">Insert
        ${$.escape(selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`)}
        left</span></button> <button type="button" class="item" data-test-id="table-insert-column-after"><span class="text">Insert
        ${$.escape(selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`)}
        right</span></button> <hr/> <button type="button" class="item" data-test-id="table-delete-columns"><span class="text">Delete column</span></button> <button type="button" class="item" data-test-id="table-delete-rows"><span class="text">Delete row</span></button> <button type="button" class="item" data-test-id="table-delete"><span class="text">Delete table</span></button> <hr/> <button type="button" class="item" data-test-id="table-row-header"><span class="text">${$.escape((tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW ? 'Remove' : 'Add')}
        row header</span></button> <button type="button" class="item" data-test-id="table-column-header"><span class="text">${$.escape((tableCellNode.__headerState & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN ? 'Remove' : 'Add')}
        column header</span></button></div>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}