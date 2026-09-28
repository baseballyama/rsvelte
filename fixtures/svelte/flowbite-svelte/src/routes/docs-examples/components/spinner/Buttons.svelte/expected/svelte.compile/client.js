import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner, Button } from "flowbite-svelte";

var root = $.from_html(`<!> Loading ...`, 1);
var root_1 = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!></div>`);

export default function Buttons($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Spinner(node_1, { class: 'me-3', size: '4', color: 'blue' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		outline: true,
		color: 'gray',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Spinner(node_3, { class: 'me-3', size: '4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}