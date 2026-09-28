import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

export default function IconColor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = $.derived(() => page.url.pathname);
		let svgClass = "mb-1 text-pink-500 dark:text-pink-400 group-hover:text-pink-600 dark:group-hover:text-pink-500";
		let svgActiveClass = "mb-1 text-green-500 dark:text-green-500 group-hover:text-green-700 dark:group-hover:text-green-700";

		Skeleton($$renderer, { class: 'py-4' });
		$$renderer.push(`<!----> `);
		ImagePlaceholder($$renderer, { class: 'pb-20' });
		$$renderer.push(`<!----> `);

		BottomNav($$renderer, {
			activeUrl: activeUrl(),
			position: 'absolute',
			classes: { inner: "grid-cols-4" },
			children: ($$renderer) => {
				BottomNavItem($$renderer, {
					btnName: 'Home',
					href: '/',
					children: ($$renderer) => {
						HomeSolid($$renderer, { class: activeUrl() === "/" ? svgActiveClass : svgClass });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Quickstart',
					href: '/docs/pages/quickstart',
					children: ($$renderer) => {
						WalletSolid($$renderer, {
							class: activeUrl() === "/docs/pages/quickstart" ? svgActiveClass : svgClass
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'BottomNav',
					href: '/docs/components/bottom-navigation',
					children: ($$renderer) => {
						AdjustmentsVerticalOutline($$renderer, {
							class: activeUrl() === "/docs/components/bottom-navigation" ? svgActiveClass : svgClass
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BottomNavItem($$renderer, {
					btnName: 'Accordion',
					href: '/docs/components/accordion',
					children: ($$renderer) => {
						UserCircleSolid($$renderer, {
							class: activeUrl() === "/docs/components/accordion" ? svgActiveClass : svgClass
						});
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