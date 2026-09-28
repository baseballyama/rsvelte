import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default checkbox');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Checked state');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, {
		indeterminate: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Indeterminate state');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}