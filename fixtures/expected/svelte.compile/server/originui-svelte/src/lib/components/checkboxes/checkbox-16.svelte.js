import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';
import Brush from '@lucide/svelte/icons/brush';
import Eraser from '@lucide/svelte/icons/eraser';
import Scissors from '@lucide/svelte/icons/scissors';
import SwatchBook from '@lucide/svelte/icons/swatch-book';

export default function Checkbox_16($$renderer) {
	const items = [
		{
			defaultChecked: true,
			Icon: SwatchBook,
			id: 'checkbox-16-c1',
			label: 'Palette',
			value: 'c1'
		},

		{
			Icon: Brush,
			id: 'checkbox-16-c2',
			label: 'Brush',
			value: 'c2'
		},

		{
			Icon: Eraser,
			id: 'checkbox-16-c3',
			label: 'Eraser',
			value: 'c3'
		},

		{
			Icon: Scissors,
			id: 'checkbox-16-c4',
			label: 'Cut',
			value: 'c4'
		}
	];

	$$renderer.push(`<div class="grid grid-cols-2 gap-3"><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<label class="border-input has-data-[state=checked]:border-ring relative flex cursor-pointer flex-col gap-4 rounded-lg border p-4 shadow-xs shadow-black/[.04]"${$.attr('for', item.id)}><div class="flex justify-between gap-2">`);

		Checkbox($$renderer, {
			id: item.id,
			value: item.value,
			class: 'order-1 h-4 w-4 after:absolute after:inset-0',
			checked: item.defaultChecked
		});

		$$renderer.push(`<!----> `);

		if (item.Icon) {
			$$renderer.push('<!--[-->');
			item.Icon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> `);

		Label($$renderer, {
			for: item.id,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(item.label)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></label>`);
	}

	$$renderer.push(`<!--]--></div>`);
}