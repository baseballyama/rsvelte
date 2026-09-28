import * as $ from 'svelte/internal/server';
import DotsIcon from "@tabler/icons-svelte/icons/dots";
import FolderIcon from "@tabler/icons-svelte/icons/folder";
import Share3Icon from "@tabler/icons-svelte/icons/share-3";
import TrashIcon from "@tabler/icons-svelte/icons/trash";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Nav_documents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		const sidebar = Sidebar.useSidebar();

		if (Sidebar.Group) {
			$$renderer.push('<!--[-->');

			Sidebar.Group($$renderer, {
				class: 'group-data-[collapsible=icon]:hidden',
				children: ($$renderer) => {
					if (Sidebar.GroupLabel) {
						$$renderer.push('<!--[-->');

						Sidebar.GroupLabel($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Documents`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Sidebar.Menu) {
						$$renderer.push('<!--[-->');

						Sidebar.Menu($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(items);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									if (Sidebar.MenuItem) {
										$$renderer.push('<!--[-->');

										Sidebar.MenuItem($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ ...props, href: item.url })}>`);

														if (item.icon) {
															$$renderer.push('<!--[-->');
															item.icon($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <span>${$.escape(item.name)}</span></a>`);
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

												if (DropdownMenu.Root) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	if (Sidebar.MenuAction) {
																		$$renderer.push('<!--[-->');

																		Sidebar.MenuAction($$renderer, $.spread_props([
																			props,
																			{
																				showOnHover: true,
																				class: 'rounded-sm data-[state=open]:bg-accent',
																				children: ($$renderer) => {
																					DotsIcon($$renderer, {});
																					$$renderer.push(`<!----> <span class="sr-only">More</span>`);
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
																	class: 'w-24 rounded-lg',
																	side: sidebar.isMobile ? "bottom" : "right",
																	align: sidebar.isMobile ? "end" : "start",
																	children: ($$renderer) => {
																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				children: ($$renderer) => {
																					FolderIcon($$renderer, {});
																					$$renderer.push(`<!----> <span>Open</span>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				children: ($$renderer) => {
																					Share3Icon($$renderer, {});
																					$$renderer.push(`<!----> <span>Share</span>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (DropdownMenu.Separator) {
																			$$renderer.push('<!--[-->');
																			DropdownMenu.Separator($$renderer, {});
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				variant: 'destructive',
																				children: ($$renderer) => {
																					TrashIcon($$renderer, {});
																					$$renderer.push(`<!----> <span>Delete</span>`);
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
														DotsIcon($$renderer, { class: 'text-sidebar-foreground/70' });
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
	});
}