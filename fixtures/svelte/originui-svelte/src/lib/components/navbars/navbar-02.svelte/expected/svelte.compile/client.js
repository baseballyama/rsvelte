import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<div class="text-muted-foreground px-2 py-1.5 text-xs font-medium"> </div> <ul></ul>`, 1);
var root_3 = $.from_html(`<div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px w-full"></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex items-center gap-2"><!> <span> </span></div>`);
var root_6 = $.from_html(`<div class="space-y-1"><div class="font-medium"> </div> <p class="text-muted-foreground line-clamp-2 text-xs"> </p></div>`);
var root_7 = $.from_html(`<span> </span>`);
var root_8 = $.from_html(`<ul></ul>`);
var root_9 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2"><!> <div class="flex items-center gap-6"><a href="#" class="text-primary hover:text-primary/90"><!></a> <!></div></div> <div class="flex items-center gap-2"><!> <!></div></div></header>`);

export default function Navbar_02($$anchor, $$props) {
	$.push($$props, true);

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

	var header = root_9();
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
				class: 'z-10 w-64 p-1 md:hidden',
				children: ($$anchor, $$slotProps) => {
					NavigationMenuRoot($$anchor, {
						class: 'max-w-none *:w-full',
						children: ($$anchor, $$slotProps) => {
							NavigationMenuList($$anchor, {
								class: 'flex-col items-start gap-0 md:gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.each(node_3, 19, () => navigationLinks, (link) => link.label, ($$anchor, link, index) => {
										NavigationMenuItem($$anchor, {
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_4();
												var node_4 = $.first_child(fragment_6);

												{
													var consequent = ($$anchor) => {
														var fragment_7 = root_2();
														var div_2 = $.first_child(fragment_7);
														var text = $.only_child(div_2, true);
														var ul = $.sibling(div_2, 2);

														$.each(ul, 21, () => $.get(link).items, (item) => item.label, ($$anchor, item) => {
															var li = root_1();
															var node_5 = $.child(li);

															NavigationMenuLink(node_5, {
																get href() {
																	return $.get(item).href;
																},
																class: 'py-1.5',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(item).label));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});

															$.reset(li);
															$.append($$anchor, li);
														});

														$.reset(ul);
														$.template_effect(() => $.set_text(text, $.get(link).label));
														$.append($$anchor, fragment_7);
													};

													var alternate = ($$anchor) => {
														NavigationMenuLink($$anchor, {
															get href() {
																return $.get(link).href;
															},
															class: 'py-1.5',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text();

																$.template_effect(() => $.set_text(text_2, $.get(link).label));
																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													};

													$.if(node_4, ($$render) => {
														if ($.get(link).submenu) $$render(consequent); else $$render(alternate, -1);
													});
												}

												var node_6 = $.sibling(node_4, 2);

												{
													var consequent_2 = ($$anchor) => {
														var fragment_11 = $.comment();
														var node_7 = $.first_child(fragment_11);

														{
															var consequent_1 = ($$anchor) => {
																var div_3 = root_3();

																$.append($$anchor, div_3);
															};

															$.if(node_7, ($$render) => {
																if (!$.get(link).submenu && navigationLinks[$.get(index) + 1].submenu || $.get(link).submenu && !navigationLinks[$.get(index) + 1].submenu || $.get(link).submenu && navigationLinks[$.get(index) + 1].submenu && $.get(link).type !== navigationLinks[$.get(index) + 1].type) $$render(consequent_1);
															});
														}

														$.append($$anchor, fragment_11);
													};

													$.if(node_6, ($$render) => {
														if ($.get(index) < navigationLinks.length - 1) $$render(consequent_2);
													});
												}

												$.append($$anchor, fragment_6);
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

	var div_4 = $.sibling(node, 2);
	var a = $.child(div_4);
	var node_8 = $.child(a);

	Logo(node_8, {});
	$.reset(a);

	var node_9 = $.sibling(a, 2);

	NavigationMenuRoot(node_9, {
		class: 'max-md:hidden',
		viewport: false,
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = $.comment();
					var node_10 = $.first_child(fragment_13);

					$.each(node_10, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
						NavigationMenuItem($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_15 = $.comment();
								var node_11 = $.first_child(fragment_15);

								{
									var consequent_6 = ($$anchor) => {
										var fragment_16 = root_4();
										var node_12 = $.first_child(fragment_16);

										NavigationMenuTrigger(node_12, {
											class: 'text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium [&_svg]:-me-0.5 [&_svg]:size-3.5',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text();

												$.template_effect(() => $.set_text(text_3, $.get(link).label));
												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										var node_13 = $.sibling(node_12, 2);

										NavigationMenuContent(node_13, {
											class: 'data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1',
											children: ($$anchor, $$slotProps) => {
												var ul_1 = root_8();

												$.each(ul_1, 21, () => $.get(link).items, (item) => item.label, ($$anchor, item) => {
													var li_1 = root_1();
													var node_14 = $.child(li_1);

													NavigationMenuLink(node_14, {
														get href() {
															return $.get(item).href;
														},
														class: 'py-1.5',
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root_4();
															var node_15 = $.first_child(fragment_18);

															{
																var consequent_3 = ($$anchor) => {
																	var div_5 = root_5();
																	var node_16 = $.child(div_5);

																	$.component(node_16, () => $.get(item).icon, ($$anchor, item_icon) => {
																		item_icon($$anchor, {
																			size: 16,
																			class: 'text-foreground opacity-60',
																			'aria-hidden': 'true'
																		});
																	});

																	var span = $.sibling(node_16, 2);
																	var text_4 = $.only_child(span, true);

																	$.reset(div_5);
																	$.template_effect(() => $.set_text(text_4, $.get(item).label));
																	$.append($$anchor, div_5);
																};

																$.if(node_15, ($$render) => {
																	if ($.get(link).type === 'icon' && 'icon' in $.get(item)) $$render(consequent_3);
																});
															}

															var node_17 = $.sibling(node_15, 2);

															{
																var consequent_4 = ($$anchor) => {
																	var div_6 = root_6();
																	var div_7 = $.child(div_6);
																	var text_5 = $.only_child(div_7, true);
																	var p = $.sibling(div_7, 2);
																	var text_6 = $.only_child(p, true);

																	$.reset(div_6);

																	$.template_effect(() => {
																		$.set_text(text_5, $.get(item).label);
																		$.set_text(text_6, $.get(item).description);
																	});

																	$.append($$anchor, div_6);
																};

																var consequent_5 = ($$anchor) => {
																	var span_1 = root_7();
																	var text_7 = $.only_child(span_1, true);

																	$.template_effect(() => $.set_text(text_7, $.get(item).label));
																	$.append($$anchor, span_1);
																};

																$.if(node_17, ($$render) => {
																	if ($.get(link).type === 'description' && 'description' in $.get(item)) $$render(consequent_4); else if (!$.get(link).type || $.get(link).type !== 'icon' && $.get(link).type !== 'description') $$render(consequent_5, 1);
																});
															}

															$.append($$anchor, fragment_18);
														},
														$$slots: { default: true }
													});

													$.reset(li_1);
													$.append($$anchor, li_1);
												});

												$.reset(ul_1);

												$.template_effect(($0) => $.set_class(ul_1, 1, $0), [
													() => $.clsx(cn($.get(link).type === 'description' ? 'min-w-64' : 'min-w-48'))
												]);

												$.append($$anchor, ul_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_16);
									};

									var alternate_1 = ($$anchor) => {
										NavigationMenuLink($$anchor, {
											get href() {
												return $.get(link).href;
											},
											class: 'text-muted-foreground hover:text-primary py-1.5 font-medium',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text();

												$.template_effect(() => $.set_text(text_8, $.get(link).label));
												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_11, ($$render) => {
										if ($.get(link).submenu) $$render(consequent_6); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_15);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_1);

	var div_8 = $.sibling(div_1, 2);
	var node_18 = $.child(div_8);

	Button(node_18, {
		href: '#',
		variant: 'ghost',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Sign In');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Button(node_19, {
		href: '#',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Get Started');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}