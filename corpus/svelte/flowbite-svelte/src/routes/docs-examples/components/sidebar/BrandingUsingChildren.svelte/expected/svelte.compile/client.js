import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	SidebarButton,
	SidebarBrand,
	uiHelpers,
	CloseButton
} from "flowbite-svelte";

import { ChartOutline, GridSolid, MailBoxSolid, UserSolid } from "flowbite-svelte-icons";
import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";
import { page } from "$app/state";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" alt="Flowbite Svelte" class="h-6 w-6"/> <span class="ml-2 self-center text-xl font-semibold whitespace-nowrap dark:text-white">Svelte 5 UI Lib</span>`, 1);
var root_1 = $.from_html(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">Pro</span>`);
var root_2 = $.from_html(`<span class="bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium">3</span>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <div class="relative"><!> <div class="h-96 overflow-auto px-4 md:ml-64"><div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700"><!> <!> <!> <!> <!></div></div></div>`, 1);

export default function BrandingUsingChildren($$anchor, $$props) {
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

	var fragment = root_5();
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
		class: 'z-50 h-full',
		position: 'absolute',
		classes: { nonactive: "p-2", active: "p-2" },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_2 = $.first_child(fragment_1);

			CloseButton(node_2, {
				get onclick() {
					return closeDemoSidebar;
				},
				color: 'gray',
				class: 'absolute top-3 right-1 p-2 md:hidden'
			});

			var node_3 = $.sibling(node_2, 2);

			SidebarGroup(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_4 = $.first_child(fragment_2);

					SidebarBrand(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();

							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					{
						const icon = ($$anchor) => {
							ChartOutline($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarItem(node_5, { label: 'Dashboard', href: '/', icon, $$slots: { icon: true } });
					}

					var node_6 = $.sibling(node_5, 2);

					{
						const icon = ($$anchor) => {
							GridSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						const subtext = ($$anchor) => {
							var span = root_1();

							$.append($$anchor, span);
						};

						SidebarItem(node_6, {
							label: 'Kanban',
							spanClass,
							href: '/',
							icon,
							subtext,
							$$slots: { icon: true, subtext: true }
						});
					}

					var node_7 = $.sibling(node_6, 2);

					{
						const icon = ($$anchor) => {
							MailBoxSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						const subtext = ($$anchor) => {
							var span_1 = root_2();

							$.append($$anchor, span_1);
						};

						SidebarItem(node_7, {
							label: 'Inbox',
							spanClass,
							href: '/',
							icon,
							subtext,
							$$slots: { icon: true, subtext: true }
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						const icon = ($$anchor) => {
							UserSolid($$anchor, {
								class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
							});
						};

						SidebarItem(node_8, {
							label: 'Sidebar',
							href: '/components/sidebar',
							icon,
							$$slots: { icon: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_1, 2);
	var div_2 = $.child(div_1);
	var node_9 = $.child(div_2);

	PlusPlaceholder(node_9, { colnum: 3, rownum: 1 });

	var node_10 = $.sibling(node_9, 2);

	PlusPlaceholder(node_10, {});

	var node_11 = $.sibling(node_10, 2);

	PlusPlaceholder(node_11, { colnum: 2, rownum: 2 });

	var node_12 = $.sibling(node_11, 2);

	PlusPlaceholder(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	PlusPlaceholder(node_13, { colnum: 2, rownum: 2 });
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}