import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { ponyfill } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import { MDCDataTableFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'stickyHeader',
	'sortable',
	'sort',
	'sortDirection',
	'sortAscendingAriaLabel',
	'sortDescendingAriaLabel',
	'container$use',
	'container$class',
	'table$use',
	'table$class',
	'children',
	'progress',
	'paginate'
]);

var root = $.from_html(`<div class="mdc-data-table__progress-indicator"><div class="mdc-data-table__scrim"></div> <!></div>`);
var root_1 = $.from_html(`<div><div><table><!></table></div> <!> <!></div>`);

export default function DataTable($$anchor, $$props) {
	$.push($$props, true);

	const $sortStore = () => $.store_get(sortStore, '$sortStore', $$stores);
	const $sortDirectionStore = () => $.store_get(sortDirectionStore, '$sortDirectionStore', $$stores);
	const $progressClosed = () => $.store_get(progressClosed, '$progressClosed', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { closest } = ponyfill;

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether to use sticky header styles.
	 */
	/**
	 * Whether the data table is sortable.
	 *
	 * (You handle sorting on your own with a handler on the SMUIDataTableSorted
	 * event, but the interactions are available to the user.)
	 */
	/**
	 * The columnId of the currently sorted column.
	 */
	/**
	 * The direction the rows are sorted in.
	 */
	/**
	 * An ARIA label to indicate sorted status when sort is ascending.
	 */
	/**
	 * An ARIA label to indicate sorted status when sort is descending.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A spot for the progress indicator.
	 */
	/**
	 * A spot for the pagination components.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		stickyHeader = $.prop($$props, 'stickyHeader', 3, false),
		sortable = $.prop($$props, 'sortable', 3, false),
		sort = $.prop($$props, 'sort', 15, null),
		sortDirection = $.prop($$props, 'sortDirection', 15, 'ascending'),
		sortAscendingAriaLabel = $.prop($$props, 'sortAscendingAriaLabel', 3, 'sorted, ascending'),
		sortDescendingAriaLabel = $.prop($$props, 'sortDescendingAriaLabel', 3, 'sorted, descending'),
		container$use = $.prop($$props, 'container$use', 19, () => []),
		container$class = $.prop($$props, 'container$class', 3, ''),
		table$use = $.prop($$props, 'table$use', 19, () => []),
		table$class = $.prop($$props, 'table$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let container;
	let header = $.state(void 0);
	let body = $.state(void 0);
	let internalClasses = $.proxy({});
	let progressIndicatorStyles = $.state($.proxy({ height: 'auto', top: 'initial' }));
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;
	let postMount = false;
	let progressClosed = writable(false);
	let sortStore = writable(sort());

	$.user_effect(() => {
		$.store_set(sortStore, sort());
	});

	let sortDirectionStore = writable(sortDirection());

	$.user_effect(() => {
		$.store_set(sortDirectionStore, sortDirection());
	});

	setContext('SMUI:checkbox:context', 'data-table');
	setContext('SMUI:linear-progress:context', 'data-table');
	setContext('SMUI:linear-progress:closed', progressClosed);
	setContext('SMUI:data-table:sortable', sortable());
	setContext('SMUI:data-table:sort', sortStore);
	setContext('SMUI:data-table:sortDirection', sortDirectionStore);
	setContext('SMUI:data-table:sortAscendingAriaLabel', sortAscendingAriaLabel());
	setContext('SMUI:data-table:sortDescendingAriaLabel', sortDescendingAriaLabel());

	if (addLayoutListener) {
		removeLayoutListener = addLayoutListener(layout);
	}

	let previousProgressClosed = undefined;

	$.user_effect(() => {
		if (!!$$props.progress && $.get(instance) && previousProgressClosed !== $progressClosed()) {
			previousProgressClosed = $progressClosed();

			if ($progressClosed()) {
				$.get(instance).hideProgress();
			} else {
				$.get(instance).showProgress();
			}
		}
	});

	setContext('SMUI:checkbox:mount', () => {
		if ($.get(instance) && postMount) {
			$.get(instance).layout();
		}
	});

	setContext('SMUI:data-table:header:mount', (accessor) => {
		$.set(header, accessor, true);
	});

	setContext('SMUI:data-table:header:unmount', () => {
		$.set(header, undefined);
	});

	setContext('SMUI:data-table:body:mount', (accessor) => {
		$.set(body, accessor, true);
	});

	setContext('SMUI:data-table:body:unmount', () => {
		$.set(body, undefined);
	});

	onMount(() => {
		$.set(
			instance,
			new MDCDataTableFoundation({
				addClass,
				removeClass,
				getHeaderCellElements: () => $.get(header)?.cells.map((accessor) => accessor.element) ?? [],
				getHeaderCellCount: () => $.get(header)?.cells.length ?? 0,
				getAttributeByHeaderCellIndex: (index, name) => {
					return $.get(header)?.orderedCells[index].getAttr(name) ?? null;
				},

				setAttributeByHeaderCellIndex: (index, name, value) => {
					$.get(header)?.orderedCells[index].addAttr(name, value);
				},

				setClassNameByHeaderCellIndex: (index, className) => {
					$.get(header)?.orderedCells[index].addClass(className);
				},

				removeClassNameByHeaderCellIndex: (index, className) => {
					$.get(header)?.orderedCells[index].removeClass(className);
				},

				notifySortAction: (data) => {
					sort(data.columnId);
					sortDirection(data.sortValue);
					dispatch(getElement(), 'SMUIDataTableSorted', data);
				},
				getTableContainerHeight: () => container.getBoundingClientRect().height,
				getTableHeaderHeight: () => {
					const tableHeader = getElement().querySelector('.mdc-data-table__header-row');

					if (!tableHeader) {
						throw new Error('MDCDataTable: Table header element not found.');
					}

					return tableHeader.getBoundingClientRect().height;
				},

				setProgressIndicatorStyles: (styles) => {
					$.set(progressIndicatorStyles, styles, true);
				},

				addClassAtRowIndex: (rowIndex, className) => {
					$.get(body)?.orderedRows[rowIndex].addClass(className);
				},
				getRowCount: () => $.get(body)?.rows.length ?? 0,
				getRowElements: () => $.get(body)?.rows.map((accessor) => accessor.element) ?? [],
				getRowIdAtIndex: (rowIndex) => $.get(body)?.orderedRows[rowIndex].rowId ?? null,
				getRowIndexByChildElement: (el) => {
					return $.get(body)?.orderedRows.map((accessor) => accessor.element).indexOf(closest(el, '.mdc-data-table__row')) ?? -1;
				},
				getSelectedRowCount: () => $.get(body)?.rows.filter((accessor) => accessor.selected).length ?? 0,
				isCheckboxAtRowIndexChecked: (rowIndex) => {
					const checkbox = $.get(body)?.orderedRows[rowIndex].checkbox;

					if (checkbox) {
						return checkbox.checked;
					}

					return false;
				},

				isHeaderRowCheckboxChecked: () => {
					const checkbox = $.get(header)?.checkbox;

					if (checkbox) {
						return checkbox.checked;
					}

					return false;
				},
				isRowsSelectable: () => !!getElement().querySelector('.mdc-data-table__row-checkbox') || !!getElement().querySelector('.mdc-data-table__header-row-checkbox'),
				notifyRowSelectionChanged: (data) => {
					const row = $.get(body)?.orderedRows[data.rowIndex];

					if (row) {
						dispatch(getElement(), 'SMUIDataTableSelectionChanged', {
							row: row.element,
							rowId: row.rowId,
							rowIndex: data.rowIndex,
							selected: data.selected
						});
					}
				},

				notifySelectedAll: () => {
					setHeaderRowCheckboxIndeterminate(false);
					dispatch(getElement(), 'SMUIDataTableSelectedAll');
				},

				notifyUnselectedAll: () => {
					setHeaderRowCheckboxIndeterminate(false);
					dispatch(getElement(), 'SMUIDataTableUnselectedAll');
				},
				notifyRowClick: (detail) => dispatch(getElement(), 'SMUIDataTableClickRow', detail),
				registerHeaderRowCheckbox: () => {
					// Handled automatically.
				},

				registerRowCheckboxes: () => {
					// Handled automatically.
				},

				removeClassAtRowIndex: (rowIndex, className) => {
					$.get(body)?.orderedRows[rowIndex].removeClass(className);
				},

				setAttributeAtRowIndex: (rowIndex, name, value) => {
					$.get(body)?.orderedRows[rowIndex].addAttr(name, value);
				},

				setHeaderRowCheckboxChecked: (checked) => {
					const checkbox = $.get(header)?.checkbox;

					if (checkbox) {
						checkbox.checked = checked;
					}
				},
				setHeaderRowCheckboxIndeterminate,
				setRowCheckboxCheckedAtIndex: (rowIndex, checked) => {
					const checkbox = $.get(body)?.orderedRows[rowIndex].checkbox;

					if (checkbox) {
						checkbox.checked = checked;
					}
				},

				setSortStatusLabelByHeaderCellIndex: (_columnIndex, _sortValue) => {
					// Handled automatically.
				}
			}),
			true
		);

		$.get(instance).init();
		$.get(instance).layout();
		postMount = true;

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	onDestroy(() => {
		if (removeLayoutListener) {
			removeLayoutListener();
		}
	});

	function handleBodyCheckboxChange(event) {
		if ($.get(instance)) {
			$.get(instance).handleRowCheckboxChange(event);
		}
	}

	function addClass(className) {
		if (!internalClasses[className]) {
			internalClasses[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in internalClasses) || internalClasses[className]) {
			internalClasses[className] = false;
		}
	}

	function setHeaderRowCheckboxIndeterminate(indeterminate) {
		const checkbox = $.get(header)?.checkbox;

		if (checkbox) {
			checkbox.indeterminate = indeterminate;
		}
	}

	function handleHeaderRowClick(event) {
		if (!$.get(instance) || !event.detail.target) {
			return;
		}

		const headerCell = closest(event.detail.target, '.mdc-data-table__header-cell--with-sort');

		if (headerCell) {
			handleSortAction(headerCell);
		}
	}

	function handleRowClick(event) {
		if (!$.get(instance) || !event.detail.target) {
			return;
		}

		const row = closest(event.detail.target, '.mdc-data-table__row');

		if (row && $.get(instance)) {
			$.get(instance).handleRowClick({ rowId: event.detail.rowId, row });
		}
	}

	function handleSortAction(headerCell) {
		const orderedCells = $.get(header)?.orderedCells ?? [];
		const columnIndex = orderedCells.map((accessor) => accessor.element).indexOf(headerCell);

		if (columnIndex === -1) {
			return;
		}

		const columnId = orderedCells[columnIndex].columnId ?? null;

		$.get(instance)?.handleSortAction({ columnId, columnIndex, headerCell });
	}

	function layout() {
		return $.get(instance)?.layout();
	}

	function getElement() {
		return element;
	}

	var $$exports = { layout, getElement };
	var div = root_1();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleHeaderRowCheckboxChange();
		}

		$$props.onSMUIDataTableHeaderCheckboxChange?.(e);
	};

	var event_handler_1 = (e) => {
		handleHeaderRowClick(e);
		$$props.onSMUIDataTableHeaderClick?.(e);
	};

	var event_handler_2 = (e) => {
		handleRowClick(e);
		$$props.onSMUIDataTableRowClick?.(e);
	};

	var event_handler_3 = (e) => {
		handleBodyCheckboxChange(e);
		$$props.onSMUIDataTableBodyCheckboxChange?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			...$1,
			onSMUIDataTableHeaderCheckboxChange: event_handler,
			onSMUIDataTableHeaderClick: event_handler_1,
			onSMUIDataTableRowClick: event_handler_2,
			onSMUIDataTableBodyCheckboxChange: event_handler_3
		}),
		[
			() => classMap({
				'mdc-data-table': true,
				'mdc-data-table--sticky-header': stickyHeader(),
				...internalClasses,
				[className()]: true
			}),
			() => exclude(restProps, ['container$', 'table$'])
		]
	);

	var div_1 = $.child(div);

	$.attribute_effect(div_1, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-data-table__table-container': true,
			[container$class()]: true
		}),
		() => prefixFilter(restProps, 'container$')
	]);

	var table = $.child(div_1);

	$.attribute_effect(table, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({ 'mdc-data-table__table': true, [table$class()]: true }),
		() => prefixFilter(restProps, 'table$')
	]);

	var node = $.child(table);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(table);
	$.action(table, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), table$use);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => container = $$value, () => container);
	$.action(div_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), container$use);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.sibling($.child(div_2), 2);

			$.snippet(node_2, () => $$props.progress ?? $.noop);
			$.reset(div_2);

			$.template_effect(($0) => $.set_style(div_2, $0), [
				() => Object.entries($.get(progressIndicatorStyles)).map(([name, value]) => `${name}: ${value};`).join(' ')
			]);

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($$props.progress) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	$.snippet(node_3, () => $$props.paginate ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}