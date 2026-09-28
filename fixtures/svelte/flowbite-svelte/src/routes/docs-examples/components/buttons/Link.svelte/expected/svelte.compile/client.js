import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";

export default function Link($$anchor) {
	Button($$anchor, {
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Home');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}