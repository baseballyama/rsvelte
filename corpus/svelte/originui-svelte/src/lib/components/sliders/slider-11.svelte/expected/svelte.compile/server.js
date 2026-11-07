import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_11($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dual range slider`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		type: 'multiple',
		value: [25, 75],
		step: 5,
		'aria-label': 'Dual range slider'
	});

	$$renderer.push(`<!----></div>`);
}