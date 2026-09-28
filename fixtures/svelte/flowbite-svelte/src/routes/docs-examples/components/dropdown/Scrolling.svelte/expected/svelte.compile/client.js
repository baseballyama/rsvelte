import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem, DropdownGroup, Avatar } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Project users<!>`, 1);
var root_1 = $.from_html(`<!>Jese Leos`, 1);
var root_2 = $.from_html(`<!>Robert Gouth`, 1);
var root_3 = $.from_html(`<!>Bonnie Green`, 1);
var root_4 = $.from_html(`<!>Robert Wall`, 1);
var root_5 = $.from_html(`<!>Joseph Mcfall`, 1);
var root_6 = $.from_html(`<!>Leslie Livingston`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <a href="/" class="text-primary-600 dark:text-primary-500 -mb-1 flex items-center bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:hover:bg-gray-600"><!>Add new user</a>`, 1);
var root_9 = $.from_html(`<!> <!>`, 1);

export default function Scrolling($$anchor) {
	var fragment = root_9();
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
		class: 'h-48 w-48 overflow-y-auto py-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_8();
			var node_3 = $.first_child(fragment_2);

			DropdownGroup(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_7();
					var node_4 = $.first_child(fragment_3);

					DropdownItem(node_4, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_5 = $.first_child(fragment_4);

							Avatar(node_5, { src: '/images/profile-picture-1.webp', size: 'xs' });
							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_4, 2);

					DropdownItem(node_6, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_7 = $.first_child(fragment_5);

							Avatar(node_7, { src: '/images/profile-picture-2.webp', size: 'xs' });
							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_6, 2);

					DropdownItem(node_8, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_9 = $.first_child(fragment_6);

							Avatar(node_9, { src: '/images/profile-picture-3.webp', size: 'xs' });
							$.next();
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_8, 2);

					DropdownItem(node_10, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_4();
							var node_11 = $.first_child(fragment_7);

							Avatar(node_11, { src: '/images/profile-picture-1.webp', size: 'xs' });
							$.next();
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_10, 2);

					DropdownItem(node_12, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_5();
							var node_13 = $.first_child(fragment_8);

							Avatar(node_13, { src: '/images/profile-picture-2.webp', size: 'xs' });
							$.next();
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_12, 2);

					DropdownItem(node_14, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_6();
							var node_15 = $.first_child(fragment_9);

							Avatar(node_15, { src: '/images/profile-picture-3.webp', size: 'xs' });
							$.next();
							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var a = $.sibling(node_3, 2);
			var node_16 = $.child(a);

			ChevronDownOutline(node_16, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.next();
			$.reset(a);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}