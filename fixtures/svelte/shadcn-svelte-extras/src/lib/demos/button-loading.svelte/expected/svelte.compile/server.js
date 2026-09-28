import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';

export default function Button_loading($$renderer) {
	Button($$renderer, {
		loading: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Save`);
		},
		$$slots: { default: true }
	});
}