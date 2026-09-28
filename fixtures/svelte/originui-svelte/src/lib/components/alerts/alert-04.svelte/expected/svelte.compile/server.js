import * as $ from 'svelte/internal/server';
import CircleAlert from '@lucide/svelte/icons/circle-alert';

export default function Alert_04($$renderer) {
	$$renderer.push(`<div class="rounded-lg border border-red-500/50 px-4 py-3 text-red-600"><p class="text-sm">`);

	CircleAlert($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->An error
		occurred!</p></div>`);
}