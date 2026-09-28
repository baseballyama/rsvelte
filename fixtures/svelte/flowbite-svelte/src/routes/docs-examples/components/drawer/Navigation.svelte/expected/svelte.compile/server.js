import * as $ from 'svelte/internal/server';

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

export default function Navigation($$renderer) {
	let open2 = false;
	let spanClass = "flex-1 ms-3 whitespace-nowrap";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="text-center">`);

		Button($$renderer, {
			onclick: () => open2 = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show navigation`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CardPlaceholder($$renderer, { size: '2xl', class: 'mt-6' });
		$$renderer.push(`<!----></div> `);

		Drawer($$renderer, {
			class: 'w-64 bg-gray-50 p-0 dark:bg-gray-800',
			get open() {
				return open2;
			},

			set open($$value) {
				open2 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<h5 class="px-6 py-4 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">Menu</h5> `);

				Sidebar($$renderer, {
					disableBreakpoints: true,
					class: 'top-16',
					children: ($$renderer) => {
						SidebarWrapper($$renderer, {
							class: 'overflow-y-auto rounded-sm px-3 py-0 dark:bg-gray-800',
							children: ($$renderer) => {
								SidebarGroup($$renderer, {
									children: ($$renderer) => {
										{
											function icon($$renderer) {
												ChartPieSolid($$renderer, {
													class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
												});
											}

											SidebarItem($$renderer, { label: 'Dashboard', icon, $$slots: { icon: true } });
										}

										$$renderer.push(`<!----> `);

										{
											function icon($$renderer) {
												CartSolid($$renderer, {
													class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
												});
											}

											SidebarDropdownWrapper($$renderer, {
												label: 'E-commerce',
												icon,
												children: ($$renderer) => {
													SidebarItem($$renderer, { label: 'Products' });
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
												$$renderer.push(`<span class="text-primary-600 bg-primary-200 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium">3</span>`);
											}

											SidebarItem($$renderer, {
												label: 'Inbox',
												spanClass,
												icon,
												subtext,
												$$slots: { icon: true, subtext: true }
											});
										}

										$$renderer.push(`<!----> `);

										{
											function icon($$renderer) {
												UsersSolid($$renderer, {
													class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
												});
											}

											SidebarItem($$renderer, { label: 'Users', icon, $$slots: { icon: true } });
										}

										$$renderer.push(`<!----> `);

										{
											function icon($$renderer) {
												ShoppingBagSolid($$renderer, {
													class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
												});
											}

											SidebarItem($$renderer, { label: 'Products', icon, $$slots: { icon: true } });
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
												EditOutline($$renderer, {
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
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}