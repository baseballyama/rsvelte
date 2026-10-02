import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="sr-only"> </span>`, 1);
var root_4 = $.from_html(`<!> <div aria-hidden="true" class="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"></div>`, 1);
var root_5 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2"><!> <div class="flex items-center gap-6"><a href="#" class="text-primary hover:text-primary/90"><!></a> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"><!></div></div></div></div> <!> <div class="flex flex-1 items-center justify-end gap-4"><div class="flex items-center gap-2"><!> <!></div> <!></div></div></header>`);

export default function Navbar_09($$anchor) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id();

	const navigationLinks = [
		{ href: '#', icon: HouseIcon, label: 'Home' },
		{ href: '#', icon: HashIcon, label: 'Hash' },
		{ href: '#', icon: UsersRound, label: 'Groups' }
	];

	var header = root_5();
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
				class: 'w-48 p-1 md:hidden',
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
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root_1();
														var node_4 = $.first_child(fragment_7);

														$.component(node_4, () => $.get(link).icon, ($$anchor, link_icon) => {
															link_icon($$anchor, {
																size: 16,
																class: 'text-muted-foreground',
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

	var div_3 = $.sibling(a, 2);
	var node_6 = $.child(div_3);

	Input(node_6, {
		get id() {
			return id;
		},
		class: 'peer h-8 ps-8 pe-2',
		placeholder: 'Search...',
		type: 'search'
	});

	var div_4 = $.sibling(node_6, 2);
	var node_7 = $.child(div_4);

	SearchIcon(node_7, { size: 16 });
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	NavigationMenuRoot(node_8, {
		class: 'max-md:hidden',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = $.comment();
					var node_9 = $.first_child(fragment_9);

					$.each(node_9, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
						NavigationMenuItem($$anchor, {
							children: ($$anchor, $$slotProps) => {
								NavigationMenuLink($$anchor, {
									get href() {
										return $.get(link).href;
									},
									class: 'flex size-8 items-center justify-center p-1.5',
									get title() {
										return $.get(link).label;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_3();
										var node_10 = $.first_child(fragment_12);

										$.component(node_10, () => $.get(link).icon, ($$anchor, link_icon_1) => {
											link_icon_1($$anchor, { 'aria-hidden': 'true' });
										});

										var span_1 = $.sibling(node_10, 2);
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

	var div_5 = $.sibling(node_8, 2);
	var div_6 = $.child(div_5);
	var node_11 = $.child(div_6);

	Button(node_11, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground relative size-8 rounded-full shadow-none',
		'aria-label': 'Open notifications',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_4();
			var node_12 = $.first_child(fragment_13);

			MailIcon(node_12, { size: 16, 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_11, 2);

	NotificationMenu(node_13, {});
	$.reset(div_6);

	var node_14 = $.sibling(div_6, 2);

	UserMenu(node_14, {});
	$.reset(div_5);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}