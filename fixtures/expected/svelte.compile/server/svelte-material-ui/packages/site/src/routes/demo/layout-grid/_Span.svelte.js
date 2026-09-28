import * as $ from 'svelte/internal/server';
import LayoutGrid, { Cell } from '@smui/layout-grid';

export default function _Span($$renderer) {
	LayoutGrid($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(Array(2));

			for (let _i = 0, $$length = each_array.length; _i < $$length; _i++) {
				let _unused = each_array[_i];

				Cell($$renderer, {
					span: 6,
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo-cell svelte-1lcw5a5">Span 6</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_1 = $.ensure_array_like(Array(4));

			for (let _i = 0, $$length = each_array_1.length; _i < $$length; _i++) {
				let _unused = each_array_1[_i];

				Cell($$renderer, {
					span: 3,
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo-cell svelte-1lcw5a5">Span 3</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_2 = $.ensure_array_like(Array(6));

			for (let _i = 0, $$length = each_array_2.length; _i < $$length; _i++) {
				let _unused = each_array_2[_i];

				Cell($$renderer, {
					span: 2,
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo-cell svelte-1lcw5a5">Span 2</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_3 = $.ensure_array_like(Array(12));

			for (let _i = 0, $$length = each_array_3.length; _i < $$length; _i++) {
				let _unused = each_array_3[_i];

				Cell($$renderer, {
					span: 1,
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo-cell svelte-1lcw5a5">Span 1</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> `);

			Cell($$renderer, {
				span: 7,
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-1lcw5a5">Span 7</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Cell($$renderer, {
				span: 5,
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-1lcw5a5">Span 5</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Cell($$renderer, {
				spanDevices: { desktop: 6, tablet: 4, phone: 2 },
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-1lcw5a5" style="height: 80px;">Span 6 on desktop, 4 on tablet, 2 on phone (always half)</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}