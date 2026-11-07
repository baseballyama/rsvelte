import * as $ from 'svelte/internal/server';
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Switch_sizes($$renderer) {
	Example($$renderer, {
		title: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-12"><div class="flex items-center gap-2">`);
			Switch($$renderer, { id: 'switch-size-sm', size: 'sm' });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'switch-size-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Small`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
			Switch($$renderer, { id: 'switch-size-default', size: 'default' });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'switch-size-default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}