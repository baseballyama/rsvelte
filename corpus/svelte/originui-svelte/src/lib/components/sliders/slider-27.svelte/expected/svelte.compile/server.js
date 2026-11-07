import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_27($$renderer) {
	$$renderer.push(`<div class="space-y-4"><legend class="text-foreground text-sm font-medium">Equalizer</legend> <div class="flex h-48 justify-center gap-8"><div class="flex flex-col items-center gap-2">`);

	Slider($$renderer, {
		type: 'single',
		value: 2,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '60 Hz',
		showTooltip: true
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->60`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex flex-col items-center gap-2">`);

	Slider($$renderer, {
		type: 'single',
		value: 1,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '250 Hz',
		showTooltip: true
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->250`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex flex-col items-center gap-2">`);

	Slider($$renderer, {
		type: 'single',
		value: -1,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '1k',
		showTooltip: true
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->1k`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex flex-col items-center gap-2">`);

	Slider($$renderer, {
		type: 'single',
		value: -3,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '4k',
		showTooltip: true
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->4k`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex flex-col items-center gap-2">`);

	Slider($$renderer, {
		type: 'single',
		value: 2,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '16k',
		showTooltip: true
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->16K`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}