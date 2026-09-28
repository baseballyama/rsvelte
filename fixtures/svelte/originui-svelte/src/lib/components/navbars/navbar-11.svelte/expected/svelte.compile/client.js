import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import HouseIcon from '@lucide/svelte/icons/house';
import InboxIcon from '@lucide/svelte/icons/inbox';
import SearchIcon from '@lucide/svelte/icons/search';
import ZapIcon from '@lucide/svelte/icons/zap';
import { Logo } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2"><!> <div class="flex items-center"><a href="#" class="text-primary hover:text-primary/90"><!></a></div></div> <!> <div class="flex flex-1 items-center justify-end gap-2"><div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"><!></div></div></div></div></header>`);

export default function Navbar_11($$anchor) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id();

	const navigationLinks = [
		{ active: true, href: '#', icon: HouseIcon, label: 'Home' },
		{ href: '#', icon: InboxIcon, label: 'Inbox' },
		{ href: '#', icon: ZapIcon, label: 'Insights' }
	];

	var header = root_3();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
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
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.each(node_3, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
										NavigationMenuItem($$anchor, {
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												NavigationMenuLink($$anchor, {
													get href() {
														return $.get(link).href;
													},
													class: 'flex-row items-center gap-2 py-1.5',
													get active() {
														return $.get(link).active;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root_1();
														var node_4 = $.first_child(fragment_7);

														$.component(node_4, () => $.get(link).icon, ($$anchor, link_icon) => {
															link_icon($$anchor, {
																size: 16,
																class: 'text-muted-foreground/80',
																'aria-hidden': 'true'
															});
														});

														var span = $.sibling(node_4, 2);
														var text = $.only_child(span, true);

														$.template_effect(() => $.set_text(text, $.get(link).label));
														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
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

	var div_2 = $.sibling(node, 2);
	var a = $.child(div_2);
	var node_5 = $.child(a);

	Logo(node_5, {});
	$.reset(a);
	$.reset(div_2);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	NavigationMenuRoot(node_6, {
		class: 'max-md:hidden',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = $.comment();
					var node_7 = $.first_child(fragment_9);

					$.each(node_7, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
						NavigationMenuItem($$anchor, {
							children: ($$anchor, $$slotProps) => {
								NavigationMenuLink($$anchor, {
									get active() {
										return $.get(link).active;
									},

									get href() {
										return $.get(link).href;
									},
									class: 'text-foreground hover:text-primary flex-row items-center gap-2 py-1.5 font-medium',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_1();
										var node_8 = $.first_child(fragment_12);

										$.component(node_8, () => $.get(link).icon, ($$anchor, link_icon_1) => {
											link_icon_1($$anchor, {
												size: 16,
												class: 'text-muted-foreground/80',
												'aria-hidden': 'true'
											});
										});

										var span_1 = $.sibling(node_8, 2);
										var text_1 = $.only_child(span_1, true);

										$.template_effect(() => $.set_text(text_1, $.get(link).label));
										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node_6, 2);
	var div_4 = $.child(div_3);
	var node_9 = $.child(div_4);

	Input(node_9, {
		get id() {
			return id;
		},
		class: 'peer h-8 ps-8 pe-2',
		placeholder: 'Search...',
		type: 'search'
	});

	var div_5 = $.sibling(node_9, 2);
	var node_10 = $.child(div_5);

	SearchIcon(node_10, { size: 16 });
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}