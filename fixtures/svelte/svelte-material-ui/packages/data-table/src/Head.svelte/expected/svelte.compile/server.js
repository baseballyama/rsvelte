import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { useActions } from '@smui/common/internal';

export default function Head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		let { use = [], children, $$slots, $$events, ...restProps } = $$props;

		let element;
		let checkbox = void 0;
		let cells = [];
		const cellAccessorMap = new WeakMap();

		setContext('SMUI:data-table:row:header', true);

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

		setContext('SMUI:data-table:cell:mount', (accessor) => {
			cells.push(accessor);
			cellAccessorMap.set(accessor.element, accessor);
		});

		setContext('SMUI:data-table:cell:unmount', (accessor) => {
			const idx = cells.findIndex((a) => a === accessor);

			if (idx !== -1) {
				cells.splice(idx, 1);
			}

			cellAccessorMap.delete(accessor.element);
		});

		const SMUIDataTableHeaderMount = getContext('SMUI:data-table:header:mount');
		const SMUIDataTableHeaderUnmount = getContext('SMUI:data-table:header:unmount');

		onMount(() => {
			const accessor = {
				get cells() {
					return cells;
				},

				get orderedCells() {
					return getOrderedCells();
				},

				get checkbox() {
					return checkbox;
				}
			};

			SMUIDataTableHeaderMount && SMUIDataTableHeaderMount(accessor);

			return () => {
				SMUIDataTableHeaderUnmount && SMUIDataTableHeaderUnmount(accessor);
			};
		});

		function getOrderedCells() {
			return [
				...getElement().querySelectorAll('.mdc-data-table__header-cell')
			].map((element) => cellAccessorMap.get(element)).filter((accessor) => accessor && accessor._smui_data_table_header_cell_accessor);
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<thead${$.attributes({ ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></thead>`);
		$.bind_props($$props, { getElement });
	});
}