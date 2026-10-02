import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_with_button_text($$renderer) {
	Example($$renderer, {
		title: 'With Button Text',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2">`);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle sm',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

			Button($$renderer, {
				size: 'default',
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle default',
				size: 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

			Button($$renderer, {
				size: 'lg',
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle lg',
				size: 'lg',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}