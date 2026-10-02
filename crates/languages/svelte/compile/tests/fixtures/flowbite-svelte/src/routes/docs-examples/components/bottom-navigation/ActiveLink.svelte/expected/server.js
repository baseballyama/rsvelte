import * as $ from 'svelte/internal/server';
import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

import { page } from "$app/state";

export default function ActiveLink($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = $.derived(() => page.url.pathname);

		Skeleton($$renderer, { class: 'py-4' });
		$$renderer.push(`<!----> `);
		ImagePlaceholder($$renderer, { class: 'pb-20' });
		$$renderer.push(`<!----> `);

		BottomNav($$renderer, {
			activeUrl: activeUrl(),
			position: 'absolute',
			classes: { inner: "grid-cols-4" },
			activeClass: 'font-bold text-green-500 hover:text-green-900 dark:hover:text-green-700 dark:text-green-300',
			children: ($$renderer) => {
				BottomNavItem($$renderer, {
					btnName: 'Home',
					href: '/',
					children: ($$renderer) => {
						HomeSolid($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Quickstart',
					href: '/docs/pages/quickstart',
					children: ($$renderer) => {
						WalletSolid($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'BottomNav',
					href: '/docs/components/bottom-navigation',
					children: ($$renderer) => {
						AdjustmentsVerticalOutline($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Accordion',
					href: '/docs/components/accordion',
					children: ($$renderer) => {
						UserCircleSolid($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}