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
	FileCirclePlusOutline,
	BookmarkSolid,
	AngleLeftOutline,
	AngleRightOutline,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!> <div class="col-span-2 flex items-center justify-center"><div class="mx-2 flex w-full max-w-[128px] items-center justify-between rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"><button type="button" class="inline-flex h-8 items-center justify-center rounded-s-lg bg-gray-100 px-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-200 focus:outline-hidden dark:bg-gray-600 dark:hover:bg-gray-800 dark:focus:ring-gray-800"><!> <span class="sr-only">Previous page</span></button> <span class="mx-1 shrink-0 text-sm font-medium">1 of 345</span> <button type="button" class="inline-flex h-8 items-center justify-center rounded-e-lg bg-gray-100 px-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-200 focus:outline-hidden dark:bg-gray-600 dark:hover:bg-gray-800 dark:focus:ring-gray-800"><!> <span class="sr-only">Next page</span></button></div></div> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Pagination($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'pb-20' });

	var node_2 = $.sibling(node_1, 2);

	BottomNav(node_2, {
		position: 'absolute',
		navType: 'pagination',
		classes: { inner: "grid-cols-6" },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			BottomNavItem(node_3, {
				btnName: 'New document',
				children: ($$anchor, $$slotProps) => {
					FileCirclePlusOutline($$anchor, {
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

					var text = $.text('New document');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			BottomNavItem(node_5, {
				btnName: 'Bookmark',
				children: ($$anchor, $$slotProps) => {
					BookmarkSolid($$anchor, {
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

					var text_1 = $.text('Bookmark');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_6, 2);
			var div_1 = $.child(div);
			var button = $.child(div_1);
			var node_7 = $.child(button);

			AngleLeftOutline(node_7, { class: 'ms-1 h-2 w-2' });
			$.next(2);
			$.reset(button);

			var button_1 = $.sibling(button, 4);
			var node_8 = $.child(button_1);

			AngleRightOutline(node_8, { class: 'me-1 h-2 w-2' });
			$.next(2);
			$.reset(button_1);
			$.reset(div_1);
			$.reset(div);

			var node_9 = $.sibling(div, 2);

			BottomNavItem(node_9, {
				btnName: 'Settings',
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

					var text_2 = $.text('Settings');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			BottomNavItem(node_11, {
				btnName: 'Profile',
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

					var text_3 = $.text('Profile');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}