import * as $ from 'svelte/internal/server';
import Info from '@lucide/svelte/icons/info';

export default function Alert_07($$renderer) {
	$$renderer.push(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm">`);

	Info($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex text-blue-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Just a quick
		note!</p></div>`);
}