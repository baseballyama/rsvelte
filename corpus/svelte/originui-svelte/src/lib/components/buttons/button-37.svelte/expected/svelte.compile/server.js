import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import GitForkIcon from '@lucide/svelte/icons/git-fork';

export default function Button_37($$renderer) {
	$$renderer.push(`<div class="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		children: ($$renderer) => {
			GitForkIcon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Fork <span class="border-primary-foreground/30 text-primary-foreground/60 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">18</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Options',
		children: ($$renderer) => {
			ChevronDownIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}