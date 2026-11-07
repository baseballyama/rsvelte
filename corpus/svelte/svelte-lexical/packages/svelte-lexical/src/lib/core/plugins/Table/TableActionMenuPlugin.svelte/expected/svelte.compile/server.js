import * as $ from 'svelte/internal/server';

import {
	$getTableNodeFromLexicalNodeOrThrow as getTableNodeFromLexicalNodeOrThrow,
	$getTableCellNodeFromLexicalNode as getTableCellNodeFromLexicalNode,
	getTableElement,
	TableCellNode,
	TableObserver,
	getTableObserverFromTableElement,
	$isTableSelection as isTableSelection,
	$isTableCellNode as isTableCellNode
} from '@lexical/table';

import {
	COMMAND_PRIORITY_CRITICAL,
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection,
	SELECTION_CHANGE_COMMAND
} from 'lexical';

import TableActionMenu from './TableActionMenu.svelte';
import { writable } from 'svelte/store';
import { getEditor, getIsEditable } from '$lib/core/composerContext.js';
import { mergeRegister } from '@lexical/utils';
import ColorPickerDialog from '$lib/components/generic/colorpicker/ColorPickerDialog.svelte';
import { CAN_USE_DOM } from '@lexical/utils';

export default function TableActionMenuPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { anchorElem, cellMerge } = $$props;
		const editor = getEditor();
		const isEditable = getIsEditable();
		let menuButtonRef = null;
		let menuRootRef = null;
		const isMenuOpen = writable(false);
		let tableCellNode = null;

		const checkTableCellOverflow = (tableCellParentNodeDOM) => {
			const scrollableContainer = tableCellParentNodeDOM.closest('.PlaygroundEditorTheme__tableScrollableWrapper');

			if (scrollableContainer) {
				const containerRect = scrollableContainer.getBoundingClientRect();
				const cellRect = tableCellParentNodeDOM.getBoundingClientRect();

				// Calculate where the action button would be positioned (5px from right edge of cell)
				// Also account for the button width and table cell padding (8px)
				const actionButtonRight = cellRect.right - 5;

				const actionButtonLeft = actionButtonRight - 28; // 20px width + 8px padding

				// Only hide if the action button would overflow the container
				if (actionButtonRight > containerRect.right || actionButtonLeft < containerRect.left) {
					return true;
				}
			}

			return false;
		};

		const moveMenu = () => {
			const menu = menuButtonRef;
			const selection = getSelection();
			const nativeSelection = window.getSelection();
			const activeElement = document.activeElement;

			function disable() {
				if (menu) {
					menu.classList.remove('table-cell-action-button-container--active');
					menu.classList.add('table-cell-action-button-container--inactive');
				}

				tableCellNode = null;
			}

			if (selection == null || menu == null) {
				return disable();
			}

			const rootElement = editor.getRootElement();
			let tableObserver = null;
			let tableCellParentNodeDOM = null;

			if (isRangeSelection(selection) && rootElement !== null && nativeSelection !== null && rootElement.contains(nativeSelection.anchorNode)) {
				const tableCellNodeFromSelection = getTableCellNodeFromLexicalNode(selection.anchor.getNode());

				if (tableCellNodeFromSelection == null) {
					return disable();
				}

				tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey());

				if (tableCellParentNodeDOM == null || !tableCellNodeFromSelection.isAttached()) {
					return disable();
				}

				if (checkTableCellOverflow(tableCellParentNodeDOM)) {
					return disable();
				}

				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNodeFromSelection);
				const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

				if (!tableElement) {
					throw new Error('Expected to find tableElement in DOM');
				}

				tableObserver = getTableObserverFromTableElement(tableElement);
				tableCellNode = tableCellNodeFromSelection;
			} else if (isTableSelection(selection)) {
				const anchorNode = getTableCellNodeFromLexicalNode(selection.anchor.getNode());

				if (!isTableCellNode(anchorNode)) {
					throw new Error('TableSelection anchorNode must be a TableCellNode');
				}

				const tableNode = getTableNodeFromLexicalNodeOrThrow(anchorNode);
				const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

				if (!tableElement) {
					throw new Error('Expected to find tableElement in DOM');
				}

				tableObserver = getTableObserverFromTableElement(tableElement);
				tableCellParentNodeDOM = editor.getElementByKey(anchorNode.getKey());

				if (tableCellParentNodeDOM === null) {
					return disable();
				}

				if (checkTableCellOverflow(tableCellParentNodeDOM)) {
					return disable();
				}
			} else if (!activeElement) {
				return disable();
			}

			if (tableObserver === null || tableCellParentNodeDOM === null) {
				return disable();
			}

			const enabled = !tableObserver || !tableObserver.isSelecting;

			menu.classList.toggle('table-cell-action-button-container--active', enabled);
			menu.classList.toggle('table-cell-action-button-container--inactive', !enabled);

			if (enabled) {
				const tableCellRect = tableCellParentNodeDOM.getBoundingClientRect();
				const anchorRect = anchorElem.getBoundingClientRect();
				const top = tableCellRect.top - anchorRect.top;
				const left = tableCellRect.right - anchorRect.left;

				menu.style.transform = `translate(${left}px, ${top}px)`;
			}
		};

		// We call the $moveMenu callback every time the selection changes,
		// once up front, and once after each pointerup
		let prevTableCellDOM = tableCellNode;

		let colorPicker = void 0;

		if ($.store_get($$store_subs ??= {}, '$isEditable', isEditable)) {
			$$renderer.push(`<!--[0--><div class="table-cell-action-button-container">`);

			if (tableCellNode != null) {
				$$renderer.push(`<!--[0--><button type="button" class="table-cell-action-button chevron-down"><i class="chevron-down"></i></button> `);

				if ($.store_get($$store_subs ??= {}, '$isMenuOpen', isMenuOpen)) {
					$$renderer.push('<!--[0-->');

					TableActionMenu($$renderer, {
						contextRef: menuRootRef,
						setIsMenuOpen: (val) => $.store_set(isMenuOpen, val),
						onClose: () => $.store_set(isMenuOpen, false),
						_tableCellNode: tableCellNode,
						cellMerge,
						colorPicker
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (CAN_USE_DOM) {
				$$renderer.push('<!--[0-->');
				ColorPickerDialog($$renderer, { title: 'Cell background color', color: 'white' });
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