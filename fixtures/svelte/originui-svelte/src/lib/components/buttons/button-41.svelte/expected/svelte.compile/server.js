import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import StarIcon from '@lucide/svelte/icons/star';

export default function Button_41($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			StarIcon($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> <span class="flex items-baseline gap-2">Star <span class="text-primary-foreground/60 text-xs">729</span></span>`);
		},
		$$slots: { default: true }
	});
}