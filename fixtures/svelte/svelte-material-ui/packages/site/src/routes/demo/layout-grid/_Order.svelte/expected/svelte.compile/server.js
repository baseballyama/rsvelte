import * as $ from 'svelte/internal/server';
import LayoutGrid, { Cell } from '@smui/layout-grid';

export default function _Order($$renderer) {
	LayoutGrid($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(Array(9));

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _unused = each_array[i];

				Cell($$renderer, {
					order: 10 - i,
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo-cell svelte-1819ccx">Cell ${$.escape(i + 1)}</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}