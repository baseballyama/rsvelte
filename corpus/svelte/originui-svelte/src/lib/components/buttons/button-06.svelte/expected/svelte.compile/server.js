import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import X from '@lucide/svelte/icons/x';

export default function Button_06($$renderer) {
	Button($$renderer, {
		variant: 'secondary',
		children: ($$renderer) => {
			X($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Button`);
		},
		$$slots: { default: true }
	});
}