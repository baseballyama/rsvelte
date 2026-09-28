import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Sidebar_floating($$renderer) {
	const data = {
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

	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			class: 'bg-background',
			children: ($$renderer) => {
				if (Sidebar.Root) {
					$$renderer.push('<!--[-->');

					Sidebar.Root($$renderer, {
						variant: 'floating',
						class: 'absolute',
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
																{
																	function child($$renderer, { props }) {
																		$$renderer.push(`<a${$.attributes({ href: '/', ...props })}>`);

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
																											$$renderer.push(`<!---->v1.0.0`);
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

																		$$renderer.push(`</a>`);
																	}

																	if (Sidebar.MenuButton) {
																		$$renderer.push('<!--[-->');
																		Sidebar.MenuButton($$renderer, { size: 'lg', child, $$slots: { child: true } });
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

							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									children: ($$renderer) => {
										if (Sidebar.Group) {
											$$renderer.push('<!--[-->');

											Sidebar.Group($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.Menu) {
														$$renderer.push('<!--[-->');

														Sidebar.Menu($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(data.navMain);

																for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																	let item = each_array[$$index_1];

																	if (DropdownMenu.Root) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Root($$renderer, {
																			children: ($$renderer) => {
																				if (Sidebar.MenuItem) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuItem($$renderer, {
																						children: ($$renderer) => {
																							{
																								function child($$renderer, { props }) {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, $.spread_props([
																											{
																												class: 'data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
																											},
																											props,
																											{
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(item.title)} `);

																													IconPlaceholder($$renderer, {
																														lucide: 'MoreHorizontalIcon',
																														tabler: 'IconDots',
																														hugeicons: 'MoreHorizontalCircle01Icon',
																														phosphor: 'DotsThreeOutlineIcon',
																														remixicon: 'RiMoreLine',
																														class: 'ml-auto'
																													});

																													$$renderer.push(`<!---->`);
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

																							if (item.items?.length) {
																								$$renderer.push('<!--[0-->');

																								if (DropdownMenu.Content) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Content($$renderer, {
																										side: 'right',
																										align: 'start',
																										children: ($$renderer) => {
																											if (DropdownMenu.Group) {
																												$$renderer.push('<!--[-->');

																												DropdownMenu.Group($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!--[-->`);

																														const each_array_1 = $.ensure_array_like(item.items);

																														for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																															let subItem = each_array_1[$$index];

																															{
																																function child($$renderer, { props }) {
																																	$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}>${$.escape(subItem.title)}</a>`);
																																}

																																if (DropdownMenu.Item) {
																																	$$renderer.push('<!--[-->');
																																	DropdownMenu.Item($$renderer, { child, $$slots: { child: true } });
																																	$$renderer.push('<!--]-->');
																																} else {
																																	$$renderer.push('<!--[!-->');
																																	$$renderer.push('<!--]-->');
																																}
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

							$$renderer.push(` `);

							if (Sidebar.Footer) {
								$$renderer.push('<!--[-->');

								Sidebar.Footer($$renderer, {
									children: ($$renderer) => {
										if (Sidebar.Group) {
											$$renderer.push('<!--[-->');

											Sidebar.Group($$renderer, {
												children: ($$renderer) => {
													if (Card.Root) {
														$$renderer.push('<!--[-->');

														Card.Root($$renderer, {
															size: 'sm',
															class: '-mx-2',
															children: ($$renderer) => {
																if (Card.Header) {
																	$$renderer.push('<!--[-->');

																	Card.Header($$renderer, {
																		children: ($$renderer) => {
																			if (Card.Title) {
																				$$renderer.push('<!--[-->');

																				Card.Title($$renderer, {
																					class: 'text-sm',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Subscribe to our newsletter`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Card.Description) {
																				$$renderer.push('<!--[-->');

																				Card.Description($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Opt-in to receive updates and news about the sidebar.`);
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

																if (Card.Content) {
																	$$renderer.push('<!--[-->');

																	Card.Content($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<form>`);

																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					children: ($$renderer) => {
																						if (Sidebar.Input) {
																							$$renderer.push('<!--[-->');
																							Sidebar.Input($$renderer, { type: 'email', placeholder: 'Email' });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						Button($$renderer, {
																							class: 'w-full bg-sidebar-primary text-sidebar-primary-foreground',
																							size: 'sm',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Subscribe`);
																							},
																							$$slots: { default: true }
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

																			$$renderer.push(`</form>`);
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

							$$renderer.push(`</header> <div class="flex flex-1 flex-col gap-4 p-4 pt-0"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`);
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