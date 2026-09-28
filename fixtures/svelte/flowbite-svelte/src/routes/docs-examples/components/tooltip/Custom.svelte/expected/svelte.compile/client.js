import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Custom($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Green tooltip');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tooltip(node_1, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Tooltip content');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Yellow tooltip');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tooltip(node_3, {
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Tooltip content');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Custom type');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Tooltip(node_5, {
		placement: 'right',
		type: 'custom',
		class: 'border-none bg-purple-500 p-4 text-lg font-medium text-gray-100 dark:bg-purple-600',
		arrow: false,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Tooltip content');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}