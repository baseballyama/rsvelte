import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

export default function H2($$anchor) {
	Heading($$anchor, {
		tag: 'h2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 2');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}