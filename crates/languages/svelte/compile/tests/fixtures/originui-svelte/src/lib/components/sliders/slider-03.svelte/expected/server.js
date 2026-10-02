import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_03($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slider with square thumb`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		type: 'single',
		value: 25,
		max: 100,
		step: 5,
		class: '*:data-slider-thumb:rounded',
		'aria-label': 'Slider with square thumb'
	});

	$$renderer.push(`<!----></div>`);
}