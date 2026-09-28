import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Banner_01($$renderer) {
	$$renderer.push(`<div class="bg-background z-50 rounded-md border px-4 py-3 shadow-lg"><div class="flex flex-col justify-between gap-3 md:flex-row md:items-center"><p class="text-sm">We use cookies to improve your experience, analyze site usage, and show personalized content.</p> <div class="flex gap-2 max-md:flex-wrap">`);

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