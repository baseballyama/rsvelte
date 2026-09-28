import * as $ from 'svelte/internal/server';
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_disabled($$renderer) {
	Example($$renderer, {
		title: 'Disabled',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			Toggle($$renderer, {
				'aria-label': 'Toggle disabled',
				disabled: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle disabled outline',
				disabled: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}