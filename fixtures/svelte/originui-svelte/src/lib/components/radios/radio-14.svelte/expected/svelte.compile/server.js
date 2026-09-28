import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_14($$renderer) {
	const items = [
		{ id: 'radio-14-r1', label: 'USA', value: 'r1' },
		{ id: 'radio-14-r2', label: 'UK', value: 'r2' },
		{ id: 'radio-14-r3', label: 'France', value: 'r3' }
	];

	$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Server location</legend> `);

	RadioGroup($$renderer, {
		class: 'flex flex-wrap gap-2',
		value: 'r1',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring relative flex flex-col items-start gap-4 rounded-lg border p-3 shadow-xs shadow-black/[.04]"><div class="flex items-center gap-2">`);

				RadioGroupItem($$renderer, {
					id: item.id,
					value: item.value,
					class: 'after:absolute after:inset-0'
				});

				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: item.id,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item.label)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></fieldset>`);
}