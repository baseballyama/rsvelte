import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown, DropdownItem, DropdownGroup, Avatar } from "flowbite-svelte";
import { BellSolid, EyeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <div class="w-full ps-3"><div class="mb-1.5 text-sm text-gray-500 dark:text-gray-400">New message from <span class="font-semibold text-gray-900 dark:text-white">Jese Leos</span> : "Hey, what's up? All set for the presentation?"</div> <div class="text-primary-600 dark:text-primary-500 text-xs">a few moments ago</div></div>`, 1);
var root_1 = $.from_html(`<!> <div class="w-full ps-3"><div class="mb-1.5 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and <span class="font-medium text-gray-900 dark:text-white">5 others</span> started following you.</div> <div class="text-primary-600 dark:text-primary-500 text-xs">10 minutes ago</div></div>`, 1);
var root_2 = $.from_html(`<!> <div class="w-full ps-3"><div class="mb-1.5 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold text-gray-900 dark:text-white">Bonnie Green</span> and <span class="font-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.</div> <div class="text-primary-600 dark:text-primary-500 text-xs">44 minutes ago</div></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="py-2 text-center font-bold">Notifications</div> <!> <a href="/" class="-my-1 block bg-gray-50 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"><div class="inline-flex items-center"><!> View all</div></a>`, 1);
var root_5 = $.from_html(`<div id="bell" class="inline-flex items-center text-center text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-hidden dark:text-gray-400 dark:hover:text-white"><!> <div class="relative flex"><div class="relative end-4 -top-2 inline-flex h-3 w-3 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></div></div></div> <!>`, 1);

export default function Notification($$anchor) {
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	BellSolid(node, { class: 'h-8 w-8' });
	$.next(2);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Dropdown(node_1, {
		triggeredBy: '#bell',
		class: 'w-full max-w-sm divide-y divide-gray-100 rounded-sm shadow-sm dark:divide-gray-700 dark:bg-gray-800',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

			DropdownGroup(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_3 = $.first_child(fragment_2);

					DropdownItem(node_3, {
						class: 'flex space-x-4 rtl:space-x-reverse',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							Avatar(node_4, {
								src: '/images/profile-picture-1.webp',
								dot: { color: "gray" }
							});

							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					DropdownItem(node_5, {
						class: 'flex space-x-4 rtl:space-x-reverse',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_6 = $.first_child(fragment_4);

							Avatar(node_6, { src: '/images/profile-picture-2.webp', dot: { color: "red" } });
							$.next(2);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_5, 2);

					DropdownItem(node_7, {
						class: 'flex space-x-4 rtl:space-x-reverse',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_8 = $.first_child(fragment_5);

							Avatar(node_8, {
								src: '/images/profile-picture-3.webp',
								dot: { color: "green" }
							});

							$.next(2);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var a = $.sibling(node_2, 2);
			var div_1 = $.child(a);
			var node_9 = $.child(div_1);

			EyeSolid(node_9, { class: 'me-2 h-4 w-4 text-gray-500 dark:text-gray-400' });
			$.next();
			$.reset(div_1);
			$.reset(a);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}