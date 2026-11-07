import * as $ from 'svelte/internal/server';
import CircleCheck from '@lucide/svelte/icons/circle-check';

export default function Alert_05($$renderer) {
	$$renderer.push(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm">`);

	CircleCheck($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex text-emerald-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Completed successfully!</p></div>`);
}