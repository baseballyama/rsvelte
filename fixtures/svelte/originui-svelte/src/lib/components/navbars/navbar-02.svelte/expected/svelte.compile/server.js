import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import InfoIcon from '@lucide/svelte/icons/info';
import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
import { Logo } from '$lib/components/_extras/navbars';

import {
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot,
	NavigationMenuTrigger
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { cn } from '$lib/utils';

export default function Navbar_02($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Navigation links array to be used in both desktop and mobile menus
		const navigationLinks = [
			{ href: '#', label: 'Home' },
			{
				items: [
					{
						description: 'Browse all components in the library.',
						href: '#',
						label: 'Components'
					},

					{
						description: 'Learn how to use the library.',
						href: '#',
						label: 'Documentation'
					},

					{
						description: 'Pre-built layouts for common use cases.',
						href: '#',
						label: 'Templates'
					}
				],
				label: 'Features',
				submenu: true,
				type: 'description'
			},

			{
				items: [
					{ href: '#', label: 'Product A' },
					{ href: '#', label: 'Product B' },
					{ href: '#', label: 'Product C' },
					{ href: '#', label: 'Product D' }
				],
				label: 'Pricing',
				submenu: true,
				type: 'simple'
			},

			{
				items: [
					{ href: '#', icon: BookOpenIcon, label: 'Getting Started' },
					{ href: '#', icon: LifeBuoyIcon, label: 'Tutorials' },
					{ href: '#', icon: InfoIcon, label: 'About Us' }
				],
				label: 'About',
				submenu: true,
				type: 'icon'
			}
		];

		$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2">`);

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
					class: 'z-10 w-64 p-1 md:hidden',
					children: ($$renderer) => {
						NavigationMenuRoot($$renderer, {
							class: 'max-w-none *:w-full',
							children: ($$renderer) => {
								NavigationMenuList($$renderer, {
									class: 'flex-col items-start gap-0 md:gap-2',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(navigationLinks);

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let link = each_array[index];

											NavigationMenuItem($$renderer, {
												class: 'w-full',
												children: ($$renderer) => {
													if (link.submenu) {
														$$renderer.push(`<!--[0--><div class="text-muted-foreground px-2 py-1.5 text-xs font-medium">${$.escape(link.label)}</div> <ul><!--[-->`);

														const each_array_1 = $.ensure_array_like(link.items);

														for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
															let item = each_array_1[$$index];

															$$renderer.push(`<li>`);

															NavigationMenuLink($$renderer, {
																href: item.href,
																class: 'py-1.5',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(item.label)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----></li>`);
														}

														$$renderer.push(`<!--]--></ul>`);
													} else {
														$$renderer.push('<!--[-1-->');

														NavigationMenuLink($$renderer, {
															href: link.href,
															class: 'py-1.5',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(link.label)}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!--]--> `);

													if (index < navigationLinks.length - 1) {
														$$renderer.push('<!--[0-->');

														if (!link.submenu && navigationLinks[index + 1].submenu || link.submenu && !navigationLinks[index + 1].submenu || link.submenu && navigationLinks[index + 1].submenu && link.type !== navigationLinks[index + 1].type) {
															$$renderer.push(`<!--[0--><div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px w-full"></div>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
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
		$$renderer.push(`<!----></a> `);

		NavigationMenuRoot($$renderer, {
			class: 'max-md:hidden',
			viewport: false,
			children: ($$renderer) => {
				NavigationMenuList($$renderer, {
					class: 'gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_2 = $.ensure_array_like(navigationLinks);

						for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
							let link = each_array_2[$$index_3];

							NavigationMenuItem($$renderer, {
								children: ($$renderer) => {
									if (link.submenu) {
										$$renderer.push('<!--[0-->');

										NavigationMenuTrigger($$renderer, {
											class: 'text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium [&_svg]:-me-0.5 [&_svg]:size-3.5',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(link.label)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										NavigationMenuContent($$renderer, {
											class: 'data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1',
											children: ($$renderer) => {
												$$renderer.push(`<ul${$.attr_class($.clsx(cn(link.type === 'description' ? 'min-w-64' : 'min-w-48')))}><!--[-->`);

												const each_array_3 = $.ensure_array_like(link.items);

												for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
													let item = each_array_3[$$index_2];

													$$renderer.push(`<li>`);

													NavigationMenuLink($$renderer, {
														href: item.href,
														class: 'py-1.5',
														children: ($$renderer) => {
															if (link.type === 'icon' && 'icon' in item) {
																$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

																if (item.icon) {
																	$$renderer.push('<!--[-->');

																	item.icon($$renderer, {
																		size: 16,
																		class: 'text-foreground opacity-60',
																		'aria-hidden': 'true'
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <span>${$.escape(item.label)}</span></div>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															if (link.type === 'description' && 'description' in item) {
																$$renderer.push(`<!--[0--><div class="space-y-1"><div class="font-medium">${$.escape(item.label)}</div> <p class="text-muted-foreground line-clamp-2 text-xs">${$.escape(item.description)}</p></div>`);
															} else if (!link.type || link.type !== 'icon' && link.type !== 'description') {
																$$renderer.push(`<!--[1--><span>${$.escape(item.label)}</span>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></li>`);
												}

												$$renderer.push(`<!--]--></ul>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									} else {
										$$renderer.push('<!--[-1-->');

										NavigationMenuLink($$renderer, {
											href: link.href,
											class: 'text-muted-foreground hover:text-primary py-1.5 font-medium',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(link.label)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
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
	});
}