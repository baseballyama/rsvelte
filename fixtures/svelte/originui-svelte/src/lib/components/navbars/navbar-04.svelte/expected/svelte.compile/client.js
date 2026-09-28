import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px"></div>`);
var root_2 = $.from_html(`<span class="flex items-baseline gap-2">Cart <span class="text-primary-foreground/60 text-xs">2</span></span>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2"><!> <div class="flex flex-1 items-center gap-6 max-md:justify-between"><a href="#" class="text-primary hover:text-primary/90"><!></a> <!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"><!></div></div></div></div> <div class="flex items-center gap-2 max-md:hidden"><!> <!></div></div></header>`);

export default function Navbar_04($$anchor) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id();

	const navigationLinks = [
		{ href: '#', label: 'Products' },
		{ href: '#', label: 'Categories' },
		{ href: '#', label: 'Deals' }
	];

	var header = root_5();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							class: 'group size-8 md:hidden',
							variant: 'ghost',
							size: 'icon'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								var svg = root();

								$.set_attribute(svg, 'width', 16);
								$.set_attribute(svg, 'height', 16);
								$.append($$anchor, svg);
							},
							$$slots: { default: true }
						}
					));
				};

				PopoverTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			PopoverContent(node_2, {
				align: 'start',
				class: 'w-36 p-1 md:hidden',
				children: ($$anchor, $$slotProps) => {
					NavigationMenuRoot($$anchor, {
						class: 'max-w-none *:w-full',
						children: ($$anchor, $$slotProps) => {
							NavigationMenuList($$anchor, {
								class: 'flex-col items-start gap-0 md:gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_3 = $.first_child(fragment_4);

									$.each(node_3, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
										NavigationMenuItem($$anchor, {
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												NavigationMenuLink($$anchor, {
													get href() {
														return $.get(link).href;
													},
													class: 'py-1.5',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(link).label));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									NavigationMenuItem(node_4, {
										class: 'w-full',
										role: 'presentation',
										'aria-hidden': 'true',
										children: ($$anchor, $$slotProps) => {
											var div_2 = root_1();

											$.append($$anchor, div_2);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_4, 2);

									NavigationMenuItem(node_5, {
										class: 'w-full',
										children: ($$anchor, $$slotProps) => {
											NavigationMenuLink($$anchor, {
												href: '#',
												class: 'py-1.5',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Sign In');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									NavigationMenuItem(node_6, {
										class: 'w-full',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												size: 'sm',
												class: 'mt-0.5 w-full text-left text-sm',
												children: ($$anchor, $$slotProps) => {
													var span = root_2();

													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node, 2);
	var a = $.child(div_3);
	var node_7 = $.child(a);

	Logo(node_7, {});
	$.reset(a);

	var node_8 = $.sibling(a, 2);

	NavigationMenuRoot(node_8, {
		class: 'max-md:hidden',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = $.comment();
					var node_9 = $.first_child(fragment_11);

					$.each(node_9, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
						NavigationMenuItem($$anchor, {
							class: 'h-full',
							children: ($$anchor, $$slotProps) => {
								NavigationMenuLink($$anchor, {
									get href() {
										return $.get(link).href;
									},
									class: 'text-muted-foreground hover:text-primary py-1.5 font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(link).label));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_4 = $.sibling(node_8, 2);
	var node_10 = $.child(div_4);

	Input(node_10, {
		get id() {
			return id;
		},
		class: 'peer h-8 ps-8 pe-2',
		placeholder: 'Search...',
		type: 'search'
	});

	var div_5 = $.sibling(node_10, 2);
	var node_11 = $.child(div_5);

	SearchIcon(node_11, { size: 16 });
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var node_12 = $.child(div_6);

	Button(node_12, {
		href: '#',
		variant: 'ghost',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Sign In');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Button(node_13, {
		href: '#',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			var span_1 = root_2();

			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}