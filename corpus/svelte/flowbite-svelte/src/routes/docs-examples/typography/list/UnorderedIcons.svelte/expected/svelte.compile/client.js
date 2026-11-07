import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li, Heading } from "flowbite-svelte";
import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> At least 10 characters (and up to 100 characters)`, 1);
var root_1 = $.from_html(`<!> At least one lowercase character`, 1);
var root_2 = $.from_html(`<!> Inclusion of at least one special character, e.g., ! @ # ?`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function UnorderedIcons($$anchor) {
	var fragment = root_4();
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
			var fragment_1 = root_3();
			var node_2 = $.first_child(fragment_1);

			Li(node_2, {
				icon: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					CheckCircleSolid(node_3, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Li(node_4, {
				icon: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					CheckCircleSolid(node_5, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Li(node_6, {
				icon: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_7 = $.first_child(fragment_4);

					CloseCircleSolid(node_7, { class: 'me-2 h-5 w-5 text-gray-500 dark:text-gray-400' });
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}