import * as $ from 'svelte/internal/server';
import LayoutGrid, { Cell } from '@smui/layout-grid';

export default function _Align($$renderer) {
	LayoutGrid($$renderer, {
		align: 'right',
		style: 'border: 1px solid var(--mdc-theme-secondary, #333);',
		children: ($$renderer) => {
			Cell($$renderer, {
				span: 1,
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-ile528" style="height: 120px;">Tall Cell</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Cell($$renderer, {
				align: 'top',
				span: 1,
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-ile528">Align Top</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Cell($$renderer, {
				align: 'middle',
				span: 1,
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-ile528">Align Middle</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Cell($$renderer, {
				align: 'bottom',
				span: 1,
				children: ($$renderer) => {
					$$renderer.push(`<div class="demo-cell svelte-ile528">Align Bottom</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}