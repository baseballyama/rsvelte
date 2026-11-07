import * as $ from 'svelte/internal/server';
import CircleAlert from '@lucide/svelte/icons/circle-alert';

export default function Alert_11($$renderer) {
	$$renderer.push(`<div class="border-border rounded-lg border px-4 py-3"><div class="flex gap-3">`);

	CircleAlert($$renderer, {
		class: 'mt-0.5 shrink-0 text-red-500 opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!----> <div class="grow space-y-1"><p class="text-sm font-medium">Password does not meet requirements:</p> <ul class="text-muted-foreground list-inside list-disc text-sm"><li>Minimum 8 characters</li> <li>Inlcude a special character</li></ul></div></div></div>`);
}