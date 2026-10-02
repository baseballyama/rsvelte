import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronUp from '@lucide/svelte/icons/chevron-up';

export default function Button_25($$renderer) {
	$$renderer.push(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Upvote',
		children: ($$renderer) => {
			ChevronUp($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="border-input flex items-center border px-3 text-sm font-medium">235</span> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Downvote',
		children: ($$renderer) => {
			ChevronDown($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}