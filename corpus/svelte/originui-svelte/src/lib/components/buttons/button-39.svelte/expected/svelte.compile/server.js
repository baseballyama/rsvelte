import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

export default function Button_39($$renderer) {
	Button($$renderer, {
		class: 'relative pe-12',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Next <span class="bg-primary-foreground/15 pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center">`);
			ChevronRightIcon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></span>`);
		},
		$$slots: { default: true }
	});
}