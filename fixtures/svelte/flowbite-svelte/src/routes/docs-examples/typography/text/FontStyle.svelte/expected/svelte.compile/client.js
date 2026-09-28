import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function FontStyle($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		italic: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The crypto identity primitive.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('The crypto identity primitive.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}