import * as $ from 'svelte/internal/server';
import { onMount, getContext, setContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';

let counter = 0;

export default function Row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An optional unique row ID.
		 *
		 * If none is provided, one will be generated.
		 */
		let {
			use = [],
			class: className = '',
			rowId = 'SMUI-data-table-row-' + counter++,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let checkbox = void 0;
		let internalClasses = {};
		let internalAttrs = {};
		let header = getContext('SMUI:data-table:row:header');
		const SMUICheckboxMount = getContext('SMUI:checkbox:mount');

		setContext('SMUI:checkbox:mount', (accessor) => {
			checkbox = accessor;
			SMUICheckboxMount && SMUICheckboxMount(accessor);
		});

		const SMUICheckboxUnount = getContext('SMUI:checkbox:unmount');

		setContext('SMUI:checkbox:unmount', (accessor) => {
			checkbox = undefined;
			SMUICheckboxUnount && SMUICheckboxUnount(accessor);
		});

		const SMUIDataTableRowMount = getContext('SMUI:data-table:row:mount');
		const SMUIDataTableRowUnmount = getContext('SMUI:data-table:row:unmount');

		onMount(() => {
			const accessor = header
				? {
					_smui_data_table_row_accessor: false,
					get element() {
						return getElement();
					},

					get checkbox() {
						return checkbox;
					},

					get rowId() {
						return undefined;
					},

					get selected() {
						return (checkbox && checkbox.checked) ?? false;
					},
					addClass,
					removeClass,
					getAttr,
					addAttr
				}
				: {
					_smui_data_table_row_accessor: true,
					get element() {
						return getElement();
					},

					get checkbox() {
						return checkbox;
					},

					get rowId() {
						return rowId;
					},

					get selected() {
						return (checkbox && checkbox.checked) ?? false;
					},
					addClass,
					removeClass,
					getAttr,
					addAttr
				};

			SMUIDataTableRowMount && SMUIDataTableRowMount(accessor);

			return () => {
				SMUIDataTableRowUnmount && SMUIDataTableRowUnmount(accessor);
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

		function notifyHeaderClick(event) {
			dispatch(getElement(), 'SMUIDataTableHeaderClick', event);
		}

		function notifyRowClick(event) {
			dispatch(getElement(), 'SMUIDataTableRowClick', { rowId, target: event.target });
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<tr${$.attributes({
			class: $.clsx(classMap({
				'mdc-data-table__header-row': header,
				'mdc-data-table__row': !header,
				'mdc-data-table__row--selected': !header && checkbox && checkbox.checked,
				...internalClasses,
				[className]: true
			})),
			'aria-selected': checkbox ? checkbox.checked ? 'true' : 'false' : undefined,
			...internalAttrs,
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
		$.bind_props($$props, { getElement });
	});
}