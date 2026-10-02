import * as $ from 'svelte/internal/server';
import deepEqual from 'deep-equal';
import { onDestroy, onMount } from 'svelte';
import ColumnItem from '../columns/columnItem.svelte';

export default function Edit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			column,
			row = null,
			onChange = null,
			onRevert = null,
			noInlineEdit = false,
			openSideSheet = null,
			onRowStructureUpdate = null
		} = $$props;

		let original;
		let wrapperEl;

		onMount(() => {
			original = structuredClone(row);

			if (noInlineEdit) {
				openSideSheet?.();

				return;
			}

			const trigger = wrapperEl.querySelector('button.input');

			if (trigger) {
				trigger.click();
			}
		});

		/**
		 * fire on `onDestroy` because at this point,
		 * the cell editor slot fragment is closed and enter was hit!
		 */
		onDestroy(async () => {
			const hasChanged = !deepEqual(original, row);

			if (hasChanged && onRowStructureUpdate) {
				const accepted = await onRowStructureUpdate(row);

				if (!accepted) {
					row = original;
					onRevert?.(original);
				}
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_style('', { width: '100%' })}>`);

			ColumnItem($$renderer, {
				column,
				editing: true,
				fromSpreadsheet: true,
				label: undefined,
				get formValues() {
					return row;
				},

				set formValues($$value) {
					row = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { row });
	});
}