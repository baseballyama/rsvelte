import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_22($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Vertical slider`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex h-40 justify-center">`);

	Slider($$renderer, {
		type: 'single',
		value: 5,
		max: 10,
		orientation: 'vertical',
		'aria-label': 'Vertical slider'
	});

	$$renderer.push(`<!----></div></div>`);
}