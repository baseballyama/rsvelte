import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Span } from "flowbite-svelte";

var root = $.from_html(`<!><!>`, 1);

export default function LineThrough($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Span(node, {
		class: 'line-through',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('$109');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node);

	Span(node_1, {
		class: 'ms-3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('$79');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}