import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';

export default function Checkbox_18($$renderer) {
	const items = [
		{
			defaultChecked: true,
			id: 'checkbox-18-c1',
			label: 'Monday',
			value: 'c1'
		},

		{
			defaultChecked: true,
			id: 'checkbox-18-c2',
			label: 'Tuesday',
			value: 'c2'
		},
		{ id: 'checkbox-18-c3', label: 'Wednesday', value: 'c3' },
		{
			defaultChecked: true,
			id: 'checkbox-18-c4',
			label: 'Thursday',
			value: 'c4'
		},

		{
			defaultChecked: true,
			id: 'checkbox-18-c5',
			label: 'Friday',
			value: 'c5'
		},
		{ id: 'checkbox-18-c6', label: 'Saturday', value: 'c6' },
		{
			disabled: true,
			id: 'checkbox-18-c7',
			label: 'Sunday',
			value: 'c7'
		}
	];

	$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Days of the week</legend> <div class="flex gap-1.5"><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<label class="border-input ring-offset-background has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:ring-ring/70 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"${$.attr('for', item.id)}>`);

		Checkbox($$renderer, {
			id: item.id,
			value: item.value,
			class: 'sr-only after:absolute after:inset-0',
			checked: item.defaultChecked,
			disabled: item.disabled
		});

		$$renderer.push(`<!----> <span aria-hidden="true" class="text-sm font-medium">${$.escape(item.label[0])}</span> <span class="sr-only">${$.escape(item.label)}</span></label>`);
	}

	$$renderer.push(`<!--]--></div></fieldset>`);
}