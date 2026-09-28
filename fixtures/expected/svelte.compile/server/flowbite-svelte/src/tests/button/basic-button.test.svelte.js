import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";

export default function Basic_button_test($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Test`);
		},
		$$slots: { default: true }
	});
}