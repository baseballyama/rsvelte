import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown button<!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Onclose($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	// onclose fires only when closing
	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			ChevronDownOutline(node_1, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Dropdown(node_2, {
		simple: true,
		onclose: (ev) => console.log("Dropdown closed", ev),
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			DropdownItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dashboard');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			DropdownItem(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}