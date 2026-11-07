import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Box from './Box.svelte';

var root = $.from_html(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`, 1);

export default function Svelte_fragment_input($$anchor) {
	Box($$anchor, {
		$$slots: {
			footer: ($$anchor, $$slotProps) => {
				var fragment_1 = root();

				$.next(2);
				$.append($$anchor, fragment_1);
			}
		}
	});
}