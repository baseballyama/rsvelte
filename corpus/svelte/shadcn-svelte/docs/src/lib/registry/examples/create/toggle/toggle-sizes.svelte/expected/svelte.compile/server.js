import * as $ from 'svelte/internal/server';
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_sizes($$renderer) {
	Example($$renderer, {
		title: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle small',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Small`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle default',
				size: 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle large',
				size: 'lg',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Large`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}