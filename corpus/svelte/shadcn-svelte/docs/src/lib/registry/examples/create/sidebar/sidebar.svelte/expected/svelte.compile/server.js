import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Sidebar_1($$renderer) {
	const data = {
		versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
		navMain: [
			{
				title: "Getting Started",
				url: "#",
				items: [
					{ title: "Installation", url: "#" },
					{ title: "Project Structure", url: "#" }
				]
			},

			{
				title: "Build Your Application",
				url: "#",
				items: [
					{ title: "Routing", url: "#" },
					{ title: "Data Fetching", url: "#", isActive: true },
					{ title: "Rendering", url: "#" },
					{ title: "Caching", url: "#" },
					{ title: "Styling", url: "#" },
					{ title: "Optimizing", url: "#" },
					{ title: "Configuring", url: "#" },
					{ title: "Testing", url: "#" },
					{ title: "Authentication", url: "#" },
					{ title: "Deploying", url: "#" },
					{ title: "Upgrading", url: "#" },
					{ title: "Examples", url: "#" }
				]
			},

			{
				title: "API Reference",
				url: "#",
				items: [
					{ title: "Components", url: "#" },
					{ title: "File Conventions", url: "#" },
					{ title: "Functions", url: "#" },
					{ title: "next.config.js Options", url: "#" },
					{ title: "CLI", url: "#" },
					{ title: "Edge Runtime", url: "#" }
				]
			},

			{
				title: "Architecture",
				url: "#",
				items: [
					{ title: "Accessibility", url: "#" },
					{ title: "Fast Refresh", url: "#" },
					{ title: "Next.js Compiler", url: "#" },
					{ title: "Supported Browsers", url: "#" },
					{ title: "Turbopack", url: "#" }
				]
			}
		]
	};

	let selectedVersion = data.versions[0];

	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.Root) {
					$$renderer.push('<!--[-->');

					Sidebar.Root($$renderer, {
						children: ($$renderer) => {
							if (Sidebar.Header) {
								$$renderer.push('<!--[-->');

								Sidebar.Header($$renderer, {
									children: ($$renderer) => {
										if (Sidebar.Menu) {
											$$renderer.push('<!--[-->');

											Sidebar.Menu($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.MenuItem) {
														$$renderer.push('<!--[-->');

														Sidebar.MenuItem($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.Root) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Root($$renderer, {
																		children: ($$renderer) => {
																			{
																				function child($$renderer, { props }) {
																					if (Sidebar.MenuButton) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuButton($$renderer, $.spread_props([
																							{
																								size: 'lg',
																								class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																							},
																							props,
																							{
																								children: ($$renderer) => {
																									if (Item.Root) {
																										$$renderer.push('<!--[-->');

																										Item.Root($$renderer, {
																											class: 'p-0',
																											size: 'xs',
																											children: ($$renderer) => {
																												if (Item.Content) {
																													$$renderer.push('<!--[-->');

																													Item.Content($$renderer, {
																														children: ($$renderer) => {
																															if (Item.Title) {
																																$$renderer.push('<!--[-->');

																																Item.Title($$renderer, {
																																	class: 'text-sm',
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->Documentation`);
																																	},
																																	$$slots: { default: true }
																																});

																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}

																															$$renderer.push(` `);

																															if (Item.Description) {
																																$$renderer.push('<!--[-->');

																																Item.Description($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->v${$.escape(selectedVersion)}`);
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

																												$$renderer.push(` `);

																												if (Item.Actions) {
																													$$renderer.push('<!--[-->');

																													Item.Actions($$renderer, {
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'ChevronsUpDownIcon',
																																tabler: 'IconSelector',
																																hugeicons: 'UnfoldMoreIcon',
																																phosphor: 'CaretUpDownIcon',
																																remixicon: 'RiArrowUpDownLine'
																															});
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
																							}
																						]));

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				if (DropdownMenu.Trigger) {
																					$$renderer.push('<!--[-->');
																					DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			$$renderer.push(` `);

																			if (DropdownMenu.Content) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Content($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array = $.ensure_array_like(data.versions);

																						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																							let version = each_array[$$index];

																							if (DropdownMenu.Item) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Item($$renderer, {
																									onSelect: () => selectedVersion = version,
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->v${$.escape(version)} `);

																										if (version === selectedVersion) {
																											$$renderer.push('<!--[0-->');

																											IconPlaceholder($$renderer, {
																												lucide: 'CheckIcon',
																												tabler: 'IconCheck',
																												hugeicons: 'Tick02Icon',
																												phosphor: 'CheckIcon',
																												remixicon: 'RiCheckLine',
																												class: 'ml-auto'
																											});
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
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <form>`);

										if (Sidebar.Group) {
											$$renderer.push('<!--[-->');

											Sidebar.Group($$renderer, {
												class: 'py-0',
												children: ($$renderer) => {
													if (Sidebar.GroupContent) {
														$$renderer.push('<!--[-->');

														Sidebar.GroupContent($$renderer, {
															class: 'relative',
															children: ($$renderer) => {
																Label($$renderer, {
																	for: 'search',
																	class: 'sr-only',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Search`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																if (Sidebar.Input) {
																	$$renderer.push('<!--[-->');

																	Sidebar.Input($$renderer, {
																		id: 'search',
																		placeholder: 'Search the docs...',
																		class: 'pl-8'
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																IconPlaceholder($$renderer, {
																	lucide: 'SearchIcon',
																	tabler: 'IconSearch',
																	hugeicons: 'SearchIcon',
																	phosphor: 'MagnifyingGlassIcon',
																	remixicon: 'RiSearchLine',
																	class: 'pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none'
																});

																$$renderer.push(`<!---->`);
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

										$$renderer.push(`</form>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(data.navMain);

										for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
											let item = each_array_1[$$index_2];

											if (Sidebar.Group) {
												$$renderer.push('<!--[-->');

												Sidebar.Group($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.GroupLabel) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupLabel($$renderer, {
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
																	if (Sidebar.Menu) {
																		$$renderer.push('<!--[-->');

																		Sidebar.Menu($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_2 = $.ensure_array_like(item.items);

																				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																					let subItem = each_array_2[$$index_1];

																					if (Sidebar.MenuItem) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuItem($$renderer, {
																							children: ($$renderer) => {
																								{
																									function child($$renderer, { props }) {
																										$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}>${$.escape(subItem.title)}</a>`);
																									}

																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');
																										Sidebar.MenuButton($$renderer, { isActive: subItem.isActive, child, $$slots: { child: true } });
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

							$$renderer.push(` `);

							if (Sidebar.Rail) {
								$$renderer.push('<!--[-->');
								Sidebar.Rail($$renderer, {});
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

				$$renderer.push(` `);

				if (Sidebar.Inset) {
					$$renderer.push('<!--[-->');

					Sidebar.Inset($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<header class="flex h-16 shrink-0 items-center gap-2 px-4">`);

							if (Sidebar.Trigger) {
								$$renderer.push('<!--[-->');
								Sidebar.Trigger($$renderer, { class: '-ml-1' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</header> <div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`);
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