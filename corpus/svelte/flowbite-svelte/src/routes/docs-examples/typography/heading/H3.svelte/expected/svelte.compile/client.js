import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

export default function H3($$anchor) {
	Heading($$anchor, {
		tag: 'h3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 3');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}