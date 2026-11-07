import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";
import { ClockSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> 3 days ago`, 1);
var root_1 = $.from_html(`<!> 2 minutes ago`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Icon($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Badge(node, {
		color: 'gray',
		border: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ClockSolid(node_1, { class: 'me-1.5 h-2.5 w-2.5' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Badge(node_2, {
		border: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			ClockSolid(node_3, {
				class: 'text-primary-800 dark:text-primary-400 me-1.5 h-2.5 w-2.5'
			});

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}