import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabItem } from "flowbite-svelte";

var root = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_1 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_2 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_3 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_4 = $.from_html(`<span class="text-gray-400 dark:text-gray-500">Disabled</span>`);
var root_5 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Disabled:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function ActiveClass($$anchor) {
	Tabs($$anchor, {
		classes: {
			active: "p-4 text-white bg-blue-500 rounded-t-lg dark:bg-blue-600 dark:text-white"
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			TabItem(node, {
				open: true,
				title: 'Profile',
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			TabItem(node_1, {
				title: 'Settings',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			TabItem(node_2, {
				title: 'Users',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_2();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			TabItem(node_3, {
				title: 'Dashboard',
				children: ($$anchor, $$slotProps) => {
					var p_3 = root_3();

					$.append($$anchor, p_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			{
				const titleSlot = ($$anchor) => {
					var span = root_4();

					$.append($$anchor, span);
				};

				TabItem(node_4, {
					disabled: true,
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_4 = root_5();

						$.append($$anchor, p_4);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}