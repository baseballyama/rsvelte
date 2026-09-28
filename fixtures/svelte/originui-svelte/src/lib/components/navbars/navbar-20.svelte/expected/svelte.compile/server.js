import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import ClockIcon from '@lucide/svelte/icons/clock';
import PowerIcon from '@lucide/svelte/icons/power';
import PowerOffIcon from '@lucide/svelte/icons/power-off';
import ZapIcon from '@lucide/svelte/icons/zap';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Navbar_20($$renderer) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id($$renderer);

	const navigationLinks = [
		{ active: true, href: '#', label: 'Overview' },
		{ href: '#', label: 'Graphs' },
		{ href: '#', label: 'Backups' }
	];

	let checked = false;

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

	$$renderer.push(`<!----></div> <div class="flex items-center gap-6">`);

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
									class: 'text-muted-foreground hover:border-b-primary hover:text-primary data-active:border-b-primary h-full  justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-active:bg-transparent!',
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

	$$renderer.push(`<!----></div></div> <div class="flex items-center gap-4"><div class="flex items-center gap-2">`);

	Badge($$renderer, {
		variant: 'outline',
		class: 'gap-1.5 text-emerald-600',
		children: ($$renderer) => {
			$$renderer.push(`<span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span> Online`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$renderer) => {
			ZapIcon($$renderer, { class: '-ms-0.5 opacity-60', size: 12, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> 99.9%`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$renderer) => {
			ClockIcon($$renderer, { class: '-ms-0.5 opacity-60', size: 12, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> 45ms`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><div class="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">`);

	Switch($$renderer, {
		id,
		checked,
		onCheckedChange: (value) => checked = value,
		class: 'peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&_span]:translate-x-full rtl:data-[state=checked]:[&_span]:-translate-x-full'
	});

	$$renderer.push(`<!----> <span class="pointer-events-none relative ms-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full rtl:peer-data-[state=unchecked]:-translate-x-full">`);
	PowerOffIcon($$renderer, { size: 12, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></span> <span class="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible rtl:peer-data-[state=checked]:translate-x-full">`);
	PowerIcon($$renderer, { size: 12, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></span></div> `);

	Label($$renderer, {
		for: id,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Power`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></header>`);
}