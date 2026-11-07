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
	MailBoxSolid,
	UserSolid,
	ArrowRightToBracketOutline,
	EditSolid,
	ShoppingBagSolid
} from "flowbite-svelte-icons";

import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";
import { fade } from "svelte/transition";
import { sineIn } from "svelte/easing";
import { page } from "$app/state";

export default function Transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = page.url.pathname;
		let params = { duration: 700, easing: sineIn };
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
								label: 'E-commerce',
								classes: { btn: "p-2" },
								transition: fade,
								params,
								icon,
								children: ($$renderer) => {
									SidebarItem($$renderer, { label: 'Sidebar', href: '/components/sidebar' });
									$$renderer.push(`<!----> `);
									SidebarItem($$renderer, { label: 'Billing' });
									$$renderer.push(`<!----> `);
									SidebarItem($$renderer, { label: 'Invoice' });
									$$renderer.push(`<!---->`);
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

							function subtext($$renderer) {
								$$renderer.push(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">Pro</span>`);
							}

							SidebarItem($$renderer, {
								label: 'Kanban',
								spanClass,
								href: '/',
								icon,
								subtext,
								$$slots: { icon: true, subtext: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								MailBoxSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							function subtext($$renderer) {
								$$renderer.push(`<span class="bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium">3</span>`);
							}

							SidebarItem($$renderer, {
								label: 'Inbox',
								spanClass,
								href: '/',
								icon,
								subtext,
								$$slots: { icon: true, subtext: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								UserSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarItem($$renderer, { label: 'Users', icon, $$slots: { icon: true } });
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								ArrowRightToBracketOutline($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarItem($$renderer, { label: 'Sign In', icon, $$slots: { icon: true } });
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								EditSolid($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarItem($$renderer, { label: 'Sign Up', icon, $$slots: { icon: true } });
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