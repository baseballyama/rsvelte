import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { PAGES_NEW } from "$lib/navigation.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'navItems']);
var root = $.from_html(`<span class="flex size-2 rounded-full bg-blue-500" title="New"></span>`);
var root_1 = $.from_html(`<a><span class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"></span> <!></a>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <div class="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs"></div>`, 1);
var root_4 = $.from_html(`<div class="h-9"></div> <div class="absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs"></div> <!>`, 1);

export default function Docs_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const pathname = $.derived(() => page.url.pathname.toString());

	const TOP_LEVEL_SECTIONS = [
		{ title: "Introduction", href: "/docs", items: [] },
		{ title: "Components", href: "/docs/components", items: [] },
		{ title: "Installation", href: "/docs/installation", items: [] },
		{ title: "Theming", href: "/docs/theming", items: [] },
		{ title: "CLI", href: "/docs/cli", items: [] },
		{ title: "Skills", href: "/docs/skills", items: [] },
		{ title: "Registry", href: "/docs/registry", items: [] },
		{ title: "Forms", href: "/docs/forms", items: [] },
		{ title: "Changelog", href: "/docs/changelog", items: [] }
	];

	const EXCLUDED_SECTIONS = new Set([
		"Sections",
		"Installation",
		"Dark Mode",
		"Changelog",
		"Forms",
		"Migration"
	]);

	const EXCLUDED_PAGES = new Set(["/docs", "/docs/changelog"]);
	const renderedNavItems = $.derived(() => $$props.navItems.filter((item) => !EXCLUDED_SECTIONS.has(item.title) && item.items.length > 0));

	function normalizePath(path) {
		if (path === "/") return path;

		return path.endsWith("/") ? path.slice(0, -1) : path;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(
			{
				class: 'sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex',
				collapsible: 'none'
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_4();
					var node_1 = $.sibling($.first_child(fragment_1), 4);

					$.component(node_1, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
						Sidebar_Content($$anchor, {
							class: 'no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2.5',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_3();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
									Sidebar_Group($$anchor, {
										class: 'pt-6',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_2();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
												Sidebar_GroupLabel($$anchor, {
													class: 'font-medium text-muted-foreground',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Sections');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
												Sidebar_GroupContent($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
															Sidebar_Menu($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_5 = $.comment();
																	var node_6 = $.first_child(fragment_5);

																	$.each(node_6, 17, () => TOP_LEVEL_SECTIONS, (item) => item.href, ($$anchor, item) => {
																		var fragment_6 = $.comment();
																		var node_7 = $.first_child(fragment_6);

																		$.component(node_7, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																			Sidebar_MenuItem($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = $.comment();
																					var node_8 = $.first_child(fragment_7);

																					{
																						const child = ($$anchor, $$arg0) => {
																							let props = () => ($$arg0?.()).props;
																							var a = root_1();

																							$.attribute_effect(a, () => ({ href: $.get(item).href, ...props() }));

																							var text_1 = $.sibling($.child(a));
																							var node_9 = $.sibling(text_1);

																							{
																								var consequent = ($$anchor) => {
																									var span = root();

																									$.append($$anchor, span);
																								};

																								var d = $.derived(() => $.get(item).href && PAGES_NEW.includes($.get(item).href));

																								$.if(node_9, ($$render) => {
																									if ($.get(d)) $$render(consequent);
																								});
																							}

																							$.reset(a);
																							$.template_effect(() => $.set_text(text_1, ` ${$.get(item).title ?? ''} `));
																							$.append($$anchor, a);
																						};

																						let $0 = $.derived(() => $.get(item).href === "/docs"
																							? $.get(pathname) === $.get(item).href
																							: $.get(pathname).startsWith($.get(item).href));

																						$.component(node_8, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																							Sidebar_MenuButton($$anchor, {
																								get isActive() {
																									return $.get($0);
																								},
																								class: 'relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48',
																								child,
																								$$slots: { child: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_6);
																	});

																	$.append($$anchor, fragment_5);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_2, 2);

								$.each(node_10, 17, () => $.get(renderedNavItems), (item) => item.title, ($$anchor, item) => {
									var fragment_8 = $.comment();
									var node_11 = $.first_child(fragment_8);

									$.component(node_11, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
										Sidebar_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_2();
												var node_12 = $.first_child(fragment_9);

												$.component(node_12, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_1) => {
													Sidebar_GroupLabel_1($$anchor, {
														class: 'font-medium text-muted-foreground',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, $.get(item).title));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_1) => {
													Sidebar_GroupContent_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_14 = $.first_child(fragment_11);

															{
																var consequent_3 = ($$anchor) => {
																	var fragment_12 = $.comment();
																	var node_15 = $.first_child(fragment_12);

																	$.component(node_15, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
																		Sidebar_Menu_1($$anchor, {
																			class: 'gap-0.5',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_13 = $.comment();
																				var node_16 = $.first_child(fragment_13);

																				$.each(node_16, 17, () => $.get(item).items, (subItem) => subItem.href, ($$anchor, subItem) => {
																					var fragment_14 = $.comment();
																					var node_17 = $.first_child(fragment_14);

																					{
																						var consequent_2 = ($$anchor) => {
																							var fragment_15 = $.comment();
																							var node_18 = $.first_child(fragment_15);

																							$.component(node_18, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																								Sidebar_MenuItem_1($$anchor, {
																									class: 'w-full',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_16 = $.comment();
																										var node_19 = $.first_child(fragment_16);

																										{
																											const child = ($$anchor, $$arg0) => {
																												let props = () => ($$arg0?.()).props;
																												var a_1 = root_1();

																												$.attribute_effect(a_1, () => ({ href: $.get(subItem).href, ...props() }));

																												var text_3 = $.sibling($.child(a_1));
																												var node_20 = $.sibling(text_3);

																												{
																													var consequent_1 = ($$anchor) => {
																														var span_1 = root();

																														$.append($$anchor, span_1);
																													};

																													var d_1 = $.derived(() => $.get(subItem).href && PAGES_NEW.includes($.get(subItem).href));

																													$.if(node_20, ($$render) => {
																														if ($.get(d_1)) $$render(consequent_1);
																													});
																												}

																												$.reset(a_1);
																												$.template_effect(() => $.set_text(text_3, ` ${$.get(subItem).title ?? ''} `));
																												$.append($$anchor, a_1);
																											};

																											let $0 = $.derived(() => normalizePath($.get(subItem).href) === normalizePath($.get(pathname)));

																											$.component(node_19, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																												Sidebar_MenuButton_1($$anchor, {
																													get isActive() {
																														return $.get($0);
																													},
																													class: 'relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48',
																													child,
																													$$slots: { child: true }
																												});
																											});
																										}

																										$.append($$anchor, fragment_16);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_15);
																						};

																						var d_2 = $.derived(() => $.get(subItem).items.length === 0 && $.get(subItem).href && !EXCLUDED_PAGES.has($.get(subItem).href));

																						$.if(node_17, ($$render) => {
																							if ($.get(d_2)) $$render(consequent_2);
																						});
																					}

																					$.append($$anchor, fragment_14);
																				});

																				$.append($$anchor, fragment_13);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_12);
																};

																$.if(node_14, ($$render) => {
																	if ($.get(item).items.length) $$render(consequent_3);
																});
															}

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								});

								$.next(2);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}