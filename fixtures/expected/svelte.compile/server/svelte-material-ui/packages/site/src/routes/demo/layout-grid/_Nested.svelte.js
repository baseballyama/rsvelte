import * as $ from 'svelte/internal/server';
import LayoutGrid, { Cell, InnerGrid } from '@smui/layout-grid';

export default function _Nested($$renderer) {
	LayoutGrid($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(Array(9));

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _unused = each_array[i];

				Cell($$renderer, {
					children: ($$renderer) => {
						InnerGrid($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(Array(3));

								for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
									let _unused = each_array_1[j];

									Cell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="demo-cell svelte-6ibw1k">Cell ${$.escape(i + 1)}, ${$.escape(j + 1)}</div>`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}