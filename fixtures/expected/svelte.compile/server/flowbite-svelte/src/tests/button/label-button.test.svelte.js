import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";

export default function Label_button_test($$renderer) {
	Button($$renderer, {
		tag: 'label',
		'data-testid': 'label',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Test`);
		},
		$$slots: { default: true }
	});
}