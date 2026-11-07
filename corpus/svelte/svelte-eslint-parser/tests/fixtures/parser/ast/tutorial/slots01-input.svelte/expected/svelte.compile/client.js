import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Box from './Box.svelte';

var root = $.from_html(`<h2>Hello!</h2> <p>This is a box. It can contain anything.</p> <div><p>I'm a child of the div</p></div>`, 1);

export default function Slots01_input($$anchor) {
	Box($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(4);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}