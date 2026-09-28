import * as $ from 'svelte/internal/server';
import CircleCheck from '@lucide/svelte/icons/circle-check';

export default function Alert_06($$renderer) {
	$$renderer.push(`<div class="rounded-lg border border-emerald-500/50 px-4 py-3 text-emerald-600"><p class="text-sm">`);

	CircleCheck($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Completed successfully!</p></div>`);
}