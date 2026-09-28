import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

export default function H4($$anchor) {
	Heading($$anchor, {
		tag: 'h4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 4');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}