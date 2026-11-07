import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Notification_23($$renderer) {
	$$renderer.push(`<div class="border-border bg-background z-100 rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex flex-col justify-between gap-3 md:flex-row md:items-center"><p class="text-sm">We use cookies to improve your experience, analyze site usage, and show personalized content.</p> <div class="flex gap-2 max-md:flex-wrap">`);

	Button($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Decline`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}