import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

export default function ContentEditable($$anchor) {
	P($$anchor, {
		contenteditable: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}