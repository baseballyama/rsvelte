import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Link from './Link.svelte';

export default function Main($$anchor) {
	Link($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}