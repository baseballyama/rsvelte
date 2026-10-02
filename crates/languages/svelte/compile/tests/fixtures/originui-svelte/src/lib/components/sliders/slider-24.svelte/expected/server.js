import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_24($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Vertical dual range slider and tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex h-40 justify-center">`);

	Slider($$renderer, {
		type: 'multiple',
		value: [2, 7],
		max: 10,
		orientation: 'vertical',
		'aria-label': 'Vertical slider',
		showTooltip: true
	});

	$$renderer.push(`<!----></div></div>`);
}