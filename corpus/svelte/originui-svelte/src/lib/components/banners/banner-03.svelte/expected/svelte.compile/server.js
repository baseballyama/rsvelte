import * as $ from 'svelte/internal/server';
import Eclipse from '@lucide/svelte/icons/eclipse';

export default function Banner_03($$renderer) {
	$$renderer.push(`<div class="dark bg-muted text-foreground px-4 py-3"><p class="text-center text-sm">`);

	Eclipse($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Get the most
		out of your app with real-time updates and analytics <span class="text-muted-foreground">·</span> <a href="#title" class="font-medium underline hover:no-underline">Upgrade</a></p></div>`);
}