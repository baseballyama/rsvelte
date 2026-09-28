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
	ChevronDoubleUpOutline,
	ChevronDoubleDownOutline,
	ShoppingBagSolid
} from "flowbite-svelte-icons";

import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";
import { page } from "$app/state";

export default function MultiLevel2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = page.url.pathname;
		const demoSidebarUi = uiHelpers();
		let isDemoOpen = false;
		const closeDemoSidebar = demoSidebarUi.close;
		const sidebarMatch = "docs/components/sidebar";

		const matchesRoute = $.derived(() => {
			const list = Array.isArray(sidebarMatch) ? sidebarMatch : [sidebarMatch];

			return list.some((p) => activeUrl.startsWith(`/${p}`));
		});

		SidebarButton($$renderer, { onclick: demoSidebarUi.toggle, class: 'mb-2' });
		$$renderer.push(`<!----> <div class="relative">`);

		Sidebar($$renderer, {
			activeUrl,
			backdrop: false,
			isOpen: isDemoOpen,
			closeSidebar: closeDemoSidebar,
			params: { x: -50, duration: 50 },
			position: 'absolute',
			class: 'z-50 h-full',
			classes: { nonactive: "p-2", active: "p-2" },
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

							function arrowup($$renderer) {
								ChevronDoubleUpOutline($$renderer, { class: 'h-6 w-6' });
							}

							function arrowdown($$renderer) {
								ChevronDoubleDownOutline($$renderer, { class: 'h-6 w-6' });
							}

							SidebarDropdownWrapper($$renderer, {
								label: 'E-commerce',
								classes: { btn: "p-2" },
								isOpen: matchesRoute(),
								icon,
								arrowup,
								arrowdown,
								children: ($$renderer) => {
									SidebarItem($$renderer, { label: 'Sidebar', href: '/docs/components/sidebar' });
									$$renderer.push(`<!----> `);
									SidebarItem($$renderer, { label: 'Billing' });
									$$renderer.push(`<!----> `);
									SidebarItem($$renderer, { label: 'Invoice' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { icon: true, arrowup: true, arrowdown: true, default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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