import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Button_01($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});
}