import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_21($$renderer) {
	const min = 5;
	const max = 1240;
	let value = [min, max];
	const price = $.derived(() => value.map((v) => `$${v.toLocaleString()}${v == max ? '+' : ''}`));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="*:not-first:mt-3">`);

		Label($$renderer, {
			class: 'tabular-nums',
			children: ($$renderer) => {
				$$renderer.push(`<!---->From ${$.escape(price()[0])} to ${$.escape(price()[1])}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex items-center gap-4">`);

		Slider($$renderer, {
			type: 'multiple',
			max,
			min,
			'aria-label': 'Price range slider',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'outline',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go`);
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