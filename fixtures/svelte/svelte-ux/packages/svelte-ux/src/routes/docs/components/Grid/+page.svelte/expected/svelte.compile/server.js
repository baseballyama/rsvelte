import * as $ from 'svelte/internal/server';
import { Grid } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Columns</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				columns: 4,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Columns with gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				columns: 4,
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Auto Columns</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				autoColumns: '160px',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Template</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				template: 'auto 1fr auto',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}