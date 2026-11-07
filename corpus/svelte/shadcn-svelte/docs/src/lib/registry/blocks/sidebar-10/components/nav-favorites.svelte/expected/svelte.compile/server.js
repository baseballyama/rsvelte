import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import LinkIcon from "@lucide/svelte/icons/link";
import StarOffIcon from "@lucide/svelte/icons/star-off";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/index.js";

export default function Nav_favorites($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { favorites } = $$props;
		const sidebar = useSidebar();

		if (Sidebar.Group) {
			$$renderer.push('<!--[-->');

			Sidebar.Group($$renderer, {
				class: 'group-data-[collapsible=icon]:hidden',
				children: ($$renderer) => {
					if (Sidebar.GroupLabel) {
						$$renderer.push('<!--[-->');

						Sidebar.GroupLabel($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Favorites`);
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

								const each_array = $.ensure_array_like(favorites);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									if (Sidebar.MenuItem) {
										$$renderer.push('<!--[-->');

										Sidebar.MenuItem($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: item.url, title: item.name, ...props })}><span>${$.escape(item.emoji)}</span> <span>${$.escape(item.name)}</span></a>`);
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
																			{ showOnHover: true },
																			props,
																			{
																				children: ($$renderer) => {
																					EllipsisIcon($$renderer, {});
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
																	class: 'w-56 rounded-lg',
																	side: sidebar.isMobile ? "bottom" : "right",
																	align: sidebar.isMobile ? "end" : "start",
																	children: ($$renderer) => {
																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				children: ($$renderer) => {
																					StarOffIcon($$renderer, { class: 'text-muted-foreground' });
																					$$renderer.push(`<!----> <span>Remove from Favorites</span>`);
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
																				children: ($$renderer) => {
																					LinkIcon($$renderer, { class: 'text-muted-foreground' });
																					$$renderer.push(`<!----> <span>Copy Link</span>`);
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
																					ArrowUpRightIcon($$renderer, { class: 'text-muted-foreground' });
																					$$renderer.push(`<!----> <span>Open in New Tab</span>`);
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
																				children: ($$renderer) => {
																					Trash2Icon($$renderer, { class: 'text-muted-foreground' });
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
	});
}