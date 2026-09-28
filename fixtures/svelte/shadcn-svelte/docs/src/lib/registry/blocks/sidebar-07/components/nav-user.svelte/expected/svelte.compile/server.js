import * as $ from 'svelte/internal/server';
import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
import BellIcon from "@lucide/svelte/icons/bell";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import LogOutIcon from "@lucide/svelte/icons/log-out";
import SparklesIcon from "@lucide/svelte/icons/sparkles";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/index.js";

export default function Nav_user($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user } = $$props;
		const sidebar = useSidebar();

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
																	if (Avatar.Root) {
																		$$renderer.push('<!--[-->');

																		Avatar.Root($$renderer, {
																			class: 'size-8 rounded-lg',
																			children: ($$renderer) => {
																				if (Avatar.Image) {
																					$$renderer.push('<!--[-->');
																					Avatar.Image($$renderer, { src: user.avatar, alt: user.name });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Avatar.Fallback) {
																					$$renderer.push('<!--[-->');

																					Avatar.Fallback($$renderer, {
																						class: 'rounded-lg',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->CN`);
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

																	$$renderer.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${$.escape(user.name)}</span> <span class="truncate text-xs">${$.escape(user.email)}</span></div> `);
																	ChevronsUpDownIcon($$renderer, { class: 'ms-auto size-4' });
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

											if (DropdownMenu.Content) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Content($$renderer, {
													class: 'w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg',
													side: sidebar.isMobile ? "bottom" : "right",
													align: 'end',
													sideOffset: 4,
													children: ($$renderer) => {
														if (DropdownMenu.Label) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Label($$renderer, {
																class: 'p-0 font-normal',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">`);

																	if (Avatar.Root) {
																		$$renderer.push('<!--[-->');

																		Avatar.Root($$renderer, {
																			class: 'size-8 rounded-lg',
																			children: ($$renderer) => {
																				if (Avatar.Image) {
																					$$renderer.push('<!--[-->');
																					Avatar.Image($$renderer, { src: user.avatar, alt: user.name });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Avatar.Fallback) {
																					$$renderer.push('<!--[-->');

																					Avatar.Fallback($$renderer, {
																						class: 'rounded-lg',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->CN`);
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

																	$$renderer.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${$.escape(user.name)}</span> <span class="truncate text-xs">${$.escape(user.email)}</span></div></div>`);
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

														if (DropdownMenu.Group) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Group($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			children: ($$renderer) => {
																				SparklesIcon($$renderer, {});
																				$$renderer.push(`<!----> Upgrade to Pro`);
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

														if (DropdownMenu.Separator) {
															$$renderer.push('<!--[-->');
															DropdownMenu.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Group) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Group($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			children: ($$renderer) => {
																				BadgeCheckIcon($$renderer, {});
																				$$renderer.push(`<!----> Account`);
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
																				CreditCardIcon($$renderer, {});
																				$$renderer.push(`<!----> Billing`);
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
																				BellIcon($$renderer, {});
																				$$renderer.push(`<!----> Notifications`);
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
																	LogOutIcon($$renderer, {});
																	$$renderer.push(`<!----> Log out`);
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
	});
}