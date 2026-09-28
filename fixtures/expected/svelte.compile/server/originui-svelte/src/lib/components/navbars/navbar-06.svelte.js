import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import GlobeIcon from '@lucide/svelte/icons/globe';
import HomeIcon from '@lucide/svelte/icons/home';
import LayersIcon from '@lucide/svelte/icons/layers';
import UsersIcon from '@lucide/svelte/icons/users';
import { Logo, ThemeToggle, UserMenu } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Navbar_06($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // Navigation links with icons for desktop icon-only navigation
		// Language options
		id = $.props_id($$renderer);

		const navigationLinks = [
			{ active: true, href: '#', icon: HomeIcon, label: 'Dashboard' },
			{ href: '#', icon: LayersIcon, label: 'Projects' },
			{ href: '#', icon: FileTextIcon, label: 'Documentation' },
			{ href: '#', icon: UsersIcon, label: 'Team' }
		];

		const languages = [
			{ label: 'De', value: 'de' },
			{ label: 'En', value: 'en' },
			{ label: 'Es', value: 'es' },
			{ label: 'Fr', value: 'fr' },
			{ label: 'Ja', value: 'ja' }
		];

		let selectedLanguage = languages[0].value;

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
														class: 'flex-row items-center gap-2 py-1.5',
														active: link.active,
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
		$$renderer.push(`<!----></a> `);

		NavigationMenuRoot($$renderer, {
			class: 'hidden md:flex',
			children: ($$renderer) => {
				NavigationMenuList($$renderer, {
					class: 'gap-2',
					children: ($$renderer) => {
						TooltipProvider($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(navigationLinks);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let link = each_array_1[$$index_1];

									NavigationMenuItem($$renderer, {
										children: ($$renderer) => {
											Tooltip($$renderer, {
												children: ($$renderer) => {
													{
														function child($$renderer, { props }) {
															NavigationMenuLink($$renderer, $.spread_props([
																{
																	href: link.href,
																	class: 'flex size-8 items-center justify-center p-1.5'
																},
																props,
																{
																	children: ($$renderer) => {
																		if (link.icon) {
																			$$renderer.push('<!--[-->');
																			link.icon($$renderer, { size: 20, 'aria-hidden': 'true' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` <span class="sr-only">${$.escape(link.label)}</span>`);
																	},
																	$$slots: { default: true }
																}
															]));
														}

														TooltipTrigger($$renderer, { child, $$slots: { child: true } });
													}

													$$renderer.push(`<!----> `);

													TooltipContent($$renderer, {
														side: 'bottom',
														class: 'px-2 py-1 text-xs',
														children: ($$renderer) => {
															$$renderer.push(`<p>${$.escape(link.label)}</p>`);
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

		$$renderer.push(`<!----></div></div> <div class="flex items-center gap-2">`);
		ThemeToggle($$renderer, {});
		$$renderer.push(`<!----> `);

		Select($$renderer, {
			type: 'single',
			onValueChange: (v) => selectedLanguage = v,
			items: languages,
			children: ($$renderer) => {
				SelectTrigger($$renderer, {
					id: `language-${id}`,
					class: 'hover:bg-accent hover:text-accent-foreground h-8 border-none px-2 shadow-none ',
					'aria-label': 'Select language',
					children: ($$renderer) => {
						$$renderer.push(`<div class="[&amp;>svg]:text-muted-foreground/80 flex items-center gap-2 [&amp;>svg]:shrink-0">`);
						GlobeIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
						$$renderer.push(`<!----> <span class="text-foreground hidden truncate sm:inline-flex">`);

						if (selectedLanguage) {
							$$renderer.push(`<!--[0-->${$.escape(languages.find((lang) => lang.value === selectedLanguage).label)}`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SelectContent($$renderer, {
					class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_2 = $.ensure_array_like(languages);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let lang = each_array_2[$$index_2];

							SelectItem($$renderer, {
								value: lang.value,
								children: ($$renderer) => {
									$$renderer.push(`<span class="flex items-center gap-2"><span class="truncate">${$.escape(lang.label)}</span></span>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		UserMenu($$renderer, {});
		$$renderer.push(`<!----></div></div></header>`);
	});
}