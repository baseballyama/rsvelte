import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <span class="sr-only">Icon description</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function IconOnly($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Badge(node, {
		color: 'gray',
		large: true,
		class: 'p-1! font-semibold!',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			CheckOutline(node_1, { class: 'h-3 w-3' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Badge(node_2, {
		rounded: true,
		large: true,
		class: 'p-1! font-semibold!',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_3 = $.first_child(fragment_2);

			CheckOutline(node_3, { class: 'text-primary-800 dark:text-primary-400 h-3 w-3' });
			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}