import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Radio_1($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Radio(node, {
		name: 'example',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default radio');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Radio(node_1, {
		name: 'example',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Checked state');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}