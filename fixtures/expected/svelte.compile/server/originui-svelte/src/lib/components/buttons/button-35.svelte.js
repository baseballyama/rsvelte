import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import SquareArrowOutUpRight from '@lucide/svelte/icons/square-arrow-out-up-right';

export default function Button_35($$renderer) {
	$$renderer.push(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Preview`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Open link',
		children: ($$renderer) => {
			SquareArrowOutUpRight($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}