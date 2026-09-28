import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabItem } from "flowbite-svelte";

var root = $.from_html(`<span>Profile</span>`);
var root_1 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_2 = $.from_html(`<span>Dashboard</span>`);
var root_3 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_4 = $.from_html(`<span>Settings</span>`);
var root_5 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_6 = $.from_html(`<span>Users</span>`);
var root_7 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Full($$anchor) {
	Tabs($$anchor, {
		tabStyle: 'full',
		class: 'flex divide-x divide-gray-200 rounded-lg shadow-sm rtl:divide-x-reverse dark:divide-gray-700',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_8();
			var node = $.first_child(fragment_1);

			{
				const titleSlot = ($$anchor) => {
					var span = root();

					$.append($$anchor, span);
				};

				TabItem(node, {
					class: 'w-full',
					open: true,
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p = root_1();

						$.append($$anchor, p);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				const titleSlot = ($$anchor) => {
					var span_1 = root_2();

					$.append($$anchor, span_1);
				};

				TabItem(node_1, {
					class: 'w-full',
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_1 = root_3();

						$.append($$anchor, p_1);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const titleSlot = ($$anchor) => {
					var span_2 = root_4();

					$.append($$anchor, span_2);
				};

				TabItem(node_2, {
					class: 'w-full',
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_2 = root_5();

						$.append($$anchor, p_2);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				const titleSlot = ($$anchor) => {
					var span_3 = root_6();

					$.append($$anchor, span_3);
				};

				TabItem(node_3, {
					class: 'w-full',
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_3 = root_7();

						$.append($$anchor, p_3);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}