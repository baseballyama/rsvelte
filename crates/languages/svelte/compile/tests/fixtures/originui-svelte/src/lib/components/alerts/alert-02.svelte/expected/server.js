import * as $ from 'svelte/internal/server';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

export default function Alert_02($$renderer) {
	$$renderer.push(`<div class="rounded-lg border border-amber-500/50 px-4 py-3 text-amber-600"><p class="text-sm">`);

	TriangleAlert($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Some
		information is missing!</p></div>`);
}