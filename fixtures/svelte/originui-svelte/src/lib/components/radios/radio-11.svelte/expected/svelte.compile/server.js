import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconBrush from '@lucide/svelte/icons/brush';
import IconEraser from '@lucide/svelte/icons/eraser';
import IconScissors from '@lucide/svelte/icons/scissors';
import IconSwatchBook from '@lucide/svelte/icons/swatch-book';

export default function Radio_11($$renderer) {
	const items = [
		{
			Icon: IconSwatchBook,
			id: 'radio-11-r1',
			label: 'Palette',
			value: 'r1'
		},

		{
			Icon: IconBrush,
			id: 'radio-11-r2',
			label: 'Brush',
			value: 'r2'
		},

		{
			Icon: IconEraser,
			id: 'radio-11-r3',
			label: 'Eraser',
			value: 'r3'
		},

		{
			Icon: IconScissors,
			id: 'radio-11-r4',
			label: 'Cut',
			value: 'r4'
		}
	];

	let selectedValue = 'r1';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RadioGroup($$renderer, {
			class: 'grid grid-cols-2 gap-2',
			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring relative flex flex-col gap-4 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><div class="flex justify-between gap-2">`);

					RadioGroupItem($$renderer, {
						id: item.id,
						value: item.value,
						class: 'order-1 after:absolute after:inset-0'
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

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}