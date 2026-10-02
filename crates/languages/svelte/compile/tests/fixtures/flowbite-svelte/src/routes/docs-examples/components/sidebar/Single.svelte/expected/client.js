import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	SidebarDropdownWrapper,
	SidebarButton,
	uiHelpers
} from "flowbite-svelte";

import {
	ChartOutline,
	GridSolid,
	UserSolid,
	EditSolid,
	ShoppingBagSolid
} from "flowbite-svelte-icons";

import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";
import { page } from "$app/state";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="relative"><!> <div class="h-96 overflow-auto px-4 md:ml-64"><div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700"><!> <!> <!> <!> <!></div></div></div>`, 1);

export default function Single($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.state($.proxy(page.url.pathname));
	const spanClass = "flex-1 ms-3 whitespace-nowrap";
	const demoSidebarUi = uiHelpers();
	let isDemoOpen = $.state(false);
	const closeDemoSidebar = demoSidebarUi.close;

	$.user_effect(() => {
		$.set(isDemoOpen, demoSidebarUi.isOpen, true);
		$.set(activeUrl, page.url.pathname, true);
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	SidebarButton(node, {
		get onclick() {
			return demoSidebarUi.toggle;
		},
		class: 'mb-2'
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Sidebar(node_1, {
		get activeUrl() {
			return $.get(activeUrl);
		},
		backdrop: false,
		get isOpen() {
			return $.get(isDemoOpen);
		},

		get closeSidebar() {
			return closeDemoSidebar;
		},
		params: { x: -50, duration: 50 },
		position: 'absolute',
		classes: { nonactive: "p-2", active: "p-2" },
		class: 'z-50 h-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			SidebarGroup(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					{
						const icon = ($$anchor) => {
							ChartOutline($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarItem(node_3, { label: 'Dashboard', icon, $$slots: { icon: true } });
					}

					var node_4 = $.sibling(node_3, 2);

					{
						const icon = ($$anchor) => {
							ShoppingBagSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarDropdownWrapper(node_4, {
							label: 'Shop',
							classes: { btn: "p-2" },
							icon,
							children: ($$anchor, $$slotProps) => {
								SidebarItem($$anchor, { label: 'Products', href: '' });
							},
							$$slots: { icon: true, default: true }
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						const icon = ($$anchor) => {
							UserSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarDropdownWrapper(node_5, {
							label: 'Profile',
							classes: { btn: "p-2" },
							icon,
							children: ($$anchor, $$slotProps) => {
								SidebarItem($$anchor, { label: 'Projects', href: '/' });
							},
							$$slots: { icon: true, default: true }
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						const icon = ($$anchor) => {
							GridSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarItem(node_6, {
							label: 'Sidebar',
							spanClass,
							href: '/components/sidebar',
							icon,
							$$slots: { icon: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_2, 2);

			SidebarGroup(node_7, {
				border: true,
				children: ($$anchor, $$slotProps) => {
					{
						const icon = ($$anchor) => {
							EditSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarDropdownWrapper($$anchor, {
							label: 'Setting',
							classes: { btn: "p-2" },
							icon,
							children: ($$anchor, $$slotProps) => {
								SidebarItem($$anchor, { label: 'Account', href: '' });
							},
							$$slots: { icon: true, default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_1, 2);
	var div_2 = $.child(div_1);
	var node_8 = $.child(div_2);

	PlusPlaceholder(node_8, { colnum: 3, rownum: 1 });

	var node_9 = $.sibling(node_8, 2);

	PlusPlaceholder(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	PlusPlaceholder(node_10, { colnum: 2, rownum: 2 });

	var node_11 = $.sibling(node_10, 2);

	PlusPlaceholder(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	PlusPlaceholder(node_12, { colnum: 2, rownum: 2 });
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}