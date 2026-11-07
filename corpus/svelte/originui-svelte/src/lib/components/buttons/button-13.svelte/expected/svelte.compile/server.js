import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';

export default function Button_13($$renderer) {
	Button($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			LoaderCircle($$renderer, { class: '-ms-1 animate-spin', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Button`);
		},
		$$slots: { default: true }
	});
}