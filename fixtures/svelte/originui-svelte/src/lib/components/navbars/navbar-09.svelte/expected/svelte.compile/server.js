import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import HashIcon from '@lucide/svelte/icons/hash';
import HouseIcon from '@lucide/svelte/icons/house';
import MailIcon from '@lucide/svelte/icons/mail';
import SearchIcon from '@lucide/svelte/icons/search';
import UsersRound from '@lucide/svelte/icons/users-round';
import { Logo, NotificationMenu, UserMenu } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Navbar_09($$renderer) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id($$renderer);

	const navigationLinks = [
		{ href: '#', icon: HouseIcon, label: 'Home' },
		{ href: '#', icon: HashIcon, label: 'Hash' },
		{ href: '#', icon: UsersRound, label: 'Groups' }
	];

	$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2">`);

	Popover($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{
							class: 'group size-8 md:hidden',
							variant: 'ghost',
							size: 'icon'
						},
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<svg class="pointer-events-none"${$.attr('width', 16)}${$.attr('height', 16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
							},
							$$slots: { default: true }
						}
					]));
				}

				PopoverTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			PopoverContent($$renderer, {
				align: 'start',
				class: 'w-48 p-1 md:hidden',
				children: ($$renderer) => {
					NavigationMenuRoot($$renderer, {
						class: 'max-w-none *:w-full',
						children: ($$renderer) => {
							NavigationMenuList($$renderer, {
								class: 'flex-col items-start gap-0 md:gap-2',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(navigationLinks);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let link = each_array[$$index];

										NavigationMenuItem($$renderer, {
											class: 'w-full',
											children: ($$renderer) => {
												NavigationMenuLink($$renderer, {
													href: link.href,
													class: 'flex-row items-center gap-2 py-1.5',
													children: ($$renderer) => {
														if (link.icon) {
															$$renderer.push('<!--[-->');

															link.icon($$renderer, {
																size: 16,
																class: 'text-muted-foreground',
																'aria-hidden': 'true'
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <span>${$.escape(link.label)}</span>`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
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

	$$renderer.push(`<!----> <div class="flex items-center gap-6"><a href="#" class="text-primary hover:text-primary/90">`);
	Logo($$renderer, {});
	$$renderer.push(`<!----></a> <div class="relative">`);

	Input($$renderer, {
		id,
		class: 'peer h-8 ps-8 pe-2',
		placeholder: 'Search...',
		type: 'search'
	});

	$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">`);
	SearchIcon($$renderer, { size: 16 });
	$$renderer.push(`<!----></div></div></div></div> `);

	NavigationMenuRoot($$renderer, {
		class: 'max-md:hidden',
		children: ($$renderer) => {
			NavigationMenuList($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(navigationLinks);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let link = each_array_1[$$index_1];

						NavigationMenuItem($$renderer, {
							children: ($$renderer) => {
								NavigationMenuLink($$renderer, {
									href: link.href,
									class: 'flex size-8 items-center justify-center p-1.5',
									title: link.label,
									children: ($$renderer) => {
										if (link.icon) {
											$$renderer.push('<!--[-->');
											link.icon($$renderer, { 'aria-hidden': 'true' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <span class="sr-only">${$.escape(link.label)}</span>`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex flex-1 items-center justify-end gap-4"><div class="flex items-center gap-2">`);

	Button($$renderer, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground relative size-8 rounded-full shadow-none',
		'aria-label': 'Open notifications',
		children: ($$renderer) => {
			MailIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> <div aria-hidden="true" class="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	NotificationMenu($$renderer, {});
	$$renderer.push(`<!----></div> `);
	UserMenu($$renderer, {});
	$$renderer.push(`<!----></div></div></header>`);
}