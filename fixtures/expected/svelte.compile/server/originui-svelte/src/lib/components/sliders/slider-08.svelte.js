import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_08($$renderer) {
	let value = 25;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between gap-2">`);

		Label($$renderer, {
			class: 'leading-6',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Slider with output`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <output class="text-sm font-medium tabular-nums">${$.escape(value)}</output></div> `);

		Slider($$renderer, {
			type: 'single',
			'aria-label': 'Slider with output',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}