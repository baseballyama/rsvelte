import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

export default function Button_47($$renderer) {
	Button($$renderer, {
		variant: 'link',
		class: 'gap-1',
		children: ($$renderer) => {
			ChevronLeftIcon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Go back`);
		},
		$$slots: { default: true }
	});
}