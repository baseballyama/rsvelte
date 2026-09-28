import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Logo } from '$lib/components/_extras/navbars';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 justify-between gap-4"><div class="flex gap-2"><div class="flex items-center md:hidden"><!></div> <div class="flex items-center gap-6"><a href="#" class="text-primary hover:text-primary/90"><!></a> <!></div></div> <div class="flex items-center gap-2"><!> <!></div></div></header>`);

export default function Navbar_03($$anchor) {
	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ active: true, href: '#', label: 'Home' },
		{ href: '#', label: 'Features' },
		{ href: '#', label: 'Pricing' },
		{ href: '#', label: 'About' }
	];

	var header = root_2();
	var div = $.child(header);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ class: 'group size-8', variant: 'ghost', size: 'icon' }, props, {
						children: ($$anchor, $$slotProps) => {
							var svg = root();

							$.set_attribute(svg, 'width', 16);
							$.set_attribute(svg, 'height', 16);
							$.append($$anchor, svg);
						},
						$$slots: { default: true }
					}));
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
													class: 'py-1.5',
													get active() {
														return $.get(link).active;
													},

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

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var a = $.child(div_3);
	var node_4 = $.child(a);

	Logo(node_4, {});
	$.reset(a);

	var node_5 = $.sibling(a, 2);

	NavigationMenuRoot(node_5, {
		class: 'h-full *:h-full max-md:hidden',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'h-full gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = $.comment();
					var node_6 = $.first_child(fragment_9);

					$.each(node_6, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
						NavigationMenuItem($$anchor, {
							class: 'h-full',
							children: ($$anchor, $$slotProps) => {
								NavigationMenuLink($$anchor, {
									get active() {
										return $.get(link).active;
									},

									get href() {
										return $.get(link).href;
									},
									class: 'text-muted-foreground hover:border-b-primary hover:text-primary data-active:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-active:bg-transparent!',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(link).label));
										$.append($$anchor, text_1);
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

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_7 = $.child(div_4);

	Button(node_7, {
		href: '#',
		variant: 'ghost',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Sign In');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Button(node_8, {
		href: '#',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Get Started');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}