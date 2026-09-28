import * as $ from 'svelte/internal/server';

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

export default function Bottom($$renderer) {
	$$renderer.push(`<div class="relative flex flex-col p-6">`);
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'pb-20' });
	$$renderer.push(`<!----> `);

	{
		function header($$renderer) {
			BottomNavHeader($$renderer, {
				children: ($$renderer) => {
					BottomNavHeaderItem($$renderer, { itemName: 'New' });
					$$renderer.push(`<!----> `);
					BottomNavHeaderItem($$renderer, { itemName: 'Popular', active: true });
					$$renderer.push(`<!----> `);
					BottomNavHeaderItem($$renderer, { itemName: 'Following' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		BottomNav($$renderer, {
			position: 'absolute',
			navType: 'group',
			classes: { inner: "grid-cols-5" },
			header,
			children: ($$renderer) => {
				BottomNavItem($$renderer, {
					btnName: 'Home',
					id: 'group-home',
					children: ($$renderer) => {
						HomeSolid($$renderer, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					arrow: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Bookmark',
					id: 'group-bookmark',
					children: ($$renderer) => {
						BookmarkSolid($$renderer, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					arrow: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Bookmark`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'New post',
					id: 'group-new',
					children: ($$renderer) => {
						PlusOutline($$renderer, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					arrow: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->New Post`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Search',
					id: 'group-search',
					children: ($$renderer) => {
						SearchOutline($$renderer, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					arrow: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Search`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Settings',
					id: 'group-settings',
					children: ($$renderer) => {
						AdjustmentsVerticalOutline($$renderer, {
							class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					arrow: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Settings`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { header: true, default: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}