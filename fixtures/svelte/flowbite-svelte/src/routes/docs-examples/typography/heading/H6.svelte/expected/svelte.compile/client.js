import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

export default function H6($$anchor) {
	Heading($$anchor, {
		tag: 'h6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 6');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}