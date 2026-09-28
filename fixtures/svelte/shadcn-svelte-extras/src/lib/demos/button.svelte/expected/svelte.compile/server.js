import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';

export default function Button_1($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Save`);
		},
		$$slots: { default: true }
	});
}