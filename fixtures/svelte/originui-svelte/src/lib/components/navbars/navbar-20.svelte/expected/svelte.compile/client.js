import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span> Online`, 1);
var root_3 = $.from_html(`<!> 99.9%`, 1);
var root_4 = $.from_html(`<!> 45ms`, 1);
var root_5 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 justify-between gap-4"><div class="flex gap-2"><div class="flex items-center md:hidden"><!></div> <div class="flex items-center gap-6"><!></div></div> <div class="flex items-center gap-4"><div class="flex items-center gap-2"><!> <!> <!></div> <div><div class="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium"><!> <span class="pointer-events-none relative ms-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full rtl:peer-data-[state=unchecked]:-translate-x-full"><!></span> <span class="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible rtl:peer-data-[state=checked]:translate-x-full"><!></span></div> <!></div></div></div></header>`);

export default function Navbar_20($$anchor) {
	const // Navigation links array to be used in both desktop and mobile menus
	id = $.props_id();

	const navigationLinks = [
		{ active: true, href: '#', label: 'Overview' },
		{ href: '#', label: 'Graphs' },
		{ href: '#', label: 'Backups' }
	];

	let checked = $.state(false);
	var header = root_5();
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
	var node_4 = $.child(div_3);

	NavigationMenuRoot(node_4, {
		class: 'h-full *:h-full max-md:hidden',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'h-full gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = $.comment();
					var node_5 = $.first_child(fragment_9);

					$.each(node_5, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
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
									class: 'text-muted-foreground hover:border-b-primary hover:text-primary data-active:border-b-primary h-full  justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-active:bg-transparent!',
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
	var div_5 = $.child(div_4);
	var node_6 = $.child(div_5);

	Badge(node_6, {
		variant: 'outline',
		class: 'gap-1.5 text-emerald-600',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_2();

			$.next();
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Badge(node_7, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_3();
			var node_8 = $.first_child(fragment_14);

			ZapIcon(node_8, { class: '-ms-0.5 opacity-60', size: 12, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_7, 2);

	Badge(node_9, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_4();
			var node_10 = $.first_child(fragment_15);

			ClockIcon(node_10, { class: '-ms-0.5 opacity-60', size: 12, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var node_11 = $.child(div_7);

	Switch(node_11, {
		get id() {
			return id;
		},

		get checked() {
			return $.get(checked);
		},
		onCheckedChange: (value) => $.set(checked, value, true),
		class: 'peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&_span]:translate-x-full rtl:data-[state=checked]:[&_span]:-translate-x-full'
	});

	var span = $.sibling(node_11, 2);
	var node_12 = $.child(span);

	PowerOffIcon(node_12, { size: 12, 'aria-hidden': 'true' });
	$.reset(span);

	var span_1 = $.sibling(span, 2);
	var node_13 = $.child(span_1);

	PowerIcon(node_13, { size: 12, 'aria-hidden': 'true' });
	$.reset(span_1);
	$.reset(div_7);

	var node_14 = $.sibling(div_7, 2);

	Label(node_14, {
		get for() {
			return id;
		},
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Power');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_4);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}