import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Button_02($$renderer) {
	Button($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});
}