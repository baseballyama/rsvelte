import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Button_03($$renderer) {
	Button($$renderer, {
		class: 'rounded-full',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});
}