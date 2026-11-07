import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Popover(node_1, {
		class: 'w-64 text-sm font-light ',
		title: 'Popover title',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}