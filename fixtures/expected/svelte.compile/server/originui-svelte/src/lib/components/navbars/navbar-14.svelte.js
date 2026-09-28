import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import CompassIcon from '@lucide/svelte/icons/compass';
import FeatherIcon from '@lucide/svelte/icons/feather';
import HouseIcon from '@lucide/svelte/icons/house';
import PlusIcon from '@lucide/svelte/icons/plus';
import SearchIcon from '@lucide/svelte/icons/search';
import { NotificationMenu, TeamSwitcher, UserMenu } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Navbar_14($$renderer) {
	const teams = ['Acme Inc.', 'Origin UI - Svelte', 'Junon'];

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ href: '#', icon: HouseIcon, label: 'Dashboard' },
		{ href: '#', icon: CompassIcon, label: 'Explore' },
		{ href: '#', icon: FeatherIcon, label: 'Write' },
		{ href: '#', icon: SearchIcon, label: 'Search' }
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

	$$renderer.push(`<!----> `);
	TeamSwitcher($$renderer, { teams, defaultTeam: teams[0] });
	$$renderer.push(`<!----></div> `);

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

	$$renderer.push(`<!----> <div class="flex flex-1 items-center justify-end gap-4">`);

	Button($$renderer, {
		size: 'sm',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$renderer) => {
			PlusIcon($$renderer, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> <span class="max-sm:sr-only">Post</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	NotificationMenu($$renderer, {});
	$$renderer.push(`<!----> `);
	UserMenu($$renderer, {});
	$$renderer.push(`<!----></div></div></header>`);
}