import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Dropdown,
	DropdownItem,
	DropdownGroup,
	Checkbox,
	Button,
	Search
} from "flowbite-svelte";

import { ChevronDownOutline, UserRemoveSolid } from "flowbite-svelte-icons";

var root = $.from_html(`Project users<!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="p-3"><!></div> <!> <a href="/" class="-mb-1 flex items-center bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600"><!>Delete user</a>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_1($$anchor) {
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
			var fragment_2 = root_2();
			var div = $.first_child(fragment_2);
			var node_3 = $.child(div);

			Search(node_3, { size: 'md' });
			$.reset(div);

			var node_4 = $.sibling(div, 2);

			DropdownGroup(node_4, {
				class: 'h-48 overflow-y-auto',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					DropdownItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Robert Gouth');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Jese Leos');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					DropdownItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								checked: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Bonnie Green');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					DropdownItem(node_8, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Jese Leos');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					DropdownItem(node_9, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Robert Gouth');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					DropdownItem(node_10, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Bonnie Green');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var a = $.sibling(node_4, 2);
			var node_11 = $.child(a);

			UserRemoveSolid(node_11, { class: 'me-1 h-5 w-5' });
			$.next();
			$.reset(a);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}