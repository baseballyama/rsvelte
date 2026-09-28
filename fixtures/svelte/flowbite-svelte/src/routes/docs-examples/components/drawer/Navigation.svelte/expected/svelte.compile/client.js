import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Drawer,
	CardPlaceholder,
	Button,
	Sidebar,
	SidebarWrapper,
	SidebarDropdownWrapper,
	SidebarGroup,
	SidebarItem
} from "flowbite-svelte";

import {
	ChartPieSolid,
	CartSolid,
	GridSolid,
	MailBoxSolid,
	UsersSolid,
	ShoppingBagSolid,
	ArrowRightToBracketOutline,
	EditOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">Pro</span>`);
var root_2 = $.from_html(`<span class="text-primary-600 bg-primary-200 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium">3</span>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<h5 class="px-6 py-4 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">Menu</h5> <!>`, 1);
var root_5 = $.from_html(`<div class="text-center"><!> <!></div> <!>`, 1);

export default function Navigation($$anchor) {
	let open2 = $.state(false);
	let spanClass = "flex-1 ms-3 whitespace-nowrap";
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => $.set(open2, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show navigation');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CardPlaceholder(node_1, { size: '2xl', class: 'mt-6' });
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Drawer(node_2, {
		class: 'w-64 bg-gray-50 p-0 dark:bg-gray-800',
		get open() {
			return $.get(open2);
		},

		set open($$value) {
			$.set(open2, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_3 = $.sibling($.first_child(fragment_1), 2);

			Sidebar(node_3, {
				disableBreakpoints: true,
				class: 'top-16',
				children: ($$anchor, $$slotProps) => {
					SidebarWrapper($$anchor, {
						class: 'overflow-y-auto rounded-sm px-3 py-0 dark:bg-gray-800',
						children: ($$anchor, $$slotProps) => {
							SidebarGroup($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_4 = $.first_child(fragment_4);

									{
										const icon = ($$anchor) => {
											ChartPieSolid($$anchor, {
												class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
											});
										};

										SidebarItem(node_4, { label: 'Dashboard', icon, $$slots: { icon: true } });
									}

									var node_5 = $.sibling(node_4, 2);

									{
										const icon = ($$anchor) => {
											CartSolid($$anchor, {
												class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
											});
										};

										SidebarDropdownWrapper(node_5, {
											label: 'E-commerce',
											icon,
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_6 = $.first_child(fragment_7);

												SidebarItem(node_6, { label: 'Products' });

												var node_7 = $.sibling(node_6, 2);

												SidebarItem(node_7, { label: 'Billing' });

												var node_8 = $.sibling(node_7, 2);

												SidebarItem(node_8, { label: 'Invoice' });
												$.append($$anchor, fragment_7);
											},
											$$slots: { icon: true, default: true }
										});
									}

									var node_9 = $.sibling(node_5, 2);

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

										SidebarItem(node_9, {
											label: 'Kanban',
											spanClass,
											icon,
											subtext,
											$$slots: { icon: true, subtext: true }
										});
									}

									var node_10 = $.sibling(node_9, 2);

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

										SidebarItem(node_10, {
											label: 'Inbox',
											spanClass,
											icon,
											subtext,
											$$slots: { icon: true, subtext: true }
										});
									}

									var node_11 = $.sibling(node_10, 2);

									{
										const icon = ($$anchor) => {
											UsersSolid($$anchor, {
												class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
											});
										};

										SidebarItem(node_11, { label: 'Users', icon, $$slots: { icon: true } });
									}

									var node_12 = $.sibling(node_11, 2);

									{
										const icon = ($$anchor) => {
											ShoppingBagSolid($$anchor, {
												class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
											});
										};

										SidebarItem(node_12, { label: 'Products', icon, $$slots: { icon: true } });
									}

									var node_13 = $.sibling(node_12, 2);

									{
										const icon = ($$anchor) => {
											ArrowRightToBracketOutline($$anchor, {
												class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
											});
										};

										SidebarItem(node_13, { label: 'Sign In', icon, $$slots: { icon: true } });
									}

									var node_14 = $.sibling(node_13, 2);

									{
										const icon = ($$anchor) => {
											EditOutline($$anchor, {
												class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
											});
										};

										SidebarItem(node_14, { label: 'Sign Up', icon, $$slots: { icon: true } });
									}

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}