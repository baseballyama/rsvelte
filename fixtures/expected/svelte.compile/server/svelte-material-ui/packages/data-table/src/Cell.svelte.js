import * as $ from 'svelte/internal/server';
import { onMount, getContext, setContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';

let counter = 0;

export default function Cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let header = getContext('SMUI:data-table:row:header');

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether to apply numeric column styling.
		 */
		/**
		 * Whether this cell contains the checkbox to select.
		 */
		/**
		 * The column ID for the column this cell is a header for.
		 *
		 * You only need this on sortable columns and you only need to put it on the
		 * cell in the header.
		 */
		/**
		 * Whether sorting is enabled on the column this cell is a header for.
		 *
		 * This will default to true if the data table is sortable.
		 */
		let {
			use = [],
			class: className = '',
			numeric = false,
			checkbox = false,
			columnId = header
				? 'SMUI-data-table-column-' + counter++
				: 'SMUI-data-table-unused',
			sortable = getContext('SMUI:data-table:sortable'),
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalClasses = {};
		let internalAttrs = {};
		let sort = getContext('SMUI:data-table:sort');
		let sortDirection = getContext('SMUI:data-table:sortDirection');
		let sortAscendingAriaLabel = getContext('SMUI:data-table:sortAscendingAriaLabel');
		let sortDescendingAriaLabel = getContext('SMUI:data-table:sortDescendingAriaLabel');

		if (sortable) {
			setContext('SMUI:label:context', 'data-table:sortable-header-cell');
			setContext('SMUI:icon-button:context', 'data-table:sortable-header-cell');
			setContext('SMUI:icon-button:aria-describedby', columnId + '-status-label');
		}

		const SMUIDataTableCellMount = getContext('SMUI:data-table:cell:mount');
		const SMUIDataTableCellUnmount = getContext('SMUI:data-table:cell:unmount');

		onMount(() => {
			const accessor = header
				? {
					_smui_data_table_header_cell_accessor: true,
					get element() {
						return getElement();
					},

					get columnId() {
						return columnId;
					},
					addClass,
					removeClass,
					getAttr,
					addAttr
				}
				: {
					_smui_data_table_header_cell_accessor: false,
					get element() {
						return getElement();
					},

					get columnId() {
						return undefined;
					},
					addClass,
					removeClass,
					getAttr,
					addAttr
				};

			SMUIDataTableCellMount && SMUIDataTableCellMount(accessor);

			return () => {
				SMUIDataTableCellUnmount && SMUIDataTableCellUnmount(accessor);
			};
		});

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

		function getAttr(name) {
			return name in internalAttrs
				? internalAttrs[name] ?? null
				: getElement().getAttribute(name);
		}

		function addAttr(name, value) {
			if (internalAttrs[name] !== value) {
				internalAttrs[name] = value;
			}
		}

		function notifyHeaderChange(event) {
			dispatch(getElement(), 'SMUIDataTableHeaderCheckboxChange', event);
		}

		function notifyBodyChange(event) {
			dispatch(getElement(), 'SMUIDataTableBodyCheckboxChange', event);
		}

		function getElement() {
			return element;
		}

		if (header) {
			$$renderer.push(`<!--[0--><th${$.attributes({
				class: $.clsx(classMap({
					'mdc-data-table__header-cell': true,
					'mdc-data-table__header-cell--numeric': numeric,
					'mdc-data-table__header-cell--checkbox': checkbox,
					'mdc-data-table__header-cell--with-sort': sortable,
					'mdc-data-table__header-cell--sorted': sortable && $.store_get($$store_subs ??= {}, '$sort', sort) === columnId,
					...internalClasses,
					[className]: true
				})),
				role: 'columnheader',
				scope: 'col',
				'data-column-id': columnId,
				'aria-sort': sortable
					? $.store_get($$store_subs ??= {}, '$sort', sort) === columnId
						? $.store_get($$store_subs ??= {}, '$sortDirection', sortDirection)
						: 'none'
					: undefined,
				...internalAttrs,
				...restProps
			})}>`);

			if (sortable) {
				$$renderer.push(`<!--[0--><div class="mdc-data-table__header-cell-wrapper">`);
				children?.($$renderer);

				$$renderer.push(`<!----> <div class="mdc-data-table__sort-status-label" aria-hidden="true"${$.attr('id', `${$.stringify(columnId)}-status-label`)}>${$.escape($.store_get($$store_subs ??= {}, '$sort', sort) === columnId
					? $.store_get($$store_subs ??= {}, '$sortDirection', sortDirection) === 'ascending' ? sortAscendingAriaLabel : sortDescendingAriaLabel
					: '')}</div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></th>`);
		} else {
			$$renderer.push(`<!--[-1--><td${$.attributes({
				class: $.clsx(classMap({
					'mdc-data-table__cell': true,
					'mdc-data-table__cell--numeric': numeric,
					'mdc-data-table__cell--checkbox': checkbox,
					...internalClasses,
					[className]: true
				})),
				...internalAttrs,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></td>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}