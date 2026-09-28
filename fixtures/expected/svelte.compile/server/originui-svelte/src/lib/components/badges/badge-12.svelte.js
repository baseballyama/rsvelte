import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import X from '@lucide/svelte/icons/x';

export default function Badge_12($$renderer) {
	let isActive = true;

	if (isActive) {
		$$renderer.push('<!--[0-->');

		Badge($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Removable <button class="focus-visible:outline-ring/70 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[inherit] p-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid">`);
				X($$renderer, { size: 12, 'aria-hidden': 'true' });
				$$renderer.push(`<!----></button>`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}