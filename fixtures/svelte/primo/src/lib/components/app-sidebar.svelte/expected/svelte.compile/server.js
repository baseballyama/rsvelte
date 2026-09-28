import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import * as Avatar from '$lib/components/ui/avatar/index.js';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';

import {
	Globe,
	Library,
	Store,
	ChevronsUpDown,
	LogOut,
	ChevronRight,
	Plus,
	LayoutTemplate,
	Cuboid
} from 'lucide-svelte';

import * as Sidebar from '$lib/components/ui/sidebar';
import * as Collapsible from '$lib/components/ui/collapsible';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { useSidebar } from '$lib/components/ui/sidebar/index.js';
import { marketplace, self } from '$lib/pocketbase/managers';
import { LibrarySymbolGroups, SiteGroups } from '$lib/pocketbase/collections';
import { current_user } from '$lib/pocketbase/user';
import { instance } from '$lib/instance';
import { CreditCard } from 'lucide-svelte';

export default function App_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const sidebar = useSidebar();
		let { sidebar_menu = [] } = $$props;
		let is_creating_site_group = false;
		let new_site_group_name = '';

		async function create_site_group(e) {
			e.preventDefault();

			const userId = $.store_get($$store_subs ??= {}, '$current_user', current_user)?.id;

			if (!userId) return;

			const newGroup = SiteGroups.create({ name: new_site_group_name, index: 0 });

			await self.commit();
			new_site_group_name = '';
			is_creating_site_group = false;

			// Navigate to the newly created group
			goto(`/admin/dashboard/sites?group=${newGroup.id}`);
		}

		let is_creating_symbol_group = false;
		let new_symbol_group_name = '';

		async function create_symbol_group(e) {
			e.preventDefault();

			const userId = $.store_get($$store_subs ??= {}, '$current_user', current_user)?.id;

			if (!userId) return;

			const newGroup = LibrarySymbolGroups.create({ name: new_symbol_group_name, index: 0 });

			await self.commit();
			new_symbol_group_name = '';
			is_creating_symbol_group = false;

			// Navigate to the newly created group
			goto(`/admin/dashboard/library?group=${newGroup.id}`);
		}

		function get_dashboard_url() {
			if (typeof window === 'undefined') return '/admin/dashboard';

			const { protocol, hostname, port } = window.location;

			if (hostname === 'localhost' || hostname === '127.0.0.1') {
				return `${protocol}//${hostname}${port ? `:${port}` : ''}/`;
			}

			if (hostname.endsWith('.localhost')) {
				return `${protocol}//localhost${port ? `:${port}` : ''}/`;
			}

			return '/admin/dashboard';
		}

		const path = $.derived(() => $.store_get($$store_subs ??= {}, '$page', page).url.pathname.split('/').slice(0, 4).join('/'));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_creating_site_group;
					},

					set open($$value) {
						is_creating_site_group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">New Site Group</h2> <form>`);

									Input($$renderer, {
										placeholder: 'Name your site group',
										class: 'my-4',
										get value() {
											return new_site_group_name;
										},

										set value($$value) {
											new_site_group_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => is_creating_site_group = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create Group`);
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_creating_symbol_group;
					},

					set open($$value) {
						is_creating_symbol_group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Create Group</h2> <form>`);

									Input($$renderer, {
										placeholder: 'Enter new Group name',
										class: 'my-4',
										get value() {
											return new_symbol_group_name;
										},

										set value($$value) {
											new_symbol_group_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => is_creating_symbol_group = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create`);
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

			$$renderer.push(` `);

			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, {
					collapsible: 'icon',
					class: 'overflow-hidden *:data-[sidebar=sidebar]:flex-row',
					children: ($$renderer) => {
						if (Sidebar.Root) {
							$$renderer.push('<!--[-->');

							Sidebar.Root($$renderer, {
								collapsible: 'none',
								class: 'w-[calc(var(--sidebar-width-icon)+1px)]! border-r',
								children: ($$renderer) => {
									if (Sidebar.Content) {
										$$renderer.push('<!--[-->');

										Sidebar.Content($$renderer, {
											children: ($$renderer) => {
												if (Sidebar.Group) {
													$$renderer.push('<!--[-->');

													Sidebar.Group($$renderer, {
														children: ($$renderer) => {
															if (Sidebar.GroupContent) {
																$$renderer.push('<!--[-->');

																Sidebar.GroupContent($$renderer, {
																	class: 'px-1.5 md:px-0',
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
																									function tooltipContent($$renderer) {
																										$$renderer.push(`<!---->Sites`);
																									}

																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/admin/dashboard/sites'),
																											tooltipContentProps: { hidden: false },
																											onclick: () => {
																												window.location.href = get_dashboard_url();
																												sidebar.setOpen(true);
																											},
																											class: 'px-2.5 md:px-2',
																											tooltipContent,
																											children: ($$renderer) => {
																												Globe($$renderer, {});
																												$$renderer.push(`<!----> <span>Sites</span>`);
																											},
																											$$slots: { tooltipContent: true, default: true }
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

																					$$renderer.push(` `);

																					if (Sidebar.MenuItem) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuItem($$renderer, {
																							children: ($$renderer) => {
																								{
																									function tooltipContent($$renderer) {
																										$$renderer.push(`<!---->Library`);
																									}

																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/admin/dashboard/library'),
																											tooltipContentProps: { hidden: false },
																											onclick: () => {
																												goto('/admin/dashboard/library');
																												sidebar.setOpen(true);
																											},
																											class: 'px-2.5 md:px-2',
																											tooltipContent,
																											children: ($$renderer) => {
																												Library($$renderer, {});
																												$$renderer.push(`<!----> <span>Library</span>`);
																											},
																											$$slots: { tooltipContent: true, default: true }
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

																					$$renderer.push(` `);

																					if (Sidebar.MenuItem) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuItem($$renderer, {
																							children: ($$renderer) => {
																								{
																									function tooltipContent($$renderer) {
																										$$renderer.push(`<!---->Marketplace`);
																									}

																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/admin/dashboard/marketplace'),
																											tooltipContentProps: { hidden: false },
																											onclick: () => {
																												goto('/admin/dashboard/marketplace');
																												sidebar.setOpen(true);
																											},
																											class: 'px-2.5 md:px-2',
																											tooltipContent,
																											children: ($$renderer) => {
																												Store($$renderer, {});
																												$$renderer.push(`<!----> <span>Marketplace</span>`);
																											},
																											$$slots: { tooltipContent: true, default: true }
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

									if (Sidebar.Footer) {
										$$renderer.push('<!--[-->');

										Sidebar.Footer($$renderer, {
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
																									props,
																									{
																										size: 'lg',
																										class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0',
																										children: ($$renderer) => {
																											if (Avatar.Root) {
																												$$renderer.push('<!--[-->');

																												Avatar.Root($$renderer, {
																													class: 'h-8 w-8 rounded-lg',
																													children: ($$renderer) => {
																														if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.avatar) {
																															$$renderer.push('<!--[0-->');

																															const user_avatar = `${self.instance?.baseURL}/api/files/collaborators/${$.store_get($$store_subs ??= {}, '$current_user', current_user).id}/${$.store_get($$store_subs ??= {}, '$current_user', current_user).avatar}`;

																															if (Avatar.Image) {
																																$$renderer.push('<!--[-->');

																																Avatar.Image($$renderer, {
																																	src: user_avatar,
																																	alt: $.store_get($$store_subs ??= {}, '$current_user', current_user).name
																																});

																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}
																														} else {
																															$$renderer.push('<!--[-1-->');
																														}

																														$$renderer.push(`<!--]--> `);

																														if (Avatar.Fallback) {
																															$$renderer.push('<!--[-->');

																															Avatar.Fallback($$renderer, {
																																class: 'rounded-lg uppercase',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->${$.escape(($.store_get($$store_subs ??= {}, '$current_user', current_user)?.name || $.store_get($$store_subs ??= {}, '$current_user', current_user)?.email || '').slice(0, 2).toUpperCase())}`);
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

																											$$renderer.push(` <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-semibold">${$.escape($.store_get($$store_subs ??= {}, '$current_user', current_user)?.email)}</span></div> `);
																											ChevronsUpDown($$renderer, { class: 'ml-auto size-4' });
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
																							side: sidebar.isMobile ? 'bottom' : 'right',
																							align: 'end',
																							sideOffset: 4,
																							children: ($$renderer) => {
																								if (DropdownMenu.Label) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Label($$renderer, {
																										class: 'p-0 font-normal',
																										children: ($$renderer) => {
																											$$renderer.push(`<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">`);

																											if (Avatar.Root) {
																												$$renderer.push('<!--[-->');

																												Avatar.Root($$renderer, {
																													class: 'h-10 w-10 rounded-lg',
																													children: ($$renderer) => {
																														if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.avatar) {
																															$$renderer.push('<!--[0-->');

																															const user_avatar = `${self.instance?.baseURL}/api/files/collaborators/${$.store_get($$store_subs ??= {}, '$current_user', current_user).id}/${$.store_get($$store_subs ??= {}, '$current_user', current_user).avatar}`;

																															if (Avatar.Image) {
																																$$renderer.push('<!--[-->');

																																Avatar.Image($$renderer, {
																																	src: user_avatar,
																																	alt: $.store_get($$store_subs ??= {}, '$current_user', current_user)?.name
																																});

																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}
																														} else {
																															$$renderer.push('<!--[-1-->');
																														}

																														$$renderer.push(`<!--]--> `);

																														if (Avatar.Fallback) {
																															$$renderer.push('<!--[-->');

																															Avatar.Fallback($$renderer, {
																																class: 'rounded-lg uppercase',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->${$.escape(($.store_get($$store_subs ??= {}, '$current_user', current_user)?.name || $.store_get($$store_subs ??= {}, '$current_user', current_user)?.email || '').slice(0, 2).toUpperCase())}`);
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

																											$$renderer.push(` <div class="grid flex-1 text-left text-sm leading-tight">`);

																											if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.name) {
																												$$renderer.push(`<!--[0--><span class="truncate font-semibold">${$.escape($.store_get($$store_subs ??= {}, '$current_user', current_user)?.name)}</span>`);
																											} else {
																												$$renderer.push('<!--[-1-->');
																											}

																											$$renderer.push(`<!--]--> <span class="truncate text-xs">${$.escape($.store_get($$store_subs ??= {}, '$current_user', current_user)?.email)}</span></div></div>`);
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

																								if (instance.hosted_mode && instance.billing_url) {
																									$$renderer.push('<!--[0-->');

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											onclick: () => window.open(instance.billing_url, '_blank'),
																											children: ($$renderer) => {
																												CreditCard($$renderer, {});
																												$$renderer.push(`<!----> Manage Subscription`);
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
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--> `);

																								if (DropdownMenu.Item) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Item($$renderer, {
																										onclick: async () => {
																											self.instance?.authStore.clear();
																											await goto('/admin/auth');
																										},

																										children: ($$renderer) => {
																											LogOut($$renderer, {});
																											$$renderer.push(`<!----> Log out`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (instance.version) {
																									$$renderer.push('<!--[0-->');

																									if (DropdownMenu.Separator) {
																										$$renderer.push('<!--[-->');
																										DropdownMenu.Separator($$renderer, {});
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` <div class="px-2 py-1 text-[0.625rem] text-muted-foreground select-text">Primo ${$.escape(instance.version)}</div>`);
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

						if (Sidebar.Root) {
							$$renderer.push('<!--[-->');

							Sidebar.Root($$renderer, {
								collapsible: 'none',
								class: 'flex-1 flex',
								children: ($$renderer) => {
									if (path().startsWith('/admin/dashboard/sites')) {
										$$renderer.push('<!--[0-->');

										if (Sidebar.Header) {
											$$renderer.push('<!--[-->');

											Sidebar.Header($$renderer, {
												class: 'gap-3.5 border-b p-4',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex w-full text-foreground text-base font-medium gap-2">`);
													Globe($$renderer, { class: 'w-4' });
													$$renderer.push(`<!----> <span>Sites</span></div>`);
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
												class: 'p-2',
												children: ($$renderer) => {
													if (Sidebar.Menu) {
														$$renderer.push('<!--[-->');

														Sidebar.Menu($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(SiteGroups.list() ?? []);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let group = each_array[$$index];
																	const url = `/admin/dashboard/sites?group=${group.id}`;

																	if (Sidebar.MenuItem) {
																		$$renderer.push('<!--[-->');

																		Sidebar.MenuItem($$renderer, {
																			children: ($$renderer) => {
																				{
																					function child($$renderer, { props }) {
																						$$renderer.push(`<a${$.attributes({ href: url, ...props })}><span>${$.escape(group.name)}</span></a>`);
																					}

																					if (Sidebar.MenuButton) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuButton($$renderer, {
																							isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname + $.store_get($$store_subs ??= {}, '$page', page).url.search === url,
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

																$$renderer.push(`<!--]--> `);

																if (Sidebar.MenuItem) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuItem($$renderer, {
																		children: ($$renderer) => {
																			{
																				function child($$renderer, { props }) {
																					$$renderer.push(`<button${$.attributes({ ...props })}><span>Create Group</span> `);
																					Plus($$renderer, {});
																					$$renderer.push(`<!----></button>`);
																				}

																				if (Sidebar.MenuButton) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuButton($$renderer, {
																						class: 'text-sidebar-foreground/70',
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
									} else if (path().startsWith('/admin/dashboard/library')) {
										$$renderer.push('<!--[1-->');

										if (Sidebar.Header) {
											$$renderer.push('<!--[-->');

											Sidebar.Header($$renderer, {
												class: 'gap-3.5 border-b p-4',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex w-full text-foreground text-base font-medium gap-2">`);
													Library($$renderer, { class: 'w-4' });
													$$renderer.push(`<!----> <span>Block Library</span></div>`);
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
												class: 'p-2',
												children: ($$renderer) => {
													if (Sidebar.Menu) {
														$$renderer.push('<!--[-->');

														Sidebar.Menu($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_1 = $.ensure_array_like(LibrarySymbolGroups.list() ?? []);

																for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																	let group = each_array_1[$$index_1];
																	const url = `/admin/dashboard/library?group=${group.id}`;

																	if (Sidebar.MenuItem) {
																		$$renderer.push('<!--[-->');

																		Sidebar.MenuItem($$renderer, {
																			children: ($$renderer) => {
																				{
																					function child($$renderer, { props }) {
																						$$renderer.push(`<a${$.attributes({ href: url, ...props })}><span>${$.escape(group.name)}</span></a>`);
																					}

																					if (Sidebar.MenuButton) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuButton($$renderer, {
																							isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname + $.store_get($$store_subs ??= {}, '$page', page).url.search === url,
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

																$$renderer.push(`<!--]--> `);

																if (Sidebar.MenuItem) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuItem($$renderer, {
																		children: ($$renderer) => {
																			{
																				function child($$renderer, { props }) {
																					$$renderer.push(`<button${$.attributes({ ...props })}><span>Create Group</span> `);
																					Plus($$renderer, {});
																					$$renderer.push(`<!----></button>`);
																				}

																				if (Sidebar.MenuButton) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuButton($$renderer, {
																						class: 'text-sidebar-foreground/70',
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
									} else if (path().startsWith('/admin/dashboard/marketplace')) {
										$$renderer.push('<!--[2-->');

										if (Sidebar.Header) {
											$$renderer.push('<!--[-->');

											Sidebar.Header($$renderer, {
												class: 'gap-3.5 border-b p-4',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex w-full text-foreground text-base font-medium gap-2">`);
													Store($$renderer, { class: 'w-4' });
													$$renderer.push(`<!----> <span>Marketplace</span></div>`);
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
												class: 'p-2',
												children: ($$renderer) => {
													if (Sidebar.Menu) {
														$$renderer.push('<!--[-->');

														Sidebar.Menu($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.MenuItem) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuItem($$renderer, {
																		children: ($$renderer) => {
																			if (Collapsible.Root) {
																				$$renderer.push('<!--[-->');

																				Collapsible.Root($$renderer, {
																					title: 'Starters',
																					open: true,
																					class: 'group/collapsible',
																					children: ($$renderer) => {
																						if (Sidebar.Group) {
																							$$renderer.push('<!--[-->');

																							Sidebar.Group($$renderer, {
																								class: 'p-0',
																								children: ($$renderer) => {
																									{
																										function child($$renderer, { props }) {
																											if (Collapsible.Trigger) {
																												$$renderer.push('<!--[-->');

																												Collapsible.Trigger($$renderer, $.spread_props([
																													props,
																													{
																														children: ($$renderer) => {
																															LayoutTemplate($$renderer, {});
																															$$renderer.push(`<!----> <span class="pl-2">Starters</span> `);

																															ChevronRight($$renderer, {
																																class: 'ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
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

																										if (Sidebar.GroupLabel) {
																											$$renderer.push('<!--[-->');

																											Sidebar.GroupLabel($$renderer, {
																												class: 'group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm',
																												child,
																												$$slots: { child: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									$$renderer.push(` `);

																									if (Collapsible.Content) {
																										$$renderer.push('<!--[-->');

																										Collapsible.Content($$renderer, {
																											children: ($$renderer) => {
																												if (Sidebar.GroupContent) {
																													$$renderer.push('<!--[-->');

																													Sidebar.GroupContent($$renderer, {
																														children: ($$renderer) => {
																															if (Sidebar.Menu) {
																																$$renderer.push('<!--[-->');

																																Sidebar.Menu($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!--[-->`);

																																		const each_array_2 = $.ensure_array_like(SiteGroups.from(marketplace).list({ sort: 'index' }) ?? []);

																																		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																																			let group = each_array_2[$$index_2];
																																			const url = `/admin/dashboard/marketplace/starters?group=${group.id}`;

																																			if (Sidebar.MenuItem) {
																																				$$renderer.push('<!--[-->');

																																				Sidebar.MenuItem($$renderer, {
																																					children: ($$renderer) => {
																																						{
																																							function child($$renderer, { props }) {
																																								$$renderer.push(`<a${$.attributes({ href: url, ...props })}><span>${$.escape(group.name)}</span></a>`);
																																							}

																																							if (Sidebar.MenuButton) {
																																								$$renderer.push('<!--[-->');

																																								Sidebar.MenuButton($$renderer, {
																																									isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname + $.store_get($$store_subs ??= {}, '$page', page).url.search === url,
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

																if (Sidebar.MenuItem) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuItem($$renderer, {
																		children: ($$renderer) => {
																			if (Collapsible.Root) {
																				$$renderer.push('<!--[-->');

																				Collapsible.Root($$renderer, {
																					title: 'Blocks',
																					open: true,
																					class: 'group/collapsible',
																					children: ($$renderer) => {
																						if (Sidebar.Group) {
																							$$renderer.push('<!--[-->');

																							Sidebar.Group($$renderer, {
																								class: 'p-0',
																								children: ($$renderer) => {
																									{
																										function child($$renderer, { props }) {
																											if (Collapsible.Trigger) {
																												$$renderer.push('<!--[-->');

																												Collapsible.Trigger($$renderer, $.spread_props([
																													props,
																													{
																														children: ($$renderer) => {
																															Cuboid($$renderer, {});
																															$$renderer.push(`<!----> <span class="pl-2">Blocks</span> `);

																															ChevronRight($$renderer, {
																																class: 'ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
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

																										if (Sidebar.GroupLabel) {
																											$$renderer.push('<!--[-->');

																											Sidebar.GroupLabel($$renderer, {
																												class: 'group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm',
																												child,
																												$$slots: { child: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									$$renderer.push(` `);

																									if (Collapsible.Content) {
																										$$renderer.push('<!--[-->');

																										Collapsible.Content($$renderer, {
																											children: ($$renderer) => {
																												if (Sidebar.GroupContent) {
																													$$renderer.push('<!--[-->');

																													Sidebar.GroupContent($$renderer, {
																														children: ($$renderer) => {
																															if (Sidebar.Menu) {
																																$$renderer.push('<!--[-->');

																																Sidebar.Menu($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!--[-->`);

																																		const each_array_3 = $.ensure_array_like(LibrarySymbolGroups.from(marketplace).list() ?? []);

																																		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																																			let group = each_array_3[$$index_3];
																																			const url = `/admin/dashboard/marketplace/blocks?group=${group.id}`;

																																			if (Sidebar.MenuItem) {
																																				$$renderer.push('<!--[-->');

																																				Sidebar.MenuItem($$renderer, {
																																					children: ($$renderer) => {
																																						{
																																							function child($$renderer, { props }) {
																																								$$renderer.push(`<a${$.attributes({ href: url, ...props })}><span>${$.escape(group.name)}</span></a>`);
																																							}

																																							if (Sidebar.MenuButton) {
																																								$$renderer.push('<!--[-->');

																																								Sidebar.MenuButton($$renderer, {
																																									isActive: $.store_get($$store_subs ??= {}, '$page', page).url.pathname + $.store_get($$store_subs ??= {}, '$page', page).url.search === url,
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}