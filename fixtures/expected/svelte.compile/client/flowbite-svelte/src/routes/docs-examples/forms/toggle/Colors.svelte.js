import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Colors($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Toggle(node, {
		color: 'red',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Red');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		color: 'green',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Green');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Toggle(node_2, {
		color: 'purple',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Purple');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Toggle(node_3, {
		color: 'yellow',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Yellow');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Toggle(node_4, {
		color: 'teal',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Teal');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Toggle(node_5, {
		color: 'orange',
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Orange');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}