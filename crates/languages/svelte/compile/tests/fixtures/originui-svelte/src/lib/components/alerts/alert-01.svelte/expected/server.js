import * as $ from 'svelte/internal/server';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

export default function Alert_01($$renderer) {
	$$renderer.push(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm">`);

	TriangleAlert($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex text-amber-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Some information is missing!</p></div>`);
}