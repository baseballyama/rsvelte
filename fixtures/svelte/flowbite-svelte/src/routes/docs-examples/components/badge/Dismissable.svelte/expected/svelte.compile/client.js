import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dismissable($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Badge(node, {
		dismissable: true,
		large: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Badge(node_1, {
		dismissable: true,
		large: true,
		color: 'gray',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Gray');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Badge(node_2, {
		dismissable: true,
		large: true,
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Red');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Badge(node_3, {
		dismissable: true,
		large: true,
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Green');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Badge(node_4, {
		dismissable: true,
		large: true,
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Yellow');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Badge(node_5, {
		dismissable: true,
		large: true,
		color: 'indigo',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Indigo');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Badge(node_6, {
		dismissable: true,
		large: true,
		color: 'purple',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Purple');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Badge(node_7, {
		dismissable: true,
		large: true,
		color: 'pink',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Pink');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}