import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import SearchIcon from '@lucide/svelte/icons/search';
import { Logo } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Navbar_04($$renderer) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id($$renderer);

	const navigationLinks = [
		{ href: '#', label: 'Products' },
		{ href: '#', label: 'Categories' },
		{ href: '#', label: 'Deals' }
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
				class: 'w-36 p-1 md:hidden',
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
													class: 'py-1.5',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(link.label)}`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--> `);

									NavigationMenuItem($$renderer, {
										class: 'w-full',
										role: 'presentation',
										'aria-hidden': 'true',
										children: ($$renderer) => {
											$$renderer.push(`<div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px"></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									NavigationMenuItem($$renderer, {
										class: 'w-full',
										children: ($$renderer) => {
											NavigationMenuLink($$renderer, {
												href: '#',
												class: 'py-1.5',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sign In`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									NavigationMenuItem($$renderer, {
										class: 'w-full',
										children: ($$renderer) => {
											Button($$renderer, {
												size: 'sm',
												class: 'mt-0.5 w-full text-left text-sm',
												children: ($$renderer) => {
													$$renderer.push(`<span class="flex items-baseline gap-2">Cart <span class="text-primary-foreground/60 text-xs">2</span></span>`);
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

	$$renderer.push(`<!----> <div class="flex flex-1 items-center gap-6 max-md:justify-between"><a href="#" class="text-primary hover:text-primary/90">`);
	Logo($$renderer, {});
	$$renderer.push(`<!----></a> `);

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
							class: 'h-full',
							children: ($$renderer) => {
								NavigationMenuLink($$renderer, {
									href: link.href,
									class: 'text-muted-foreground hover:text-primary py-1.5 font-medium',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(link.label)}`);
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

	$$renderer.push(`<!----> <div class="relative">`);

	Input($$renderer, {
		id,
		class: 'peer h-8 ps-8 pe-2',
		placeholder: 'Search...',
		type: 'search'
	});

	$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">`);
	SearchIcon($$renderer, { size: 16 });
	$$renderer.push(`<!----></div></div></div></div> <div class="flex items-center gap-2 max-md:hidden">`);

	Button($$renderer, {
		href: '#',
		variant: 'ghost',
		size: 'sm',
		class: 'text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Sign In`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '#',
		size: 'sm',
		class: 'text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<span class="flex items-baseline gap-2">Cart <span class="text-primary-foreground/60 text-xs">2</span></span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}