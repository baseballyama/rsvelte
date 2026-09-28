import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_06($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slider with reference labels`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div>`);

	Slider($$renderer, {
		type: 'single',
		value: 15,
		min: 5,
		max: 35,
		'aria-label': 'Slider with reference labels'
	});

	$$renderer.push(`<!----> <span class="text-muted-foreground mt-4 flex w-full items-center justify-between gap-1 text-xs font-medium" aria-hidden="true"><span>5 GB</span> <span>20 GB</span> <span>35 GB</span></span></div></div>`);
}