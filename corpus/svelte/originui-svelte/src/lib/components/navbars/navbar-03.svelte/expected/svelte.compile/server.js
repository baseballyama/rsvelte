import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Logo } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Navbar_03($$renderer) {
	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ active: true, href: '#', label: 'Home' },
		{ href: '#', label: 'Features' },
		{ href: '#', label: 'Pricing' },
		{ href: '#', label: 'About' }
	];

	$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 justify-between gap-4"><div class="flex gap-2"><div class="flex items-center md:hidden">`);

	Popover($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ class: 'group size-8', variant: 'ghost', size: 'icon' },
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
													active: link.active,
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex items-center gap-6"><a href="#" class="text-primary hover:text-primary/90">`);
	Logo($$renderer, {});
	$$renderer.push(`<!----></a> `);

	NavigationMenuRoot($$renderer, {
		class: 'h-full *:h-full max-md:hidden',
		children: ($$renderer) => {
			NavigationMenuList($$renderer, {
				class: 'h-full gap-2',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(navigationLinks);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let link = each_array_1[$$index_1];

						NavigationMenuItem($$renderer, {
							class: 'h-full',
							children: ($$renderer) => {
								NavigationMenuLink($$renderer, {
									active: link.active,
									href: link.href,
									class: 'text-muted-foreground hover:border-b-primary hover:text-primary data-active:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-active:bg-transparent!',
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

	$$renderer.push(`<!----></div></div> <div class="flex items-center gap-2">`);

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
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}