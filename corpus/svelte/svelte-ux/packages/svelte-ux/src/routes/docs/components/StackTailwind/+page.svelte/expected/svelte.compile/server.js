import * as $ from 'svelte/internal/server';
import { mdiFilterVariant } from '@mdi/js';
import { Button, SectionDivider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-flow-col"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-flow-col gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Justify</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-flow-col justify-start gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-flow-col justify-center gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-flow-col justify-end gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Template</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-flow-col grid-cols-[auto,1fr,auto] gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SectionDivider($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Vertical`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Default</h2> `);

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

	$$renderer.push(`<!----> <h2>Justify</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid justify-start gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid justify-center gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid justify-end gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Template</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-rows-[auto,1fr,auto] gap-2 h-64"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SectionDivider($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Stack`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="inline-grid place-items-center">`);

			Button($$renderer, {
				class: 'col-span-full row-span-full border',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Example`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="col-span-full row-span-full bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center">3</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Corner with Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="inline-grid">`);

			Button($$renderer, {
				class: 'col-span-full row-span-full border',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Example`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="col-span-full row-span-full bg-danger rounded-full h-4 w-4 -mr-1 -mt-1 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Corner with Icon Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="inline-grid">`);

			Button($$renderer, {
				icon: mdiFilterVariant,
				class: 'col-span-full row-span-full border p-3'
			});

			$$renderer.push(`<!----> <div class="col-span-full row-span-full bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Corner (multi) with Icon Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="inline-grid">`);

			Button($$renderer, {
				icon: mdiFilterVariant,
				class: 'col-span-full row-span-full border p-3'
			});

			$$renderer.push(`<!----> <div class="col-span-full row-span-full self-start justify-self-end bg-danger rounded-full h-4 w-4 -mt-1 text-xs flex items-center justify-center border border-surface-100"></div> <div class="col-span-full row-span-full self-end justify-self-end bg-success rounded-full h-4 w-4 text-xs flex items-center justify-center border border-surface-100"></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}