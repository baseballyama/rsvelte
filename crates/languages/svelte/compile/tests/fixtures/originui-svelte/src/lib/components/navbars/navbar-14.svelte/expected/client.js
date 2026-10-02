import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="sr-only"> </span>`, 1);
var root_4 = $.from_html(`<!> <span class="max-sm:sr-only">Post</span>`, 1);
var root_5 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2"><!> <!></div> <!> <div class="flex flex-1 items-center justify-end gap-4"><!> <!> <!></div></div></header>`);

export default function Navbar_14($$anchor) {
	const teams = ['Acme Inc.', 'Origin UI - Svelte', 'Junon'];

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ href: '#', icon: HouseIcon, label: 'Dashboard' },
		{ href: '#', icon: CompassIcon, label: 'Explore' },
		{ href: '#', icon: FeatherIcon, label: 'Write' },
		{ href: '#', icon: SearchIcon, label: 'Search' }
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

	var node_5 = $.sibling(node, 2);

	TeamSwitcher(node_5, {
		get teams() {
			return teams;
		},

		get defaultTeam() {
			return teams[0];
		}
	});

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
									get href() {
										return $.get(link).href;
									},
									class: 'flex size-8 items-center justify-center p-1.5',
									get title() {
										return $.get(link).label;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_3();
										var node_8 = $.first_child(fragment_12);

										$.component(node_8, () => $.get(link).icon, ($$anchor, link_icon_1) => {
											link_icon_1($$anchor, { 'aria-hidden': 'true' });
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

	var div_2 = $.sibling(node_6, 2);
	var node_9 = $.child(div_2);

	Button(node_9, {
		size: 'sm',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_4();
			var node_10 = $.first_child(fragment_13);

			PlusIcon(node_10, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next(2);
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_9, 2);

	NotificationMenu(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	UserMenu(node_12, {});
	$.reset(div_2);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}