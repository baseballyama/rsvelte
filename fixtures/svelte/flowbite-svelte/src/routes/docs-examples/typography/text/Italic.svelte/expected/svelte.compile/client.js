import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

export default function Italic($$anchor) {
	P($$anchor, {
		italic: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The crypto identity primitive.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}