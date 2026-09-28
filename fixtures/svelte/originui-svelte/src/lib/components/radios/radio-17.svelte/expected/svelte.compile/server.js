import * as $ from 'svelte/internal/server';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_17($$renderer) {
	let selectedValue = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">How likely are you to recommend us?</legend> `);

		RadioGroup($$renderer, {
			class: 'flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/[.04]',
			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like([0, 1, 2, 3, 4, 5]);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let number = each_array[$$index];

					$$renderer.push(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-colors first:rounded-s-lg last:rounded-e-lg has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[state=checked]:z-10">`);

					RadioGroupItem($$renderer, {
						id: `radio-17-r${$.stringify(number)}`,
						value: number.toString(),
						class: 'sr-only after:absolute after:inset-0'
					});

					$$renderer.push(`<!----> ${$.escape(number)}</label>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></fieldset> <div class="mt-1 flex justify-between text-xs font-medium"><p><span class="text-base">😡</span> Not likely</p> <p>Very Likely <span class="text-base">😍</span></p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}