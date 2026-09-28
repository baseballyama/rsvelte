import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Helper } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function HelperText($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		'aria-describedby': 'helper-checkbox-text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Free shipping via Flowbite');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Helper(node_1, {
		id: 'helper-checkbox-text',
		class: 'ps-6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('For orders shipped from $25 in books or $29 in other categories');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}