import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function IconColor($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.derived(() => page.url.pathname);
	let svgClass = "mb-1 text-pink-500 dark:text-pink-400 group-hover:text-pink-600 dark:group-hover:text-pink-500";
	let svgActiveClass = "mb-1 text-green-500 dark:text-green-500 group-hover:text-green-700 dark:group-hover:text-green-700";
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'pb-20' });

	var node_2 = $.sibling(node_1, 2);

	BottomNav(node_2, {
		get activeUrl() {
			return $.get(activeUrl);
		},
		position: 'absolute',
		classes: { inner: "grid-cols-4" },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			BottomNavItem(node_3, {
				btnName: 'Home',
				href: '/',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => $.get(activeUrl) === "/" ? svgActiveClass : svgClass);

						HomeSolid($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			BottomNavItem(node_4, {
				btnName: 'Quickstart',
				href: '/docs/pages/quickstart',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => $.get(activeUrl) === "/docs/pages/quickstart" ? svgActiveClass : svgClass);

						WalletSolid($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			BottomNavItem(node_5, {
				btnName: 'BottomNav',
				href: '/docs/components/bottom-navigation',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => $.get(activeUrl) === "/docs/components/bottom-navigation" ? svgActiveClass : svgClass);

						AdjustmentsVerticalOutline($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			BottomNavItem(node_6, {
				btnName: 'Accordion',
				href: '/docs/components/accordion',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => $.get(activeUrl) === "/docs/components/accordion" ? svgActiveClass : svgClass);

						UserCircleSolid($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}