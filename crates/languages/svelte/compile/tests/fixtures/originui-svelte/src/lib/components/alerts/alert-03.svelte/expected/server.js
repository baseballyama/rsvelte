import * as $ from 'svelte/internal/server';
import CircleAlert from '@lucide/svelte/icons/circle-alert';

export default function Alert_03($$renderer) {
	$$renderer.push(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm">`);

	CircleAlert($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex text-red-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->An
		error occurred!</p></div>`);
}