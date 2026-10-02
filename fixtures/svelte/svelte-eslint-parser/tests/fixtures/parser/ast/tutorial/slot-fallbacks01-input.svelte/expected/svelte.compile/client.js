import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Box from './Box.svelte';

var root = $.from_html(`<h2>Hello!</h2> <p>This is a box. It can contain anything.</p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Slot_fallbacks01_input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Box(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Box(node_1, {});
	$.append($$anchor, fragment);
}