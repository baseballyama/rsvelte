import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

export default function Slider_02($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-4">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled slider`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		type: 'single',
		value: 25,
		disabled: true,
		'aria-label': 'Disabled slider'
	});

	$$renderer.push(`<!----></div>`);
}