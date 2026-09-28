import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Button_17($$renderer) {
	Button($$renderer, {
		class: 'rounded-full py-0 ps-0',
		children: ($$renderer) => {
			$$renderer.push(`<div class="me-0.5 flex aspect-square h-full p-1.5"><enhanced:img class="size-[24px] rounded-full" src="/static/avatar.jpg" alt="Profile image" aria-hidden="true" loading="lazy"></enhanced:img></div> @max_gotts`);
		},
		$$slots: { default: true }
	});
}