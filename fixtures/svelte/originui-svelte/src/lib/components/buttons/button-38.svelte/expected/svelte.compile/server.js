import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

export default function Button_38($$renderer) {
	Button($$renderer, {
		class: 'relative ps-12',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Previous <span class="bg-primary-foreground/15 pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center">`);
			ChevronLeftIcon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></span>`);
		},
		$$slots: { default: true }
	});
}