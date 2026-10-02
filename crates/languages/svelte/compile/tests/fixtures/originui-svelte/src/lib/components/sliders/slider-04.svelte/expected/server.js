import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_04($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slider with solid thumb`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		type: 'single',
		value: 25,
		class: '*:data-slider-thumb:bg-primary *:data-slider-range:opacity-70',
		'aria-label': 'Slider with solid thumb'
	});

	$$renderer.push(`<!----></div>`);
}