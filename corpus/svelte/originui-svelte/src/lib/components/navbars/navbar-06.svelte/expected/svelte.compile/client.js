import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="sr-only"> </span>`, 1);
var root_4 = $.from_html(`<p> </p>`);
var root_5 = $.from_html(`<div class="[&amp;>svg]:text-muted-foreground/80 flex items-center gap-2 [&amp;>svg]:shrink-0"><!> <span class="text-foreground hidden truncate sm:inline-flex"><!></span></div>`);
var root_6 = $.from_html(`<span class="flex items-center gap-2"><span class="truncate"> </span></span>`);
var root_7 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2"><!> <div class="flex items-center gap-6"><a href="#" class="text-primary hover:text-primary/90"><!></a> <!></div></div> <div class="flex items-center gap-2"><!> <!> <!></div></div></header>`);

export default function Navbar_06($$anchor, $$props) {
	const // Navigation links with icons for desktop icon-only navigation
	// Language options
	id = $.props_id();

	$.push($$props, true);

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

	let selectedLanguage = $.state($.proxy(languages[0].value));
	var header = root_7();
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

	var node_6 = $.sibling(a, 2);

	NavigationMenuRoot(node_6, {
		class: 'hidden md:flex',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					TooltipProvider($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = $.comment();
							var node_7 = $.first_child(fragment_10);

							$.each(node_7, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
								NavigationMenuItem($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Tooltip($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = root_2();
												var node_8 = $.first_child(fragment_13);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														NavigationMenuLink($$anchor, $.spread_props(
															{
																get href() {
																	return $.get(link).href;
																},
																class: 'flex size-8 items-center justify-center p-1.5'
															},
															props,
															{
																children: ($$anchor, $$slotProps) => {
																	var fragment_15 = root_3();
																	var node_9 = $.first_child(fragment_15);

																	$.component(node_9, () => $.get(link).icon, ($$anchor, link_icon_1) => {
																		link_icon_1($$anchor, { size: 20, 'aria-hidden': 'true' });
																	});

																	var span_1 = $.sibling(node_9, 2);
																	var text_1 = $.only_child(span_1, true);

																	$.template_effect(() => $.set_text(text_1, $.get(link).label));
																	$.append($$anchor, fragment_15);
																},
																$$slots: { default: true }
															}
														));
													};

													TooltipTrigger(node_8, { child, $$slots: { child: true } });
												}

												var node_10 = $.sibling(node_8, 2);

												TooltipContent(node_10, {
													side: 'bottom',
													class: 'px-2 py-1 text-xs',
													children: ($$anchor, $$slotProps) => {
														var p = root_4();
														var text_2 = $.only_child(p, true);

														$.template_effect(() => $.set_text(text_2, $.get(link).label));
														$.append($$anchor, p);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_11 = $.child(div_3);

	ThemeToggle(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	Select(node_12, {
		type: 'single',
		onValueChange: (v) => $.set(selectedLanguage, v, true),
		get items() {
			return languages;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_2();
			var node_13 = $.first_child(fragment_16);

			SelectTrigger(node_13, {
				get id() {
					return `language-${id}`;
				},
				class: 'hover:bg-accent hover:text-accent-foreground h-8 border-none px-2 shadow-none ',
				'aria-label': 'Select language',
				children: ($$anchor, $$slotProps) => {
					var div_4 = root_5();
					var node_14 = $.child(div_4);

					GlobeIcon(node_14, { size: 16, 'aria-hidden': 'true' });

					var span_2 = $.sibling(node_14, 2);
					var node_15 = $.child(span_2);

					{
						var consequent = ($$anchor) => {
							var text_3 = $.text();

							$.template_effect(($0) => $.set_text(text_3, $0), [
								() => languages.find((lang) => lang.value === $.get(selectedLanguage)).label
							]);

							$.append($$anchor, text_3);
						};

						$.if(node_15, ($$render) => {
							if ($.get(selectedLanguage)) $$render(consequent);
						});
					}

					$.reset(span_2);
					$.reset(div_4);
					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_13, 2);

			SelectContent(node_16, {
				class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = $.comment();
					var node_17 = $.first_child(fragment_18);

					$.each(node_17, 16, () => languages, (lang) => lang, ($$anchor, lang) => {
						SelectItem($$anchor, {
							get value() {
								return lang.value;
							},

							children: ($$anchor, $$slotProps) => {
								var span_3 = root_6();
								var span_4 = $.child(span_3);
								var text_4 = $.only_child(span_4, true);

								$.reset(span_3);
								$.template_effect(() => $.set_text(text_4, lang.label));
								$.append($$anchor, span_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_12, 2);

	UserMenu(node_18, {});
	$.reset(div_3);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}