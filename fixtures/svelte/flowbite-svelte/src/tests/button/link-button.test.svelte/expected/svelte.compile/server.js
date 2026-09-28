import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";

export default function Link_button_test($$renderer) {
	Button($$renderer, {
		href: 'https://flowbite-svelte.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite Svelte`);
		},
		$$slots: { default: true }
	});
}