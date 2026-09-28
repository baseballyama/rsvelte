import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

export default function WhitespaceNowrap($$anchor) {
	P($$anchor, {
		whitespace: 'nowrap',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}