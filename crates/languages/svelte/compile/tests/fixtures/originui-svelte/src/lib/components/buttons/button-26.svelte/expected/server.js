import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

export default function Button_26($$renderer) {
	$$renderer.push(`<div class="inline-flex -space-x-px rounded-full shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-full last:rounded-e-full focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Upvote',
		children: ($$renderer) => {
			ChevronUpIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="bg-primary text-primary-foreground flex items-center px-1 text-sm font-medium">235</span> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-full last:rounded-e-full focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Downvote',
		children: ($$renderer) => {
			ChevronDownIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}