import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import PinIcon from '@lucide/svelte/icons/pin';

export default function Button_36($$renderer) {
	$$renderer.push(`<div class="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Options',
		children: ($$renderer) => {
			ChevronDownIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		children: ($$renderer) => {
			PinIcon($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Pinned`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}