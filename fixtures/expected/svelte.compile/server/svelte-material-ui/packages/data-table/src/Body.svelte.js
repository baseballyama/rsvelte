import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Body($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let rows = [];
		const rowAccessorMap = new WeakMap();

		setContext('SMUI:data-table:row:header', false);

		setContext('SMUI:data-table:row:mount', (accessor) => {
			rows.push(accessor);
			rowAccessorMap.set(accessor.element, accessor);
		});

		setContext('SMUI:data-table:row:unmount', (accessor) => {
			const idx = rows.findIndex((a) => a === accessor);

			if (idx !== -1) {
				rows.splice(idx, 1);
			}

			rowAccessorMap.delete(accessor.element);
		});

		const SMUIDataTableBodyMount = getContext('SMUI:data-table:body:mount');
		const SMUIDataTableBodyUnmount = getContext('SMUI:data-table:body:unmount');

		onMount(() => {
			const accessor = {
				get rows() {
					return rows;
				},

				get orderedRows() {
					return getOrderedRows();
				}
			};

			SMUIDataTableBodyMount && SMUIDataTableBodyMount(accessor);

			return () => {
				SMUIDataTableBodyUnmount && SMUIDataTableBodyUnmount(accessor);
			};
		});

		function getOrderedRows() {
			return [...getElement().querySelectorAll('.mdc-data-table__row')].map((element) => rowAccessorMap.get(element)).filter((accessor) => accessor && accessor._smui_data_table_row_accessor);
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<tbody${$.attributes({
			class: $.clsx(classMap({ 'mdc-data-table__content': true, [className]: true })),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tbody>`);
		$.bind_props($$props, { getElement });
	});
}