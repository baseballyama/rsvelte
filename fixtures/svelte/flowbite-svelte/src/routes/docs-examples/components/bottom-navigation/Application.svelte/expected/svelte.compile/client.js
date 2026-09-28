import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	BottomNav,
	BottomNavItem,
	Tooltip,
	Skeleton,
	ImagePlaceholder
} from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid,
	PlusOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!> <div class="flex items-center justify-center"><!> <!></div> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Application($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'pb-20' });

	var node_2 = $.sibling(node_1, 2);

	BottomNav(node_2, {
		position: 'absolute',
		navType: 'application',
		classes: { inner: "grid-cols-5" },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			BottomNavItem(node_3, {
				btnName: 'Home',
				appBtnPosition: 'left',
				children: ($$anchor, $$slotProps) => {
					HomeSolid($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Tooltip(node_4, {
				arrow: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			BottomNavItem(node_5, {
				btnName: 'Wallet',
				appBtnPosition: 'middle',
				children: ($$anchor, $$slotProps) => {
					WalletSolid($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Tooltip(node_6, {
				arrow: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Wallet');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_6, 2);
			var node_7 = $.child(div);

			BottomNavItem(node_7, {
				btnName: 'Create new item',
				appBtnPosition: 'middle',
				class: 'bg-primary-600 hover:bg-primary-700 group focus:ring-primary-300 dark:focus:ring-primary-800 inline-flex h-10 w-10 items-center justify-center rounded-full font-medium focus:ring-4 focus:outline-hidden',
				children: ($$anchor, $$slotProps) => {
					PlusOutline($$anchor, { class: 'text-white' });
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Tooltip(node_8, {
				arrow: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Create new item');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var node_9 = $.sibling(div, 2);

			BottomNavItem(node_9, {
				btnName: 'Settings',
				appBtnPosition: 'middle',
				children: ($$anchor, $$slotProps) => {
					AdjustmentsVerticalOutline($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Tooltip(node_10, {
				arrow: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Settings');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			BottomNavItem(node_11, {
				btnName: 'Profile',
				appBtnPosition: 'right',
				children: ($$anchor, $$slotProps) => {
					UserCircleSolid($$anchor, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Tooltip(node_12, {
				arrow: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Profile');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}