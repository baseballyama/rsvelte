import * as $ from 'svelte/internal/server';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Nav_workspaces($$renderer, $$props) {
	let { workspaces } = $$props;

	if (Sidebar.Group) {
		$$renderer.push('<!--[-->');

		Sidebar.Group($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.GroupLabel) {
					$$renderer.push('<!--[-->');

					Sidebar.GroupLabel($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Workspaces`);
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

										const each_array = $.ensure_array_like(workspaces);

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let workspace = each_array[$$index_1];

											if (Collapsible.Root) {
												$$renderer.push('<!--[-->');

												Collapsible.Root($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.MenuItem) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuItem($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			$$renderer.push(`<a${$.attributes({ href: '##', ...props })}><span>${$.escape(workspace.emoji)}</span> <span>${$.escape(workspace.name)}</span></a>`);
																		}

																		if (Sidebar.MenuButton) {
																			$$renderer.push('<!--[-->');
																			Sidebar.MenuButton($$renderer, { child, $$slots: { child: true } });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	{
																		function child($$renderer, { props }) {
																			if (Sidebar.MenuAction) {
																				$$renderer.push('<!--[-->');

																				Sidebar.MenuAction($$renderer, $.spread_props([
																					props,
																					{
																						class: 'start-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90',
																						showOnHover: true,
																						children: ($$renderer) => {
																							ChevronRightIcon($$renderer, {});
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

																		if (Collapsible.Trigger) {
																			$$renderer.push('<!--[-->');
																			Collapsible.Trigger($$renderer, { child, $$slots: { child: true } });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	if (Sidebar.MenuAction) {
																		$$renderer.push('<!--[-->');

																		Sidebar.MenuAction($$renderer, {
																			showOnHover: true,
																			children: ($$renderer) => {
																				PlusIcon($$renderer, {});
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Collapsible.Content) {
																		$$renderer.push('<!--[-->');

																		Collapsible.Content($$renderer, {
																			children: ($$renderer) => {
																				if (Sidebar.MenuSub) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuSub($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!--[-->`);

																							const each_array_1 = $.ensure_array_like(workspace.pages);

																							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																								let page = each_array_1[$$index];

																								if (Sidebar.MenuSubItem) {
																									$$renderer.push('<!--[-->');

																									Sidebar.MenuSubItem($$renderer, {
																										children: ($$renderer) => {
																											{
																												function child($$renderer, { props }) {
																													$$renderer.push(`<a${$.attributes({ href: '##', ...props })}><span>${$.escape(page.emoji)}</span> <span>${$.escape(page.name)}</span></a>`);
																												}

																												if (Sidebar.MenuSubButton) {
																													$$renderer.push('<!--[-->');
																													Sidebar.MenuSubButton($$renderer, { child, $$slots: { child: true } });
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
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]--> `);

										if (Sidebar.MenuItem) {
											$$renderer.push('<!--[-->');

											Sidebar.MenuItem($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.MenuButton) {
														$$renderer.push('<!--[-->');

														Sidebar.MenuButton($$renderer, {
															class: 'text-sidebar-foreground/70',
															children: ($$renderer) => {
																EllipsisIcon($$renderer, {});
																$$renderer.push(`<!----> <span>More</span>`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}