import * as $ from 'svelte/internal/server';

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

export default function Single($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = page.url.pathname;
		const spanClass = "flex-1 ms-3 whitespace-nowrap";
		const demoSidebarUi = uiHelpers();
		let isDemoOpen = false;
		const closeDemoSidebar = demoSidebarUi.close;

		SidebarButton($$renderer, { onclick: demoSidebarUi.toggle, class: 'mb-2' });
		$$renderer.push(`<!----> <div class="relative">`);

		Sidebar($$renderer, {
			activeUrl,
			backdrop: false,
			isOpen: isDemoOpen,
			closeSidebar: closeDemoSidebar,
			params: { x: -50, duration: 50 },
			position: 'absolute',
			classes: { nonactive: "p-2", active: "p-2" },
			class: 'z-50 h-full',
			children: ($$renderer) => {
				SidebarGroup($$renderer, {
					children: ($$renderer) => {
						{
							function icon($$renderer) {
								ChartOutline($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarItem($$renderer, { label: 'Dashboard', icon, $$slots: { icon: true } });
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								ShoppingBagSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarDropdownWrapper($$renderer, {
								label: 'Shop',
								classes: { btn: "p-2" },
								icon,
								children: ($$renderer) => {
									SidebarItem($$renderer, { label: 'Products', href: '' });
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								UserSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarDropdownWrapper($$renderer, {
								label: 'Profile',
								classes: { btn: "p-2" },
								icon,
								children: ($$renderer) => {
									SidebarItem($$renderer, { label: 'Projects', href: '/' });
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								GridSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarItem($$renderer, {
								label: 'Sidebar',
								spanClass,
								href: '/components/sidebar',
								icon,
								$$slots: { icon: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SidebarGroup($$renderer, {
					border: true,
					children: ($$renderer) => {
						{
							function icon($$renderer) {
								EditSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarDropdownWrapper($$renderer, {
								label: 'Setting',
								classes: { btn: "p-2" },
								icon,
								children: ($$renderer) => {
									SidebarItem($$renderer, { label: 'Account', href: '' });
								},
								$$slots: { icon: true, default: true }
							});
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="h-96 overflow-auto px-4 md:ml-64"><div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">`);
		PlusPlaceholder($$renderer, { colnum: 3, rownum: 1 });
		$$renderer.push(`<!----> `);
		PlusPlaceholder($$renderer, {});
		$$renderer.push(`<!----> `);
		PlusPlaceholder($$renderer, { colnum: 2, rownum: 2 });
		$$renderer.push(`<!----> `);
		PlusPlaceholder($$renderer, {});
		$$renderer.push(`<!----> `);
		PlusPlaceholder($$renderer, { colnum: 2, rownum: 2 });
		$$renderer.push(`<!----></div></div></div>`);
	});
}