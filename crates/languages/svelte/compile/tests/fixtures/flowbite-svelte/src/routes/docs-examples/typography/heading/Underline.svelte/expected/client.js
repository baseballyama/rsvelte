import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, P, Span } from "flowbite-svelte";

var root = $.from_html(`We invest in the <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Underline($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h1',
		class: 'mb-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			Span(node_1, {
				underline: true,
				class: 'decoration-blue-400 decoration-8 dark:decoration-blue-600',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('world’s potential');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}