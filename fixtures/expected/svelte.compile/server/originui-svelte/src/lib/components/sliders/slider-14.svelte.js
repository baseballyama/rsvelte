import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_14($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slider with multiple thumbs`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		type: 'multiple',
		value: [25, 50, 100],
		'aria-label': 'Slider with multiple thumbs',
		showTooltip: true,
		tooltipContent: (value) => `${value}%`
	});

	$$renderer.push(`<!----></div>`);
}