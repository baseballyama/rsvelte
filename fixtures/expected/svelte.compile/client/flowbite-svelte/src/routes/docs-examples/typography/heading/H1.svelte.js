import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

export default function H1($$anchor) {
	Heading($$anchor, {
		tag: 'h1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}