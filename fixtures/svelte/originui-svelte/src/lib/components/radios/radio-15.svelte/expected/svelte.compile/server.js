import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_15($$renderer) {
	const items = [
		{
			id: 'radio-15-r1',
			label: 'Hobby',
			price: '$9/mo',
			value: 'r1'
		},

		{
			id: 'radio-15-r2',
			label: 'Plus',
			price: '$29/mo',
			value: 'r2'
		},

		{
			id: 'radio-15-r3',
			label: 'Team',
			price: '$49/mo',
			value: 'r3'
		},

		{
			id: 'radio-15-r4',
			label: 'Enterprise',
			price: 'Custom',
			value: 'r4'
		}
	];

	let selectedValue = 'r2';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Choose plan</legend> `);

		RadioGroup($$renderer, {
			class: 'gap-0 -space-y-px rounded-lg shadow-xs shadow-black/[.04]',
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

					$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex flex-col gap-4 border p-4 first:rounded-t-lg last:rounded-b-lg has-data-[state=checked]:z-10"><div class="flex items-center justify-between"><div class="flex items-center gap-2">`);

					RadioGroupItem($$renderer, {
						id: item.id,
						value: item.value,
						class: 'after:absolute after:inset-0',
						'aria-describedby': `${item.id}-price`
					});

					$$renderer.push(`<!----> `);

					Label($$renderer, {
						class: 'inline-flex items-start leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ',
						for: item.id,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(item.label)} `);

							if (item.value === 'r2') {
								$$renderer.push(`<!--[0--><span class="-mt-1 ml-2 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-300/15 px-1 py-0.5 text-[10px] font-medium text-emerald-600 uppercase">Popular</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div${$.attr('id', `${item.id}-price`)} class="text-muted-foreground text-xs leading-[inherit]">${$.escape(item.price)}</div></div></div>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></fieldset>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}