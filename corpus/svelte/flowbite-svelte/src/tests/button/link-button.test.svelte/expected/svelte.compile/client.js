import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";

export default function Link_button_test($$anchor) {
	Button($$anchor, {
		href: 'https://flowbite-svelte.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Flowbite Svelte');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}