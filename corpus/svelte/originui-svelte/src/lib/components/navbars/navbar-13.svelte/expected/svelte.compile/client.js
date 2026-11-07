import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { SettingsMenu, UserMenu } from '$lib/components/_extras/navbars';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { Select, SelectContent, SelectItem } from '$lib/components/ui/select';
import { Select as SelectPrimitive } from 'bits-ui';

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span><!></span> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-4"><div class="flex items-center gap-2"><!> <!></div> <!></div></div></header>`);

export default function Navbar_13($$anchor, $$props) {
	$.push($$props, true);

	const navigationLinks = [
		{ href: '#', label: 'Dashboard' },
		{ href: '#', label: 'Docs' },
		{ href: '#', label: 'API reference' }
	];

	const accountTypes = [
		{ label: 'Personal', value: 'personal' },
		{ label: 'Team', value: 'team' },
		{ label: 'Business', value: 'business' }
	];

	let selectedAccountType = $.state($.proxy(accountTypes[0].value));

	const projects = [
		{ label: 'Main project', value: '1' },
		{ label: 'Origin-Svelte project', value: '2' }
	];

	let selectedProject = $.state($.proxy(projects[0].value));
	var header = root_4();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
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

	var node_4 = $.sibling(node, 2);

	Breadcrumb(node_4, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_3();
					var node_5 = $.first_child(fragment_9);

					BreadcrumbItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							Select($$anchor, {
								type: 'single',
								onValueChange: (value) => {
									$.set(selectedAccountType, value, true);
								},

								get items() {
									return accountTypes;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_1();
									var node_6 = $.first_child(fragment_11);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props(
												{
													variant: 'ghost',
													class: 'text-foreground focus-visible:bg-accent h-8 p-1.5 focus-visible:ring-0'
												},
												props,
												{
													children: ($$anchor, $$slotProps) => {
														var fragment_13 = root_2();
														var span = $.first_child(fragment_13);
														var node_7 = $.child(span);

														{
															var consequent = ($$anchor) => {
																var text_1 = $.text();

																$.template_effect(($0) => $.set_text(text_1, $0), [
																	() => accountTypes.find((a) => a.value === $.get(selectedAccountType))?.label || 'Select account type'
																]);

																$.append($$anchor, text_1);
															};

															$.if(node_7, ($$render) => {
																if ($.get(selectedAccountType)) $$render(consequent);
															});
														}

														$.reset(span);

														var node_8 = $.sibling(span, 2);

														ChevronUpDownIcon(node_8, { size: 14, class: 'text-muted-foreground/80' });
														$.append($$anchor, fragment_13);
													},
													$$slots: { default: true }
												}
											));
										};

										$.component(node_6, () => SelectPrimitive.Trigger, ($$anchor, SelectPrimitive_Trigger) => {
											SelectPrimitive_Trigger($$anchor, {
												'aria-label': 'Select account type',
												child,
												$$slots: { child: true }
											});
										});
									}

									var node_9 = $.sibling(node_6, 2);

									SelectContent(node_9, {
										class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_15 = $.comment();
											var node_10 = $.first_child(fragment_15);

											$.each(node_10, 17, () => accountTypes, (accountType) => accountType.value, ($$anchor, accountType) => {
												SelectItem($$anchor, {
													get value() {
														return $.get(accountType).value;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(accountType).label));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_5, 2);

					BreadcrumbSeparator(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('/');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					BreadcrumbItem(node_12, {
						children: ($$anchor, $$slotProps) => {
							Select($$anchor, {
								type: 'single',
								onValueChange: (value) => {
									$.set(selectedProject, value, true);
								},

								get items() {
									return projects;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_1();
									var node_13 = $.first_child(fragment_19);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props(
												{
													variant: 'ghost',
													class: 'text-foreground focus-visible:bg-accent h-8 p-1.5 focus-visible:ring-0'
												},
												props,
												{
													children: ($$anchor, $$slotProps) => {
														var fragment_21 = root_2();
														var span_1 = $.first_child(fragment_21);
														var node_14 = $.child(span_1);

														{
															var consequent_1 = ($$anchor) => {
																var text_4 = $.text();

																$.template_effect(($0) => $.set_text(text_4, $0), [
																	() => projects.find((p) => p.value === $.get(selectedProject))?.label || 'Select project'
																]);

																$.append($$anchor, text_4);
															};

															$.if(node_14, ($$render) => {
																if ($.get(selectedProject)) $$render(consequent_1);
															});
														}

														$.reset(span_1);

														var node_15 = $.sibling(span_1, 2);

														ChevronUpDownIcon(node_15, { size: 14, class: 'text-muted-foreground/80' });
														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												}
											));
										};

										$.component(node_13, () => SelectPrimitive.Trigger, ($$anchor, SelectPrimitive_Trigger_1) => {
											SelectPrimitive_Trigger_1($$anchor, {
												'aria-label': 'Select project',
												child,
												$$slots: { child: true }
											});
										});
									}

									var node_16 = $.sibling(node_13, 2);

									SelectContent(node_16, {
										class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_23 = $.comment();
											var node_17 = $.first_child(fragment_23);

											$.each(node_17, 17, () => projects, (project) => project.value, ($$anchor, project) => {
												SelectItem($$anchor, {
													get value() {
														return $.get(project).value;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text();

														$.template_effect(() => $.set_text(text_5, $.get(project).label));
														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_23);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node_18 = $.child(div_3);

	NavigationMenuRoot(node_18, {
		class: 'max-md:hidden',
		children: ($$anchor, $$slotProps) => {
			NavigationMenuList($$anchor, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_27 = $.comment();
					var node_19 = $.first_child(fragment_27);

					$.each(node_19, 17, () => navigationLinks, (link) => link.label, ($$anchor, link) => {
						NavigationMenuItem($$anchor, {
							children: ($$anchor, $$slotProps) => {
								NavigationMenuLink($$anchor, {
									get href() {
										return $.get(link).href;
									},
									class: 'text-muted-foreground hover:text-primary py-1.5 font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text();

										$.template_effect(() => $.set_text(text_6, $.get(link).label));
										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_27);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_18, 2);

	SettingsMenu(node_20, {});
	$.reset(div_3);

	var node_21 = $.sibling(div_3, 2);

	UserMenu(node_21, {});
	$.reset(div_2);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}