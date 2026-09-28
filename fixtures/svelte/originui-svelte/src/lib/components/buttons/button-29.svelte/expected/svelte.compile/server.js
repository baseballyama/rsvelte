import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import FlipHorizontalIcon from '@lucide/svelte/icons/flip-horizontal';
import FlipVerticalIcon from '@lucide/svelte/icons/flip-vertical';

export default function Button_29($$renderer) {
	$$renderer.push(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Flip Horizontal',
		children: ($$renderer) => {
			FlipHorizontalIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Flip Vertical',
		children: ($$renderer) => {
			FlipVerticalIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}