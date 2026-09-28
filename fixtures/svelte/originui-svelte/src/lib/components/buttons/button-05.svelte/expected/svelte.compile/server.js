import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Trash from '@lucide/svelte/icons/trash';

export default function Button_05($$renderer) {
	Button($$renderer, {
		variant: 'destructive',
		children: ($$renderer) => {
			Trash($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Button`);
		},
		$$slots: { default: true }
	});
}