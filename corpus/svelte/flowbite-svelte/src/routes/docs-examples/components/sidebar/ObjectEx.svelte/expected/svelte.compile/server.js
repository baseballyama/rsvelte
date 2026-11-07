import * as $ from 'svelte/internal/server';
import { Sidebar, SidebarGroup, SidebarItem, SidebarButton, uiHelpers } from "flowbite-svelte";
import { page } from "$app/state";
import { ChartOutline, GridSolid, MailBoxSolid, UserSolid } from "flowbite-svelte-icons";
import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";

export default function ObjectEx($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = page.url.pathname;
		const spanClass = "flex-1 ms-3 whitespace-nowrap";

		const sidebarEx1 = [
			{ label: "Dashboard", href: "/", icon: ChartOutline },
			{
				label: "Kanban",
				href: "/",
				icon: GridSolid,
				subContent: "Pro"
			},

			{
				label: "Inbox",
				href: "/",
				icon: MailBoxSolid,
				subContent: "3"
			},

			{
				label: "Sidebar",
				href: "/components/sidebar",
				icon: UserSolid
			}
		];

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
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(sidebarEx1);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { label, href, icon: Icon, subContent } = each_array[$$index];

							{
								function icon($$renderer) {
									if (Icon) {
										$$renderer.push('<!--[-->');

										Icon($$renderer, {
											class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								function subtext($$renderer) {
									$$renderer.push(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">${$.escape(subContent)}</span>`);
								}

								SidebarItem($$renderer, {
									label,
									href,
									spanClass,
									icon,
									subtext,
									$$slots: { icon: true, subtext: true }
								});
							}
						}

						$$renderer.push(`<!--]-->`);
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