import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<button type="button" class="item" data-test-id="table-merge-cells"><span class="text">Merge cells</span></button>`);
var root_1 = $.from_html(`<button type="button" class="item" data-test-id="table-unmerge-cells"><span class="text">Unmerge cells</span></button>`);
var root_2 = $.from_html(`<div class="icon-text-container"><i class="icon vertical-top"></i> <span class="text">Top Align</span></div>`);
var root_3 = $.from_html(`<div class="icon-text-container"><i class="icon vertical-middle"></i> <span class="text">Middle Align</span></div>`);
var root_4 = $.from_html(`<div class="icon-text-container"><i class="icon vertical-bottom"></i> <span class="text">Bottom Align</span></div>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="dropdown svelte-lexical"><!> <button type="button" class="item" data-test-id="table-background-color"><span class="text">Background color</span></button> <button type="button" class="item" data-test-id="table-row-striping"><span class="text">Toggle Row Striping</span></button> <!> <button type="button" class="item" data-test-id="table-freeze-first-row"><span class="text">Toggle First Row Freeze</span></button> <button type="button" class="item" data-test-id="table-freeze-first-column"><span class="text">Toggle First Column Freeze</span></button> <hr/> <button type="button" class="item" data-test-id="table-insert-row-above"><span class="text"> </span></button> <button type="button" class="item" data-test-id="table-insert-row-below"><span class="text"> </span></button> <hr/> <button type="button" class="item" data-test-id="table-insert-column-before"><span class="text"> </span></button> <button type="button" class="item" data-test-id="table-insert-column-after"><span class="text"> </span></button> <hr/> <button type="button" class="item" data-test-id="table-delete-columns"><span class="text">Delete column</span></button> <button type="button" class="item" data-test-id="table-delete-rows"><span class="text">Delete row</span></button> <button type="button" class="item" data-test-id="table-delete"><span class="text">Delete table</span></button> <hr/> <button type="button" class="item" data-test-id="table-row-header"><span class="text"> </span></button> <button type="button" class="item" data-test-id="table-column-header"><span class="text"> </span></button></div>`);

export default function TableActionMenu($$anchor, $$props) {
	$.push($$props, true);

	const $backgroundColor = () => $.store_get(backgroundColor, '$backgroundColor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	let dropDownRef = $.state(null);
	let tableCellNode = $.state($.proxy($$props._tableCellNode));
	let selectionCounts = $.state($.proxy({ columns: 1, rows: 1 }));
	let canMergeCells = $.state(false);
	let canUnmergeCell = $.state(false);

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

				$.set(selectionCounts, computeSelectionCount(selection), true);
				$.set(canMergeCells, currentSelectionCounts.columns > 1 || currentSelectionCounts.rows > 1, true);
			}

			// Unmerge cell
			$.set(canUnmergeCell, canUnmerge(), true);
		});

		return mergeRegister(editor.registerMutationListener(
			TableCellNode,
			(nodeMutations) => {
				const nodeUpdated = nodeMutations.get($.get(tableCellNode).getKey()) === 'updated';

				if (nodeUpdated) {
					editor.getEditorState().read(() => {
						$.set(tableCellNode, $.get(tableCellNode).getLatest(), true);
					});

					$.store_set(backgroundColor, currentCellBackgroundColor(editor) || '');
				}
			},
			{ skipInitialization: true }
		));
	});

	$.user_effect(() => {
		const menuButtonElement = $$props.contextRef;
		const dropDownElement = $.get(dropDownRef);
		const rootElement = editor.getRootElement();

		if (menuButtonElement != null && dropDownElement != null && rootElement != null) {
			const rootEleRect = rootElement.getBoundingClientRect();
			const menuButtonRect = menuButtonElement.getBoundingClientRect();

			dropDownElement.style.opacity = '1';

			const dropDownElementRect = dropDownElement.getBoundingClientRect();
			const margin = 5;
			let leftPosition = menuButtonRect.right + margin;

			if (leftPosition + dropDownElementRect.width > window.innerWidth || leftPosition + dropDownElementRect.width > rootEleRect.right) {
				const position = menuButtonRect.left - dropDownElementRect.width - margin;

				leftPosition = (position < 0 ? margin : position) + window.pageXOffset;
			}

			dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`;

			let topPosition = menuButtonRect.top;

			if (topPosition + dropDownElementRect.height > window.innerHeight) {
				const position = menuButtonRect.bottom - dropDownElementRect.height;

				topPosition = position < 0 ? margin : position;
			}

			dropDownElement.style.top = `${topPosition}px`;
		}
	});

	function handleClickOutside(event) {
		if ($.get(dropDownRef) != null && $$props.contextRef != null && isDOMNode(event.target) && !$.get(dropDownRef).contains(event.target) && !$$props.contextRef.contains(event.target)) {
			$$props.setIsMenuOpen(false);
		}
	}

	onMount(() => {
		window.addEventListener('click', handleClickOutside);

		return () => window.removeEventListener('click', handleClickOutside);
	});

	const clearTableSelection = () => {
		editor.update(() => {
			if ($.get(tableCellNode).isAttached()) {
				const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));
				const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

				if (!tableElement) {
					throw new Error('Expected to find tableElement in DOM');
				}

				const tableObserver = getTableObserverFromTableElement(tableElement);

				if (tableObserver !== null) {
					tableObserver.$clearHighlight();
				}

				tableNode.markDirty();
				$.set(tableCellNode, $.get(tableCellNode).getLatest(), true);
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
				$$props.onClose();
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
			for (let i = 0; i < $.get(selectionCounts).rows; i++) {
				_insertTableRowAtSelection(shouldInsertAfter);
			}

			$$props.onClose();
		});
	};

	const insertTableColumnAtSelection = (shouldInsertAfter) => {
		editor.update(() => {
			for (let i = 0; i < $.get(selectionCounts).columns; i++) {
				_insertTableColumnAtSelection(shouldInsertAfter);
			}

			$$props.onClose();
		});
	};

	const deleteTableRowAtSelection = () => {
		editor.update(() => {
			_deleteTableRowAtSelection();
			$$props.onClose();
		});
	};

	const deleteTableAtSelection = () => {
		editor.update(() => {
			const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));

			tableNode.remove();
			clearTableSelection();
			$$props.onClose();
		});
	};

	const deleteTableColumnAtSelection = () => {
		editor.update(() => {
			_deleteTableColumnAtSelection();
			$$props.onClose();
		});
	};

	const toggleTableRowIsHeader = () => {
		editor.update(() => {
			const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));
			const tableRowIndex = getTableRowIndexFromTableCellNode($.get(tableCellNode));
			const [gridMap] = computeTableMapSkipCellCheck(tableNode, null, null);
			const rowCells = new Set();
			const newStyle = $.get(tableCellNode).getHeaderStyles() ^ TableCellHeaderStates.ROW;

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
			$$props.onClose();
		});
	};

	const toggleTableColumnIsHeader = () => {
		editor.update(() => {
			const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));
			const tableColumnIndex = getTableColumnIndexFromTableCellNode($.get(tableCellNode));
			const [gridMap] = computeTableMapSkipCellCheck(tableNode, null, null);
			const columnCells = new Set();
			const newStyle = $.get(tableCellNode).getHeaderStyles() ^ TableCellHeaderStates.COLUMN;

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
			$$props.onClose();
		});
	};

	const toggleRowStriping = () => {
		editor.update(() => {
			if ($.get(tableCellNode).isAttached()) {
				const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));

				if (tableNode) {
					tableNode.setRowStriping(!tableNode.getRowStriping());
				}
			}

			clearTableSelection();
			$$props.onClose();
		});
	};

	const toggleFirstRowFreeze = () => {
		editor.update(() => {
			if ($.get(tableCellNode).isAttached()) {
				const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));

				if (tableNode) {
					tableNode.setFrozenRows(tableNode.getFrozenRows() === 0 ? 1 : 0);
				}
			}

			clearTableSelection();
			$$props.onClose();
		});
	};

	const toggleFirstColumnFreeze = () => {
		editor.update(() => {
			if ($.get(tableCellNode).isAttached()) {
				const tableNode = getTableNodeFromLexicalNodeOrThrow($.get(tableCellNode));

				if (tableNode) {
					tableNode.setFrozenColumns(tableNode.getFrozenColumns() === 0 ? 1 : 0);
				}
			}

			clearTableSelection();
			$$props.onClose();
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

	Portal($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var node_1 = $.child(div);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var button = root();

							$.delegated('click', button, () => mergeTableCellsAtSelection());
							$.append($$anchor, button);
						};

						var consequent_1 = ($$anchor) => {
							var button_1 = root_1();

							$.delegated('click', button_1, () => unmergeTableCellsAtSelection());
							$.append($$anchor, button_1);
						};

						$.if(node_2, ($$render) => {
							if ($.get(canMergeCells)) $$render(consequent); else if ($.get(canUnmergeCell)) $$render(consequent_1, 1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.cellMerge) $$render(consequent_2);
				});
			}

			var button_2 = $.sibling(node_1, 2);
			var button_3 = $.sibling(button_2, 2);
			var node_3 = $.sibling(button_3, 2);

			DropDown(node_3, {
				buttonLabel: 'Vertical Align',
				buttonClassName: 'item',
				buttonAriaLabel: 'Formatting options for vertical alignment',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_5();
					var node_4 = $.first_child(fragment_2);

					DropDownItem(node_4, {
						onclick: () => {
							formatVerticalAlign('top');
						},
						class: 'item wide',
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_2();

							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropDownItem(node_5, {
						onclick: () => {
							formatVerticalAlign('middle');
						},
						class: 'item wide',
						children: ($$anchor, $$slotProps) => {
							var div_2 = root_3();

							$.append($$anchor, div_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropDownItem(node_6, {
						onclick: () => {
							formatVerticalAlign('bottom');
						},
						class: 'item wide',
						children: ($$anchor, $$slotProps) => {
							var div_3 = root_4();

							$.append($$anchor, div_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var button_4 = $.sibling(node_3, 2);
			var button_5 = $.sibling(button_4, 2);
			var button_6 = $.sibling(button_5, 4);
			var span = $.child(button_6);
			var text = $.only_child(span);

			$.reset(button_6);

			var button_7 = $.sibling(button_6, 2);
			var span_1 = $.child(button_7);
			var text_1 = $.only_child(span_1);

			$.reset(button_7);

			var button_8 = $.sibling(button_7, 4);
			var span_2 = $.child(button_8);
			var text_2 = $.only_child(span_2);

			$.reset(button_8);

			var button_9 = $.sibling(button_8, 2);
			var span_3 = $.child(button_9);
			var text_3 = $.only_child(span_3);

			$.reset(button_9);

			var button_10 = $.sibling(button_9, 4);
			var button_11 = $.sibling(button_10, 2);
			var button_12 = $.sibling(button_11, 2);
			var button_13 = $.sibling(button_12, 4);
			var span_4 = $.child(button_13);
			var text_4 = $.only_child(span_4);

			$.reset(button_13);

			var button_14 = $.sibling(button_13, 2);
			var span_5 = $.child(button_14);
			var text_5 = $.only_child(span_5);

			$.reset(button_14);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(dropDownRef, $$value), () => $.get(dropDownRef));

			$.template_effect(() => {
				$.set_text(text, `Insert
        ${$.get(selectionCounts).rows === 1 ? 'row' : `${$.get(selectionCounts).rows} rows`}
        above`);

				$.set_text(text_1, `Insert
        ${$.get(selectionCounts).rows === 1 ? 'row' : `${$.get(selectionCounts).rows} rows`}
        below`);

				$.set_text(text_2, `Insert
        ${$.get(selectionCounts).columns === 1
					? 'column'
					: `${$.get(selectionCounts).columns} columns`}
        left`);

				$.set_text(text_3, `Insert
        ${$.get(selectionCounts).columns === 1
					? 'column'
					: `${$.get(selectionCounts).columns} columns`}
        right`);

				$.set_text(text_4, `${($.get(tableCellNode).__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW ? 'Remove' : 'Add'}
        row header`);

				$.set_text(text_5, `${($.get(tableCellNode).__headerState & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN ? 'Remove' : 'Add'}
        column header`);
			});

			$.delegated('click', div, (e) => {
				e.stopPropagation();
			});

			$.delegated('click', button_2, () => {
				$$props.setIsMenuOpen(false);
				$$props.colorPicker.open(handleCellBackgroundColor, $backgroundColor());
			});

			$.delegated('click', button_3, () => toggleRowStriping());
			$.delegated('click', button_4, () => toggleFirstRowFreeze());
			$.delegated('click', button_5, () => toggleFirstColumnFreeze());
			$.delegated('click', button_6, () => insertTableRowAtSelection(false));
			$.delegated('click', button_7, () => insertTableRowAtSelection(true));
			$.delegated('click', button_8, () => insertTableColumnAtSelection(false));
			$.delegated('click', button_9, () => insertTableColumnAtSelection(true));
			$.delegated('click', button_10, () => deleteTableColumnAtSelection());
			$.delegated('click', button_11, () => deleteTableRowAtSelection());
			$.delegated('click', button_12, () => deleteTableAtSelection());
			$.delegated('click', button_13, () => toggleTableRowIsHeader());
			$.delegated('click', button_14, () => toggleTableColumnIsHeader());
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}

$.delegate(['click']);