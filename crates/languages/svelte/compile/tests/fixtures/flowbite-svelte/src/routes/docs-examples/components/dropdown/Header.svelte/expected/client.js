import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownGroup,
	DropdownHeader
} from "flowbite-svelte";

import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown button<!>`, 1);
var root_1 = $.from_html(`<span class="block text-sm text-gray-900 dark:text-white">Bonnie Green</span> <span class="block truncate text-sm font-medium">name@flowbite.com</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

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
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_3();
			var node_3 = $.first_child(fragment_2);

			DropdownHeader(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();

					$.next(2);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			DropdownGroup(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_5 = $.first_child(fragment_4);

					DropdownItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Dashboard');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Settings');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					DropdownItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Earnings');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					DropdownItem(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Sign out');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}