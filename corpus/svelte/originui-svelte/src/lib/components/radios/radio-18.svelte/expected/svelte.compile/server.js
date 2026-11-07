import * as $ from 'svelte/internal/server';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconCheck from '@lucide/svelte/icons/check';
import IconMinus from '@lucide/svelte/icons/minus';
import UiDark from '$assets/ui-dark.png?enhanced';
import UiLight from '$assets/ui-light.png?enhanced';
import UiSystem from '$assets/ui-system.png?enhanced';

export default function Radio_18($$renderer) {
	const items = [
		{
			id: 'radio-18-r1',
			image: UiLight,
			label: 'Light',
			value: 'r1'
		},
		{ id: 'radio-18-r2', image: UiDark, label: 'Dark', value: 'r2' },
		{
			id: 'radio-18-r3',
			image: UiSystem,
			label: 'System',
			value: 'r3'
		}
	];

	$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Choose a theme</legend> `);

	RadioGroup($$renderer, {
		class: 'flex gap-3',
		value: 'r1',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<label>`);

				RadioGroupItem($$renderer, {
					id: item.id,
					value: item.value,
					class: 'peer sr-only after:absolute after:inset-0'
				});

				$$renderer.push(`<!----> <enhanced:img${$.attr('src', item.image)}${$.attr('alt', item.label)} class="border-input ring-offset-background peer-focus-visible:ring-ring/70 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative h-[70px] w-[88px] cursor-pointer overflow-hidden rounded-lg border shadow-xs shadow-black/[.04] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></enhanced:img> <span class="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1">`);

				IconCheck($$renderer, {
					size: 16,
					'stroke-width': '2',
					class: 'in-[.group]:peer-data-[state=unchecked]:hidden',
					'aria-hidden': 'true'
				});

				$$renderer.push(`<!----> `);

				IconMinus($$renderer, {
					size: 16,
					'stroke-width': '2',
					class: 'in-[.group]:peer-data-[state=checked]:hidden',
					'aria-hidden': 'true'
				});

				$$renderer.push(`<!----> <span class="text-xs font-medium">${$.escape(item.label)}</span></span></label>`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></fieldset>`);
}