import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Outline($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		outline: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		outline: true,
		color: 'dark',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Dark');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		outline: true,
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Green');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		outline: true,
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Red');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		outline: true,
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Yellow');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		outline: true,
		color: 'purple',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Purple');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}