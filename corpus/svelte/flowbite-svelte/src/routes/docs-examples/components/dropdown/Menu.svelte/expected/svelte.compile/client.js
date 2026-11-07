import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown, DropdownItem } from "flowbite-svelte";
import { DotsHorizontalOutline, DotsVerticalOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Menu($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	DotsHorizontalOutline(node, { class: 'dots-menu dark:text-white' });

	var node_1 = $.sibling(node, 2);

	DotsVerticalOutline(node_1, { class: 'dots-menu dark:text-white' });

	var node_2 = $.sibling(node_1, 2);

	Dropdown(node_2, {
		simple: true,
		triggeredBy: '.dots-menu',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

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

			var node_5 = $.sibling(node_4, 2);

			DropdownItem(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Earnings');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			DropdownItem(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Sign out');

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