import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_10($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slider with labels and tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div><span class="text-muted-foreground mb-3 flex w-full items-center justify-between gap-2 text-xs font-medium" aria-hidden="true"><span>Low</span> <span>High</span></span> `);

	Slider($$renderer, {
		type: 'single',
		value: 50,
		step: 10,
		showTooltip: true,
		'aria-label': 'Slider with labels and tooltip'
	});

	$$renderer.push(`<!----></div></div>`);
}