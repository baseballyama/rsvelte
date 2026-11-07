import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Plus from '@lucide/svelte/icons/plus';

export default function Button_19($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		class: 'aspect-square max-sm:p-0',
		children: ($$renderer) => {
			Plus($$renderer, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> <span class="max-sm:sr-only">Add new</span>`);
		},
		$$slots: { default: true }
	});
}