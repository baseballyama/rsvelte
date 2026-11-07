import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Plus from '@lucide/svelte/icons/plus';

export default function Button_20($$renderer) {
	Button($$renderer, {
		class: 'rounded-full',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Add new item',
		children: ($$renderer) => {
			Plus($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});
}