import * as $ from 'svelte/internal/server';

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	SidebarButton,
	SidebarCta,
	uiHelpers
} from "flowbite-svelte";

import {
	ChartOutline,
	GridSolid,
	MailBoxSolid,
	UserSolid,
	CloseOutline
} from "flowbite-svelte-icons";

import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";
import { page } from "$app/state";

export default function Cta($$renderer, $$props) {
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
			class: 'z-50 h-full',
			position: 'absolute',
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
								href: '/docs/components/sidebar',
								icon,
								$$slots: { icon: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function icon($$renderer) {
								$$renderer.push(`<button type="button" class="bg-primary-50 text-primary-900 hover:bg-primary-200 focus:ring-primary-400 dark:bg-primary-900 dark:text-primary-400 dark:hover:bg-primary-800 -mx-1.5 -my-1.5 ms-auto inline-flex h-6 w-6 rounded-lg p-1 focus:ring-2" data-collapse-toggle="dropdown-cta" aria-label="Close"><span class="sr-only">Close</span> `);
								CloseOutline($$renderer, { class: 'h-4 w-4' });
								$$renderer.push(`<!----></button>`);
							}

							SidebarCta($$renderer, {
								label: 'Beta',
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-primary-900 dark:text-primary-400 mb-3 text-sm">Preview the new Flowbite dashboard navigation! You can turn the new navigation off for a limited time in your profile.</p> <a class="text-primary-900 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm underline" href="/">Turn new navigation off</a>`);
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="h-[450px] overflow-auto px-4 md:ml-64"><div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">`);
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