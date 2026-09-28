import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ArrowLeft from '@lucide/svelte/icons/arrow-left';

export default function Button_08($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			ArrowLeft($$renderer, {
				class: '-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> Button`);
		},
		$$slots: { default: true }
	});
}