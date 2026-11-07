import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		color: 'alternative',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Alternative');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		color: 'dark',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Dark');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		color: 'light',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Light');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Blue');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Green');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Red');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Yellow');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Button(node_8, {
		color: 'purple',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Purple');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}