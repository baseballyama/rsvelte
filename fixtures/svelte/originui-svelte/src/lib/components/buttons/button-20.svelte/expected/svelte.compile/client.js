import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Plus from '@lucide/svelte/icons/plus';

export default function Button_20($$anchor) {
	Button($$anchor, {
		class: 'rounded-full',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Add new item',
		children: ($$anchor, $$slotProps) => {
			Plus($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});
}