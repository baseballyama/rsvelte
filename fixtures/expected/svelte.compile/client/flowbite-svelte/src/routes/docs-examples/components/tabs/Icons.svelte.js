import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabItem } from "flowbite-svelte";

import {
	UserCircleSolid,
	GridSolid,
	AdjustmentsVerticalSolid,
	ClipboardSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex items-center gap-2"><!> Profile</div>`);
var root_1 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> Dashboard</div>`);
var root_3 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_4 = $.from_html(`<div class="flex items-center gap-2"><!> Settings</div>`);
var root_5 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_6 = $.from_html(`<div class="flex items-center gap-2"><!> Contacts</div>`);
var root_7 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Contacts:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Icons($$anchor) {
	Tabs($$anchor, {
		tabStyle: 'underline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_8();
			var node = $.first_child(fragment_1);

			{
				const titleSlot = ($$anchor) => {
					var div = root();
					var node_1 = $.child(div);

					UserCircleSolid(node_1, { size: 'md' });
					$.next();
					$.reset(div);
					$.append($$anchor, div);
				};

				TabItem(node, {
					open: true,
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p = root_1();

						$.append($$anchor, p);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_2 = $.sibling(node, 2);

			{
				const titleSlot = ($$anchor) => {
					var div_1 = root_2();
					var node_3 = $.child(div_1);

					GridSolid(node_3, { size: 'md' });
					$.next();
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				TabItem(node_2, {
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_1 = root_3();

						$.append($$anchor, p_1);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				const titleSlot = ($$anchor) => {
					var div_2 = root_4();
					var node_5 = $.child(div_2);

					AdjustmentsVerticalSolid(node_5, { size: 'md' });
					$.next();
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				TabItem(node_4, {
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_2 = root_5();

						$.append($$anchor, p_2);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_6 = $.sibling(node_4, 2);

			{
				const titleSlot = ($$anchor) => {
					var div_3 = root_6();
					var node_7 = $.child(div_3);

					ClipboardSolid(node_7, { size: 'md' });
					$.next();
					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				TabItem(node_6, {
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