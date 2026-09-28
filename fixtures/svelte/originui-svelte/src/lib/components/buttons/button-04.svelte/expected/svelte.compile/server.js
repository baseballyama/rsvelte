import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Archive from '@lucide/svelte/icons/archive';

export default function Button_04($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			Archive($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Button`);
		},
		$$slots: { default: true }
	});
}