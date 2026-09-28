import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import QrCodeIcon from '@lucide/svelte/icons/qr-code';

export default function Button_34($$renderer) {
	$$renderer.push(`<div class="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		size: 'icon',
		'aria-label': 'QR code',
		children: ($$renderer) => {
			QrCodeIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Sign in`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}