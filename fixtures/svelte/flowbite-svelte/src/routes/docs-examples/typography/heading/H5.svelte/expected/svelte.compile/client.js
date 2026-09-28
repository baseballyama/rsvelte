import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

export default function H5($$anchor) {
	Heading($$anchor, {
		tag: 'h5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 5');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}