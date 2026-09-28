import * as $ from 'svelte/internal/server';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_16($$renderer) {
	const items = [
		{ icon: '😠', id: 'radio-16-r1', label: 'Angry', value: 'r1' },
		{ icon: '🙁', id: 'radio-16-r2', label: 'Sad', value: 'r2' },
		{ icon: '😐', id: 'radio-16-r3', label: 'Neutral', value: 'r3' },
		{ icon: '🙂', id: 'radio-16-r4', label: 'Happy', value: 'r4' },
		{
			icon: '😀',
			id: 'radio-16-r5',
			label: 'Laughing',
			value: 'r5'
		}
	];

	let selectedValue = 'r3';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">How did it go?</legend> `);

		RadioGroup($$renderer, {
			class: 'flex gap-1.5',
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

					$$renderer.push(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex size-9 cursor-pointer flex-col items-center justify-center rounded-full border text-center text-xl shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50">`);

					RadioGroupItem($$renderer, {
						id: item.id,
						value: item.value,
						class: 'sr-only after:absolute after:inset-0'
					});

					$$renderer.push(`<!----> ${$.escape(item.icon)}</label>`);
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