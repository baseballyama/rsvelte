import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	BottomNav,
	BottomNavItem,
	BottomNavHeader,
	BottomNavHeaderItem,
	Tooltip,
	Skeleton,
	ImagePlaceholder
} from "flowbite-svelte";

import {
	HomeSolid,
	BookmarkSolid,
	PlusOutline,
	SearchOutline,
	AdjustmentsVerticalOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="relative flex flex-col p-6"><!> <!> <!></div>`);

export default function Bottom($$anchor) {
	var div = root_2();
	var node = $.child(div);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'pb-20' });

	var node_2 = $.sibling(node_1, 2);

	{
		const header = ($$anchor) => {
			BottomNavHeader($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_3 = $.first_child(fragment_1);

					BottomNavHeaderItem(node_3, { itemName: 'New' });

					var node_4 = $.sibling(node_3, 2);

					BottomNavHeaderItem(node_4, { itemName: 'Popular', active: true });

					var node_5 = $.sibling(node_4, 2);

					BottomNavHeaderItem(node_5, { itemName: 'Following' });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		BottomNav(node_2, {
			position: 'absolute',
			navType: 'group',
			classes: { inner: "grid-cols-5" },
			header,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_6 = $.first_child(fragment_2);

				BottomNavItem(node_6, {
					btnName: 'Home',
					id: 'group-home',
					children: ($$anchor, $$slotProps) => {
						HomeSolid($$anchor, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Tooltip(node_7, {
					arrow: false,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Home');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				BottomNavItem(node_8, {
					btnName: 'Bookmark',
					id: 'group-bookmark',
					children: ($$anchor, $$slotProps) => {
						BookmarkSolid($$anchor, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Tooltip(node_9, {
					arrow: false,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Bookmark');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				BottomNavItem(node_10, {
					btnName: 'New post',
					id: 'group-new',
					children: ($$anchor, $$slotProps) => {
						PlusOutline($$anchor, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Tooltip(node_11, {
					arrow: false,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('New Post');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				BottomNavItem(node_12, {
					btnName: 'Search',
					id: 'group-search',
					children: ($$anchor, $$slotProps) => {
						SearchOutline($$anchor, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Tooltip(node_13, {
					arrow: false,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Search');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				BottomNavItem(node_14, {
					btnName: 'Settings',
					id: 'group-settings',
					children: ($$anchor, $$slotProps) => {
						AdjustmentsVerticalOutline($$anchor, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				Tooltip(node_15, {
					arrow: false,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Settings');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { header: true, default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}