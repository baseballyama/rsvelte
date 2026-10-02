import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownHeader,
	DropdownGroup
} from "flowbite-svelte";

import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Small dropdown<!>`, 1);
var root_3 = $.from_html(`Large dropdown<!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Dropdown(node, {
		triggeredBy: '.sizes',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			DropdownGroup(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					DropdownItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Dashboard');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Settings');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Earnings');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			DropdownHeader(node_5, {
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

	var node_6 = $.sibling(node, 2);

	Button(node_6, {
		class: 'sizes',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_3 = root_2();
			var node_7 = $.sibling($.first_child(fragment_3));

			ChevronDownOutline(node_7, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 2);

	Button(node_8, {
		class: 'sizes',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_4 = root_3();
			var node_9 = $.sibling($.first_child(fragment_4));

			ChevronDownOutline(node_9, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}