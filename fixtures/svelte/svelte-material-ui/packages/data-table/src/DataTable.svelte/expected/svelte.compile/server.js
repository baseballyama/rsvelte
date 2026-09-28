import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { ponyfill } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import { MDCDataTableFoundation } from './mdc';

export default function DataTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		let {
			use = [],
			class: className = '',
			stickyHeader = false,
			sortable = false,
			sort = null,
			sortDirection = 'ascending',
			sortAscendingAriaLabel = 'sorted, ascending',
			sortDescendingAriaLabel = 'sorted, descending',
			container$use = [],
			container$class = '',
			table$use = [],
			table$class = '',
			children,
			progress,
			paginate,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let container;
		let header = void 0;
		let body = void 0;
		let internalClasses = {};
		let progressIndicatorStyles = { height: 'auto', top: 'initial' };
		let addLayoutListener = getContext('SMUI:addLayoutListener');
		let removeLayoutListener;
		let postMount = false;
		let progressClosed = writable(false);
		let sortStore = writable(sort);
		let sortDirectionStore = writable(sortDirection);

		setContext('SMUI:checkbox:context', 'data-table');
		setContext('SMUI:linear-progress:context', 'data-table');
		setContext('SMUI:linear-progress:closed', progressClosed);
		setContext('SMUI:data-table:sortable', sortable);
		setContext('SMUI:data-table:sort', sortStore);
		setContext('SMUI:data-table:sortDirection', sortDirectionStore);
		setContext('SMUI:data-table:sortAscendingAriaLabel', sortAscendingAriaLabel);
		setContext('SMUI:data-table:sortDescendingAriaLabel', sortDescendingAriaLabel);

		if (addLayoutListener) {
			removeLayoutListener = addLayoutListener(layout);
		}

		let previousProgressClosed = undefined;

		setContext('SMUI:checkbox:mount', () => {
			if (instance && postMount) {
				instance.layout();
			}
		});

		setContext('SMUI:data-table:header:mount', (accessor) => {
			header = accessor;
		});

		setContext('SMUI:data-table:header:unmount', () => {
			header = undefined;
		});

		setContext('SMUI:data-table:body:mount', (accessor) => {
			body = accessor;
		});

		setContext('SMUI:data-table:body:unmount', () => {
			body = undefined;
		});

		onMount(() => {
			instance = new MDCDataTableFoundation({
				addClass,
				removeClass,
				getHeaderCellElements: () => header?.cells.map((accessor) => accessor.element) ?? [],
				getHeaderCellCount: () => header?.cells.length ?? 0,
				getAttributeByHeaderCellIndex: (index, name) => {
					return header?.orderedCells[index].getAttr(name) ?? null;
				},

				setAttributeByHeaderCellIndex: (index, name, value) => {
					header?.orderedCells[index].addAttr(name, value);
				},

				setClassNameByHeaderCellIndex: (index, className) => {
					header?.orderedCells[index].addClass(className);
				},

				removeClassNameByHeaderCellIndex: (index, className) => {
					header?.orderedCells[index].removeClass(className);
				},

				notifySortAction: (data) => {
					sort = data.columnId;
					sortDirection = data.sortValue;
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
					progressIndicatorStyles = styles;
				},

				addClassAtRowIndex: (rowIndex, className) => {
					body?.orderedRows[rowIndex].addClass(className);
				},
				getRowCount: () => body?.rows.length ?? 0,
				getRowElements: () => body?.rows.map((accessor) => accessor.element) ?? [],
				getRowIdAtIndex: (rowIndex) => body?.orderedRows[rowIndex].rowId ?? null,
				getRowIndexByChildElement: (el) => {
					return body?.orderedRows.map((accessor) => accessor.element).indexOf(closest(el, '.mdc-data-table__row')) ?? -1;
				},
				getSelectedRowCount: () => body?.rows.filter((accessor) => accessor.selected).length ?? 0,
				isCheckboxAtRowIndexChecked: (rowIndex) => {
					const checkbox = body?.orderedRows[rowIndex].checkbox;

					if (checkbox) {
						return checkbox.checked;
					}

					return false;
				},

				isHeaderRowCheckboxChecked: () => {
					const checkbox = header?.checkbox;

					if (checkbox) {
						return checkbox.checked;
					}

					return false;
				},
				isRowsSelectable: () => !!getElement().querySelector('.mdc-data-table__row-checkbox') || !!getElement().querySelector('.mdc-data-table__header-row-checkbox'),
				notifyRowSelectionChanged: (data) => {
					const row = body?.orderedRows[data.rowIndex];

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
					body?.orderedRows[rowIndex].removeClass(className);
				},

				setAttributeAtRowIndex: (rowIndex, name, value) => {
					body?.orderedRows[rowIndex].addAttr(name, value);
				},

				setHeaderRowCheckboxChecked: (checked) => {
					const checkbox = header?.checkbox;

					if (checkbox) {
						checkbox.checked = checked;
					}
				},
				setHeaderRowCheckboxIndeterminate,
				setRowCheckboxCheckedAtIndex: (rowIndex, checked) => {
					const checkbox = body?.orderedRows[rowIndex].checkbox;

					if (checkbox) {
						checkbox.checked = checked;
					}
				},

				setSortStatusLabelByHeaderCellIndex: (_columnIndex, _sortValue) => {
					// Handled automatically.
				}
			});

			instance.init();
			instance.layout();
			postMount = true;

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		onDestroy(() => {
			if (removeLayoutListener) {
				removeLayoutListener();
			}
		});

		function handleBodyCheckboxChange(event) {
			if (instance) {
				instance.handleRowCheckboxChange(event);
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
			const checkbox = header?.checkbox;

			if (checkbox) {
				checkbox.indeterminate = indeterminate;
			}
		}

		function handleHeaderRowClick(event) {
			if (!instance || !event.detail.target) {
				return;
			}

			const headerCell = closest(event.detail.target, '.mdc-data-table__header-cell--with-sort');

			if (headerCell) {
				handleSortAction(headerCell);
			}
		}

		function handleRowClick(event) {
			if (!instance || !event.detail.target) {
				return;
			}

			const row = closest(event.detail.target, '.mdc-data-table__row');

			if (row && instance) {
				instance.handleRowClick({ rowId: event.detail.rowId, row });
			}
		}

		function handleSortAction(headerCell) {
			const orderedCells = header?.orderedCells ?? [];
			const columnIndex = orderedCells.map((accessor) => accessor.element).indexOf(headerCell);

			if (columnIndex === -1) {
				return;
			}

			const columnId = orderedCells[columnIndex].columnId ?? null;

			instance?.handleSortAction({ columnId, columnIndex, headerCell });
		}

		function layout() {
			return instance?.layout();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-data-table': true,
				'mdc-data-table--sticky-header': stickyHeader,
				...internalClasses,
				[className]: true
			})),
			...exclude(restProps, ['container$', 'table$'])
		})}><div${$.attributes({
			class: $.clsx(classMap({
				'mdc-data-table__table-container': true,
				[container$class]: true
			})),
			...prefixFilter(restProps, 'container$')
		})}><table${$.attributes({
			class: $.clsx(classMap({ 'mdc-data-table__table': true, [table$class]: true })),
			...prefixFilter(restProps, 'table$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div> `);

		if (progress) {
			$$renderer.push(`<!--[0--><div class="mdc-data-table__progress-indicator"${$.attr_style(Object.entries(progressIndicatorStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}><div class="mdc-data-table__scrim"></div> `);
			progress?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		paginate?.($$renderer);
		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { sort, sortDirection, layout, getElement });
	});
}