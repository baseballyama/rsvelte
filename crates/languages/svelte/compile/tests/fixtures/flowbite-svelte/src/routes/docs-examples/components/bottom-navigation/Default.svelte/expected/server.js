import * as $ from 'svelte/internal/server';
import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

export default function Default($$renderer) {
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'pb-20' });
	$$renderer.push(`<!----> `);

	BottomNav($$renderer, {
		position: 'absolute',
		classes: { inner: "grid-cols-4" },
		children: ($$renderer) => {
			BottomNavItem($$renderer, {
				btnName: 'Home',
				children: ($$renderer) => {
					HomeSolid($$renderer, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BottomNavItem($$renderer, {
				btnName: 'Wallet',
				children: ($$renderer) => {
					WalletSolid($$renderer, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

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

			BottomNavItem($$renderer, {
				btnName: 'Profile',
				children: ($$renderer) => {
					UserCircleSolid($$renderer, {
						class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}