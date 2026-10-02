import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Border($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'pb-20' });

	var node_2 = $.sibling(node_1, 2);

	BottomNav(node_2, {
		position: 'absolute',
		navType: 'border',
		classes: { inner: "grid-cols-4" },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			BottomNavItem(node_3, {
				btnName: 'Home',
				children: ($$anchor, $$slotProps) => {
					HomeSolid($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			BottomNavItem(node_4, {
				btnName: 'Wallet',
				children: ($$anchor, $$slotProps) => {
					WalletSolid($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			BottomNavItem(node_5, {
				btnName: 'Settings',
				children: ($$anchor, $$slotProps) => {
					AdjustmentsVerticalOutline($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			BottomNavItem(node_6, {
				btnName: 'Profile',
				children: ($$anchor, $$slotProps) => {
					UserCircleSolid($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}