import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Li, List, Heading } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Unordered($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h2',
		class: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Password requirements');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	List(node_1, {
		tag: 'ul',
		class: 'space-y-1 text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Li(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('At least 10 characters (and up to 100 characters)');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Li(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('At least one lowercase character');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Li(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Inclusion of at least one special character, e.g., ! @ # ?');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}