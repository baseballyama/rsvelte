import * as $ from 'svelte/internal/server';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_13($$renderer) {
	const items = [
		{ id: 'radio-13-r1', label: '2 CPU', value: 'r1' },
		{ id: 'radio-13-r2', label: '4 CPU', value: 'r2' },
		{ id: 'radio-13-r3', label: '6 CPU', value: 'r3' },
		{ id: 'radio-13-r4', label: '8 CPU', value: 'r4' },
		{ id: 'radio-13-r5', label: '12 CPU', value: 'r5' },
		{
			disabled: true,
			id: 'radio-13-r6',
			label: '16 CPU',
			value: 'r6'
		}
	];

	$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">CPU Cores</legend> `);

	RadioGroup($$renderer, {
		class: 'grid grid-cols-3 gap-2',
		value: 'r1',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border px-2 py-3 text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50">`);

				RadioGroupItem($$renderer, {
					id: item.id,
					value: item.value,
					class: 'sr-only after:absolute after:inset-0',
					disabled: item.disabled
				});

				$$renderer.push(`<!----> <p class="text-foreground text-sm leading-none font-medium">${$.escape(item.label)}</p></label>`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></fieldset>`);
}