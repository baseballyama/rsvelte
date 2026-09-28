import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import X from '@lucide/svelte/icons/x';

export default function Badge_13($$renderer) {
	let isActive = true;

	if (isActive) {
		$$renderer.push('<!--[0-->');

		Badge($$renderer, {
			variant: 'outline',
			class: 'rounded-md px-2 py-1',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Tag <button class="focus-visible:outline-ring/70 -my-[5px] -ms-0.5 -me-2 inline-flex size-7 shrink-0 items-center justify-center rounded-[inherit] p-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid" aria-label="Delete">`);
				X($$renderer, { size: 14, 'aria-hidden': 'true' });
				$$renderer.push(`<!----></button>`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}