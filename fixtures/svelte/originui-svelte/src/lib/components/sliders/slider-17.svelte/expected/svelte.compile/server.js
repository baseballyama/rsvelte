import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_17($$renderer) {
	const labels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'];
	let value = 3;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-3"><div class="flex items-center justify-between gap-2">`);

		Label($$renderer, {
			class: 'leading-6',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Rate your experience`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <span class="text-sm font-medium">${$.escape(labels[value - 1])}</span></div> <div class="flex items-center gap-2"><span class="text-2xl">😡</span> `);

		Slider($$renderer, {
			type: 'single',
			min: 1,
			max: 5,
			'aria-label': 'Rate your experience',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <span class="text-2xl">😍</span></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}