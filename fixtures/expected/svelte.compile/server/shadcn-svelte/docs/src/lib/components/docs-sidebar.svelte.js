import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { PAGES_NEW } from "$lib/navigation.js";

export default function Docs_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { navItems, $$slots, $$events, ...restProps } = $$props;
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
		const renderedNavItems = $.derived(() => navItems.filter((item) => !EXCLUDED_SECTIONS.has(item.title) && item.items.length > 0));

		function normalizePath(path) {
			if (path === "/") return path;

			return path.endsWith("/") ? path.slice(0, -1) : path;
		}

		if (Sidebar.Root) {
			$$renderer.push('<!--[-->');

			Sidebar.Root($$renderer, $.spread_props([
				{
					class: 'sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex',
					collapsible: 'none'
				},
				restProps,
				{
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-9"></div> <div class="absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs"></div> `);

						if (Sidebar.Content) {
							$$renderer.push('<!--[-->');

							Sidebar.Content($$renderer, {
								class: 'no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2.5',
								children: ($$renderer) => {
									if (Sidebar.Group) {
										$$renderer.push('<!--[-->');

										Sidebar.Group($$renderer, {
											class: 'pt-6',
											children: ($$renderer) => {
												if (Sidebar.GroupLabel) {
													$$renderer.push('<!--[-->');

													Sidebar.GroupLabel($$renderer, {
														class: 'font-medium text-muted-foreground',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Sections`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Sidebar.GroupContent) {
													$$renderer.push('<!--[-->');

													Sidebar.GroupContent($$renderer, {
														children: ($$renderer) => {
															if (Sidebar.Menu) {
																$$renderer.push('<!--[-->');

																Sidebar.Menu($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(TOP_LEVEL_SECTIONS);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let item = each_array[$$index];

																			if (Sidebar.MenuItem) {
																				$$renderer.push('<!--[-->');

																				Sidebar.MenuItem($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								$$renderer.push(`<a${$.attributes({ href: item.href, ...props })}><span class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"></span> ${$.escape(item.title)} `);

																								if (item.href && PAGES_NEW.includes(item.href)) {
																									$$renderer.push(`<!--[0--><span class="flex size-2 rounded-full bg-blue-500" title="New"></span>`);
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--></a>`);
																							}

																							if (Sidebar.MenuButton) {
																								$$renderer.push('<!--[-->');

																								Sidebar.MenuButton($$renderer, {
																									isActive: item.href === "/docs"
																										? pathname() === item.href
																										: pathname().startsWith(item.href),
																									class: 'relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48',
																									child,
																									$$slots: { child: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						}
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(`<!--]-->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <!--[-->`);

									const each_array_1 = $.ensure_array_like(renderedNavItems());

									for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
										let item = each_array_1[$$index_2];

										if (Sidebar.Group) {
											$$renderer.push('<!--[-->');

											Sidebar.Group($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.GroupLabel) {
														$$renderer.push('<!--[-->');

														Sidebar.GroupLabel($$renderer, {
															class: 'font-medium text-muted-foreground',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(item.title)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Sidebar.GroupContent) {
														$$renderer.push('<!--[-->');

														Sidebar.GroupContent($$renderer, {
															children: ($$renderer) => {
																if (item.items.length) {
																	$$renderer.push('<!--[0-->');

																	if (Sidebar.Menu) {
																		$$renderer.push('<!--[-->');

																		Sidebar.Menu($$renderer, {
																			class: 'gap-0.5',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_2 = $.ensure_array_like(item.items);

																				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																					let subItem = each_array_2[$$index_1];

																					if (subItem.items.length === 0 && subItem.href && !EXCLUDED_PAGES.has(subItem.href)) {
																						$$renderer.push('<!--[0-->');

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								class: 'w-full',
																								children: ($$renderer) => {
																									{
																										function child($$renderer, { props }) {
																											$$renderer.push(`<a${$.attributes({ href: subItem.href, ...props })}><span class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"></span> ${$.escape(subItem.title)} `);

																											if (subItem.href && PAGES_NEW.includes(subItem.href)) {
																												$$renderer.push(`<!--[0--><span class="flex size-2 rounded-full bg-blue-500" title="New"></span>`);
																											} else {
																												$$renderer.push('<!--[-1-->');
																											}

																											$$renderer.push(`<!--]--></a>`);
																										}

																										if (Sidebar.MenuButton) {
																											$$renderer.push('<!--[-->');

																											Sidebar.MenuButton($$renderer, {
																												isActive: normalizePath(subItem.href) === normalizePath(pathname()),
																												class: 'relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48',
																												child,
																												$$slots: { child: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					} else {
																						$$renderer.push('<!--[-1-->');
																					}

																					$$renderer.push(`<!--]-->`);
																				}

																				$$renderer.push(`<!--]-->`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> <div class="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs"></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}