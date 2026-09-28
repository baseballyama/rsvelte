import * as $ from 'svelte/internal/server';

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

export default function Branding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = page.url.pathname;
		const spanClass = "flex-1 ms-3 whitespace-nowrap";
		const demoSidebarUi = uiHelpers();
		let isDemoOpen = false;
		const closeDemoSidebar = demoSidebarUi.close;

		const site = {
			name: "Flowbite Svelte",
			href: "/",
			img: "/images/flowbite-svelte-icon-logo.svg"
		};

		SidebarButton($$renderer, { onclick: demoSidebarUi.toggle, class: 'mb-2' });
		$$renderer.push(`<!----> <div class="relative">`);

		Sidebar($$renderer, {
			activeUrl,
			backdrop: false,
			isOpen: isDemoOpen,
			closeSidebar: closeDemoSidebar,
			params: { x: -50, duration: 50 },
			class: 'z-50 h-full',
			position: 'absolute',
			classes: { nonactive: "p-2", active: "p-2" },
			children: ($$renderer) => {
				CloseButton($$renderer, {
					onclick: closeDemoSidebar,
					color: 'gray',
					class: 'absolute top-3 right-1 p-2 md:hidden'
				});

				$$renderer.push(`<!----> `);

				SidebarGroup($$renderer, {
					children: ($$renderer) => {
						SidebarBrand($$renderer, { site, classes: { img: "h-6 w-6" } });
						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								ChartOutline($$renderer, {
									class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
								});
							}

							SidebarItem($$renderer, { label: 'Dashboard', href: '/', icon, $$slots: { icon: true } });
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

							SidebarItem($$renderer, {
								label: 'Sidebar',
								href: '/components/sidebar',
								icon,
								$$slots: { icon: true }
							});
						}

						$$renderer.push(`<!---->`);
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