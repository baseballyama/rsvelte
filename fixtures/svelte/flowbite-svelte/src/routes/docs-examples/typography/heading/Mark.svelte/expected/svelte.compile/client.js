import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, P, Mark } from "flowbite-svelte";

var root = $.from_html(`Regain <!> over your days`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Mark_1($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h1',
		class: 'mb-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			Mark(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('control');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
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