import * as $ from 'svelte/internal/server';
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Switch_disabled($$renderer) {
	Example($$renderer, {
		title: 'Disabled',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-12"><div class="flex items-center gap-2">`);
			Switch($$renderer, { id: 'switch-disabled-unchecked', disabled: true });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'switch-disabled-unchecked',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled (Unchecked)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
			Switch($$renderer, { id: 'switch-disabled-checked', checked: true, disabled: true });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'switch-disabled-checked',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled (Checked)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}