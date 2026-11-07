import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

import { page } from "$app/state";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function ActiveLink($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.derived(() => page.url.pathname);
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
		activeClass: 'font-bold text-green-500 hover:text-green-900 dark:hover:text-green-700 dark:text-green-300',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			BottomNavItem(node_3, {
				btnName: 'Home',
				href: '/',
				children: ($$anchor, $$slotProps) => {
					HomeSolid($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			BottomNavItem(node_4, {
				btnName: 'Quickstart',
				href: '/docs/pages/quickstart',
				children: ($$anchor, $$slotProps) => {
					WalletSolid($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			BottomNavItem(node_5, {
				btnName: 'BottomNav',
				href: '/docs/components/bottom-navigation',
				children: ($$anchor, $$slotProps) => {
					AdjustmentsVerticalOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			BottomNavItem(node_6, {
				btnName: 'Accordion',
				href: '/docs/components/accordion',
				children: ($$anchor, $$slotProps) => {
					UserCircleSolid($$anchor, {});
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