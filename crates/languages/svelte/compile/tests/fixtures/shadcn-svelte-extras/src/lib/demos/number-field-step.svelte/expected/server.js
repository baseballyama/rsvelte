import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import * as NumberField from '$lib/components/ui/number-field';
import CheckIcon from '@lucide/svelte/icons/check';
import SkipForwardIcon from '@lucide/svelte/icons/skip-forward';
import FireIcon from '@lucide/svelte/icons/flame';

export default function Number_field_step($$renderer) {
	let calories = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex flex-col gap-2"><div><h1 class="text-lg font-medium">Calories Burned</h1> <p class="text-muted-foreground text-sm">How many calories did you burn?</p></div> `);

		if (NumberField.Root) {
			$$renderer.push('<!--[-->');

			NumberField.Root($$renderer, {
				step: 100,
				min: 0,
				max: 10000,
				get value() {
					return calories;
				},

				set value($$value) {
					calories = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col items-center"><div class="flex w-full min-w-[230px] items-center justify-between gap-4 py-4">`);

					if (NumberField.Decrement) {
						$$renderer.push('<!--[-->');
						NumberField.Decrement($$renderer, { variant: 'outline', class: 'rounded-full', tabindex: null });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="flex items-center gap-2 text-center text-3xl">`);
					FireIcon($$renderer, { class: 'size-7 text-amber-500' });
					$$renderer.push(`<!----> <span class="font-mono">${$.escape(calories)}</span></span> `);

					if (NumberField.Increment) {
						$$renderer.push('<!--[-->');
						NumberField.Increment($$renderer, { variant: 'outline', class: 'rounded-full', tabindex: null });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <div class="flex items-center justify-between gap-4">`);

		Button($$renderer, {
			variant: 'outline',
			size: 'icon',
			children: ($$renderer) => {
				SkipForwardIcon($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			size: 'icon',
			children: ($$renderer) => {
				CheckIcon($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}