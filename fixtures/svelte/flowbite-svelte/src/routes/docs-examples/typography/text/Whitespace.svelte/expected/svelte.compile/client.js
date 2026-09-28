import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Whitespace($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		whitespace: 'normal',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		whitespace: 'nowrap',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		whitespace: 'preline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}