import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Dropdown,
	DropdownItem,
	Avatar,
	DropdownHeader,
	DropdownGroup
} from "flowbite-svelte";

var root = $.from_html(`<span class="block text-sm text-gray-900 dark:text-white">Bonnie Green</span> <span class="block truncate text-sm font-medium">name@flowbite.com</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function User($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Avatar(node, {
		class: 'acs',
		src: '/images/profile-picture-3.webp',
		dot: { color: "green" }
	});

	var node_1 = $.sibling(node, 2);

	Dropdown(node_1, {
		triggeredBy: '.acs',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			DropdownHeader(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			DropdownGroup(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					DropdownItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Dashboard');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Settings');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Earnings');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					DropdownItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Sign out');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}