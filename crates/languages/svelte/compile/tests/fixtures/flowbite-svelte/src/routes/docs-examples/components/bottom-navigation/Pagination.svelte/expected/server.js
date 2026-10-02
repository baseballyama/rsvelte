import * as $ from 'svelte/internal/server';

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

export default function Pagination($$renderer) {
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'pb-20' });
	$$renderer.push(`<!----> `);

	BottomNav($$renderer, {
		position: 'absolute',
		navType: 'pagination',
		classes: { inner: "grid-cols-6" },
		children: ($$renderer) => {
			BottomNavItem($$renderer, {
				btnName: 'New document',
				children: ($$renderer) => {
					FileCirclePlusOutline($$renderer, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				arrow: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->New document`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BottomNavItem($$renderer, {
				btnName: 'Bookmark',
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

			$$renderer.push(`<!----> <div class="col-span-2 flex items-center justify-center"><div class="mx-2 flex w-full max-w-[128px] items-center justify-between rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"><button type="button" class="inline-flex h-8 items-center justify-center rounded-s-lg bg-gray-100 px-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-200 focus:outline-hidden dark:bg-gray-600 dark:hover:bg-gray-800 dark:focus:ring-gray-800">`);
			AngleLeftOutline($$renderer, { class: 'ms-1 h-2 w-2' });
			$$renderer.push(`<!----> <span class="sr-only">Previous page</span></button> <span class="mx-1 shrink-0 text-sm font-medium">1 of 345</span> <button type="button" class="inline-flex h-8 items-center justify-center rounded-e-lg bg-gray-100 px-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-200 focus:outline-hidden dark:bg-gray-600 dark:hover:bg-gray-800 dark:focus:ring-gray-800">`);
			AngleRightOutline($$renderer, { class: 'me-1 h-2 w-2' });
			$$renderer.push(`<!----> <span class="sr-only">Next page</span></button></div></div> `);

			BottomNavItem($$renderer, {
				btnName: 'Settings',
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

			$$renderer.push(`<!----> `);

			BottomNavItem($$renderer, {
				btnName: 'Profile',
				children: ($$renderer) => {
					UserCircleSolid($$renderer, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				arrow: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}