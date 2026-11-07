import * as $ from 'svelte/internal/server';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Columns</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-4"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Columns with gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-4 gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Auto Columns</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Template</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-[auto,1fr,auto] gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}