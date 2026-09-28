import * as $ from 'svelte/internal/server';
import { MediaQuery } from "svelte/reactivity";
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Breadcrumb_responsive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ href: "#", label: "Home" },
			{ href: "#", label: "Documentation" },
			{ href: "#", label: "Build Your Application" },
			{ href: "#", label: "Data Fetching" },
			{ label: "Caching and Revalidating" }
		];

		const ITEMS_TO_DISPLAY = 3;
		let open = false;
		const isDesktop = new MediaQuery("(min-width: 768px)");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Breadcrumb.Root) {
				$$renderer.push('<!--[-->');

				Breadcrumb.Root($$renderer, {
					children: ($$renderer) => {
						if (Breadcrumb.List) {
							$$renderer.push('<!--[-->');

							Breadcrumb.List($$renderer, {
								children: ($$renderer) => {
									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Link) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Link($$renderer, {
														href: items[0].href,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(items[0].label)}`);
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

									if (Breadcrumb.Separator) {
										$$renderer.push('<!--[-->');
										Breadcrumb.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (items.length > ITEMS_TO_DISPLAY) {
										$$renderer.push('<!--[0-->');

										if (Breadcrumb.Item) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Item($$renderer, {
												children: ($$renderer) => {
													if (isDesktop.current) {
														$$renderer.push('<!--[0-->');

														if (DropdownMenu.Root) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Root($$renderer, {
																get open() {
																	return open;
																},

																set open($$value) {
																	open = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	if (DropdownMenu.Trigger) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Trigger($$renderer, {
																			class: 'flex items-center gap-1',
																			'aria-label': 'Toggle menu',
																			children: ($$renderer) => {
																				if (Breadcrumb.Ellipsis) {
																					$$renderer.push('<!--[-->');
																					Breadcrumb.Ellipsis($$renderer, { class: 'size-4' });
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

																	if (DropdownMenu.Content) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Content($$renderer, {
																			align: 'start',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array = $.ensure_array_like(items.slice(1, -2));

																				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																					let item = each_array[i];

																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<a${$.attr('href', item.href ? item.href : "#")}>${$.escape(item.label)}</a>`);
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
													} else {
														$$renderer.push('<!--[-1-->');

														if (Drawer.Root) {
															$$renderer.push('<!--[-->');

															Drawer.Root($$renderer, {
																get open() {
																	return open;
																},

																set open($$value) {
																	open = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	if (Drawer.Trigger) {
																		$$renderer.push('<!--[-->');

																		Drawer.Trigger($$renderer, {
																			'aria-label': 'Toggle Menu',
																			children: ($$renderer) => {
																				if (Breadcrumb.Ellipsis) {
																					$$renderer.push('<!--[-->');
																					Breadcrumb.Ellipsis($$renderer, { class: 'size-4' });
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

																	if (Drawer.Content) {
																		$$renderer.push('<!--[-->');

																		Drawer.Content($$renderer, {
																			children: ($$renderer) => {
																				if (Drawer.Header) {
																					$$renderer.push('<!--[-->');

																					Drawer.Header($$renderer, {
																						class: 'text-start',
																						children: ($$renderer) => {
																							if (Drawer.Title) {
																								$$renderer.push('<!--[-->');

																								Drawer.Title($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Navigate to`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Drawer.Description) {
																								$$renderer.push('<!--[-->');

																								Drawer.Description($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Select a page to navigate to.`);
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

																				$$renderer.push(` <div class="grid gap-1 px-4"><!--[-->`);

																				const each_array_1 = $.ensure_array_like(items.slice(1, -2));

																				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																					let item = each_array_1[i];

																					$$renderer.push(`<a${$.attr('href', item.href ? item.href : "#")} class="py-1 text-sm">${$.escape(item.label)}</a>`);
																				}

																				$$renderer.push(`<!--]--></div> `);

																				if (Drawer.Footer) {
																					$$renderer.push('<!--[-->');

																					Drawer.Footer($$renderer, {
																						class: 'pt-4',
																						children: ($$renderer) => {
																							if (Drawer.Close) {
																								$$renderer.push('<!--[-->');

																								Drawer.Close($$renderer, {
																									class: buttonVariants({ variant: "outline" }),
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Close`);
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

										if (Breadcrumb.Separator) {
											$$renderer.push('<!--[-->');
											Breadcrumb.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <!--[-->`);

									const each_array_2 = $.ensure_array_like(items.slice(-ITEMS_TO_DISPLAY + 1));

									for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
										let item = each_array_2[$$index_2];

										if (Breadcrumb.Item) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Item($$renderer, {
												children: ($$renderer) => {
													if (item.href) {
														$$renderer.push('<!--[0-->');

														if (Breadcrumb.Link) {
															$$renderer.push('<!--[-->');

															Breadcrumb.Link($$renderer, {
																href: item.href,
																class: 'max-w-20 truncate md:max-w-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(item.label)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Breadcrumb.Separator) {
															$$renderer.push('<!--[-->');
															Breadcrumb.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');

														if (Breadcrumb.Page) {
															$$renderer.push('<!--[-->');

															Breadcrumb.Page($$renderer, {
																class: 'max-w-20 truncate md:max-w-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(item.label)}`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}