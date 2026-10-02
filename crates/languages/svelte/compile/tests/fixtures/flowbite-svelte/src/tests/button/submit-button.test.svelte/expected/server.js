import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";

export default function Submit_button_test($$renderer) {
	Button($$renderer, {
		type: 'submit',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Save`);
		},
		$$slots: { default: true }
	});
}