import * as $ from 'svelte/internal/server';

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

export default function Application($$renderer) {
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'pb-20' });
	$$renderer.push(`<!----> `);

	BottomNav($$renderer, {
		position: 'absolute',
		navType: 'application',
		classes: { inner: "grid-cols-5" },
		children: ($$renderer) => {
			BottomNavItem($$renderer, {
				btnName: 'Home',
				appBtnPosition: 'left',
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
				btnName: 'Wallet',
				appBtnPosition: 'middle',
				children: ($$renderer) => {
					WalletSolid($$renderer, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				arrow: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Wallet`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-center justify-center">`);

			BottomNavItem($$renderer, {
				btnName: 'Create new item',
				appBtnPosition: 'middle',
				class: 'bg-primary-600 hover:bg-primary-700 group focus:ring-primary-300 dark:focus:ring-primary-800 inline-flex h-10 w-10 items-center justify-center rounded-full font-medium focus:ring-4 focus:outline-hidden',
				children: ($$renderer) => {
					PlusOutline($$renderer, { class: 'text-white' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				arrow: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Create new item`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			BottomNavItem($$renderer, {
				btnName: 'Settings',
				appBtnPosition: 'middle',
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
				appBtnPosition: 'right',
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