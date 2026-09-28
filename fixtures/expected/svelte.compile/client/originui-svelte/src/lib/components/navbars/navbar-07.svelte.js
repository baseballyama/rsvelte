import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { Logo, NotificationMenu, UserMenu } from '$lib/components/_extras/navbars';

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

import { Select, SelectContent, SelectItem } from '$lib/components/ui/select';
import { Select as SelectPrimitive } from 'bits-ui';

var root = $.from_html(`<!> <span class="sr-only">Toggle menu</span>`, 1);
var root_1 = $.from_html(`<a>Personal Account</a>`);
var root_2 = $.from_html(`<a>Projects</a>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<span><!></span> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2"><!></div> <div class="flex items-center gap-4"><!> <!></div></div></header>`);

export default function Navbar_07($$anchor, $$props) {
	$.push($$props, true);

	const projects = [
		{ label: 'Main project', value: '1' },
		{ label: 'Origin-Svelte project', value: '2' }
	];

	let selectedProject = $.state($.proxy(projects[0].value));
	var header = root_6();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Breadcrumb(node, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_5();
					var node_1 = $.first_child(fragment_1);

					BreadcrumbItem(node_1, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								class: 'text-foreground',
								children: ($$anchor, $$slotProps) => {
									Logo($$anchor, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					BreadcrumbSeparator(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('/');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					BreadcrumbItem(node_3, {
						class: 'md:hidden',
						children: ($$anchor, $$slotProps) => {
							DropdownMenu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_3();
									var node_4 = $.first_child(fragment_5);

									DropdownMenuTrigger(node_4, {
										class: 'hover:text-foreground',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_5 = $.first_child(fragment_6);

											BreadcrumbEllipsis(node_5, {});
											$.next(2);
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_4, 2);

									DropdownMenuContent(node_6, {
										align: 'start',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_3();
											var node_7 = $.first_child(fragment_7);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a = root_1();

													$.attribute_effect(a, () => ({ href: '#', ...props() }));
													$.append($$anchor, a);
												};

												DropdownMenuItem(node_7, { child, $$slots: { child: true } });
											}

											var node_8 = $.sibling(node_7, 2);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a_1 = root_2();

													$.attribute_effect(a_1, () => ({ href: '#', ...props() }));
													$.append($$anchor, a_1);
												};

												DropdownMenuItem(node_8, { child, $$slots: { child: true } });
											}

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_3, 2);

					BreadcrumbItem(node_9, {
						class: 'max-md:hidden',
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Personal Account');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					BreadcrumbSeparator(node_10, {
						class: 'max-md:hidden',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('/');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					BreadcrumbItem(node_11, {
						class: 'max-md:hidden',
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Projects');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					BreadcrumbSeparator(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('/');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					BreadcrumbItem(node_13, {
						children: ($$anchor, $$slotProps) => {
							Select($$anchor, {
								type: 'single',
								onValueChange: (value) => $.set(selectedProject, value, true),
								get items() {
									return projects;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_3();
									var node_14 = $.first_child(fragment_11);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props(
												{
													variant: 'ghost',
													class: 'text-foreground focus-visible:bg-accent h-8 px-1.5 focus-visible:ring-0'
												},
												props,
												{
													children: ($$anchor, $$slotProps) => {
														var fragment_13 = root_4();
														var span = $.first_child(fragment_13);
														var node_15 = $.child(span);

														{
															var consequent = ($$anchor) => {
																var text_5 = $.text();

																$.template_effect(($0) => $.set_text(text_5, $0), [
																	() => projects.find((p) => p.value === $.get(selectedProject))?.label || 'Select project'
																]);

																$.append($$anchor, text_5);
															};

															$.if(node_15, ($$render) => {
																if ($.get(selectedProject)) $$render(consequent);
															});
														}

														$.reset(span);

														var node_16 = $.sibling(span, 2);

														ChevronUpDownIcon(node_16, { size: 14, class: 'text-muted-foreground/80' });
														$.append($$anchor, fragment_13);
													},
													$$slots: { default: true }
												}
											));
										};

										$.component(node_14, () => SelectPrimitive.Trigger, ($$anchor, SelectPrimitive_Trigger) => {
											SelectPrimitive_Trigger($$anchor, {
												'aria-label': 'Select project',
												child,
												$$slots: { child: true }
											});
										});
									}

									var node_17 = $.sibling(node_14, 2);

									SelectContent(node_17, {
										class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_15 = $.comment();
											var node_18 = $.first_child(fragment_15);

											$.each(node_18, 17, () => projects, ({ label, value }) => value, ($$anchor, $$item) => {
												let label = () => $.get($$item).label;
												let value = () => $.get($$item).value;

												SelectItem($$anchor, {
													get value() {
														return value();
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text();

														$.template_effect(() => $.set_text(text_6, label()));
														$.append($$anchor, text_6);
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

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_19 = $.child(div_2);

	NotificationMenu(node_19, {});

	var node_20 = $.sibling(node_19, 2);

	UserMenu(node_20, {});
	$.reset(div_2);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}