import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<button type="button" class="table-cell-action-button chevron-down"><i class="chevron-down"></i></button> <!>`, 1);
var root_1 = $.from_html(`<div class="table-cell-action-button-container"><!></div> <!>`, 1);

export default function TableActionMenuPlugin($$anchor, $$props) {
	$.push($$props, true);

	const $isMenuOpen = () => $.store_get(isMenuOpen, '$isMenuOpen', $$stores);
	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const isEditable = getIsEditable();
	let menuButtonRef = $.state(null);
	let menuRootRef = $.state(null);
	const isMenuOpen = writable(false);
	let tableCellNode = $.state(null);

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
		const menu = $.get(menuButtonRef);
		const selection = getSelection();
		const nativeSelection = window.getSelection();
		const activeElement = document.activeElement;

		function disable() {
			if (menu) {
				menu.classList.remove('table-cell-action-button-container--active');
				menu.classList.add('table-cell-action-button-container--inactive');
			}

			$.set(tableCellNode, null);
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
			$.set(tableCellNode, tableCellNodeFromSelection, true);
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
			const anchorRect = $$props.anchorElem.getBoundingClientRect();
			const top = tableCellRect.top - anchorRect.top;
			const left = tableCellRect.right - anchorRect.left;

			menu.style.transform = `translate(${left}px, ${top}px)`;
		}
	};

	$.user_effect(() => {
		// We call the $moveMenu callback every time the selection changes,
		// once up front, and once after each pointerup
		let timeoutId = undefined;

		const callback = () => {
			timeoutId = undefined;
			editor.getEditorState().read(moveMenu);
		};

		const delayedCallback = () => {
			if (timeoutId === undefined) {
				timeoutId = setTimeout(callback, 0);
			}

			return false;
		};

		return mergeRegister(
			editor.registerUpdateListener(delayedCallback),
			editor.registerCommand(SELECTION_CHANGE_COMMAND, delayedCallback, COMMAND_PRIORITY_CRITICAL),
			editor.registerRootListener((rootElement, prevRootElement) => {
				if (prevRootElement) {
					prevRootElement.removeEventListener('pointerup', delayedCallback);
				}

				if (rootElement) {
					rootElement.addEventListener('pointerup', delayedCallback);
					delayedCallback();
				}
			}),
			() => clearTimeout(timeoutId)
		);
	});

	let prevTableCellDOM = $.state($.proxy($.get(tableCellNode)));

	$.user_effect(() => {
		if ($.get(prevTableCellDOM) === $.get(tableCellNode)) return;

		$.store_set(isMenuOpen, false);
		$.set(prevTableCellDOM, $.get(tableCellNode), true);
	});

	let colorPicker = $.state(void 0);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root();
					var button = $.first_child(fragment_2);

					$.bind_this(button, ($$value) => $.set(menuRootRef, $$value), () => $.get(menuRootRef));

					var node_2 = $.sibling(button, 2);

					{
						var consequent = ($$anchor) => {
							TableActionMenu($$anchor, {
								get contextRef() {
									return $.get(menuRootRef);
								},
								setIsMenuOpen: (val) => $.store_set(isMenuOpen, val),
								onClose: () => $.store_set(isMenuOpen, false),
								get _tableCellNode() {
									return $.get(tableCellNode);
								},

								get cellMerge() {
									return $$props.cellMerge;
								},

								get colorPicker() {
									return $.get(colorPicker);
								}
							});
						};

						$.if(node_2, ($$render) => {
							if ($isMenuOpen()) $$render(consequent);
						});
					}

					$.delegated('click', button, (e) => {
						e.stopPropagation();
						$.store_set(isMenuOpen, !$isMenuOpen());
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(tableCellNode) != null) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(menuButtonRef, $$value), () => $.get(menuButtonRef));

			var node_3 = $.sibling(div, 2);

			{
				var consequent_2 = ($$anchor) => {
					$.bind_this(ColorPickerDialog($$anchor, { title: 'Cell background color', color: 'white' }), ($$value) => $.set(colorPicker, $$value, true), () => $.get(colorPicker));
				};

				$.if(node_3, ($$render) => {
					if (CAN_USE_DOM) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($isEditable()) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);