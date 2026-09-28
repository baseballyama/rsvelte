import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">New Site Group</h2> <form><!> <!></form>`, 1);
var root_2 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Create Group</h2> <form><!> <!></form>`, 1);
var root_3 = $.from_html(`<!> <span>Sites</span>`, 1);
var root_4 = $.from_html(`<!> <span>Library</span>`, 1);
var root_5 = $.from_html(`<!> <span>Marketplace</span>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-semibold"> </span></div> <!>`, 1);
var root_8 = $.from_html(`<span class="truncate font-semibold"> </span>`);
var root_9 = $.from_html(`<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"><!> <div class="grid flex-1 text-left text-sm leading-tight"><!> <span class="truncate text-xs"> </span></div></div>`);
var root_10 = $.from_html(`<!> Manage Subscription`, 1);
var root_11 = $.from_html(`<!> Log out`, 1);
var root_12 = $.from_html(`<!> <div class="px-2 py-1 text-[0.625rem] text-muted-foreground select-text"> </div>`, 1);
var root_13 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_14 = $.from_html(`<div class="flex w-full text-foreground text-base font-medium gap-2"><!> <span>Sites</span></div>`);
var root_15 = $.from_html(`<a><span> </span></a>`);
var root_16 = $.from_html(`<button><span>Create Group</span> <!></button>`);
var root_17 = $.from_html(`<div class="flex w-full text-foreground text-base font-medium gap-2"><!> <span>Block Library</span></div>`);
var root_18 = $.from_html(`<div class="flex w-full text-foreground text-base font-medium gap-2"><!> <span>Marketplace</span></div>`);
var root_19 = $.from_html(`<!> <span class="pl-2">Starters</span> <!>`, 1);
var root_20 = $.from_html(`<!> <span class="pl-2">Blocks</span> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const sidebar = useSidebar();
	let sidebar_menu = $.prop($$props, 'sidebar_menu', 19, () => []);
	let is_creating_site_group = $.state(false);
	let new_site_group_name = $.state('');

	async function create_site_group(e) {
		e.preventDefault();

		const userId = $current_user()?.id;

		if (!userId) return;

		const newGroup = SiteGroups.create({ name: $.get(new_site_group_name), index: 0 });

		await self.commit();
		$.set(new_site_group_name, '');
		$.set(is_creating_site_group, false);

		// Navigate to the newly created group
		goto(`/admin/dashboard/sites?group=${newGroup.id}`);
	}

	let is_creating_symbol_group = $.state(false);
	let new_symbol_group_name = $.state('');

	async function create_symbol_group(e) {
		e.preventDefault();

		const userId = $current_user()?.id;

		if (!userId) return;

		const newGroup = LibrarySymbolGroups.create({ name: $.get(new_symbol_group_name), index: 0 });

		await self.commit();
		$.set(new_symbol_group_name, '');
		$.set(is_creating_symbol_group, false);

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

	const path = $.derived(() => $page().url.pathname.split('/').slice(0, 4).join('/'));
	var fragment = root_6();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(is_creating_site_group);
			},

			set open($$value) {
				$.set(is_creating_site_group, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var form = $.sibling($.first_child(fragment_2), 2);
							var node_2 = $.child(form);

							Input(node_2, {
								placeholder: 'Name your site group',
								class: 'my-4',
								get value() {
									return $.get(new_site_group_name);
								},

								set value($$value) {
									$.set(new_site_group_name, $$value, true);
								}
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										Button(node_4, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(is_creating_site_group, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Cancel');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										Button(node_5, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Create Group');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.event('submit', form, create_site_group);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(is_creating_symbol_group);
			},

			set open($$value) {
				$.set(is_creating_symbol_group, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var form_1 = $.sibling($.first_child(fragment_5), 2);
							var node_8 = $.child(form_1);

							Input(node_8, {
								placeholder: 'Enter new Group name',
								class: 'my-4',
								get value() {
									return $.get(new_symbol_group_name);
								},

								set value($$value) {
									$.set(new_symbol_group_name, $$value, true);
								}
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
								Dialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_10 = $.first_child(fragment_6);

										Button(node_10, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(is_creating_symbol_group, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Cancel');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										var node_11 = $.sibling(node_10, 2);

										Button(node_11, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Create');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form_1);
							$.event('submit', form_1, create_symbol_group);
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

	var node_12 = $.sibling(node_6, 2);

	$.component(node_12, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, {
			collapsible: 'icon',
			class: 'overflow-hidden *:data-[sidebar=sidebar]:flex-row',
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_13 = $.first_child(fragment_7);

				$.component(node_13, () => Sidebar.Root, ($$anchor, Sidebar_Root_1) => {
					Sidebar_Root_1($$anchor, {
						collapsible: 'none',
						class: 'w-[calc(var(--sidebar-width-icon)+1px)]! border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_14 = $.first_child(fragment_8);

							$.component(node_14, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = $.comment();
										var node_15 = $.first_child(fragment_9);

										$.component(node_15, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = $.comment();
													var node_16 = $.first_child(fragment_10);

													$.component(node_16, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															class: 'px-1.5 md:px-0',
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = $.comment();
																var node_17 = $.first_child(fragment_11);

																$.component(node_17, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																	Sidebar_Menu($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_12 = root_6();
																			var node_18 = $.first_child(fragment_12);

																			$.component(node_18, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																				Sidebar_MenuItem($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = $.comment();
																						var node_19 = $.first_child(fragment_13);

																						{
																							const tooltipContent = ($$anchor) => {
																								$.next();

																								var text_4 = $.text('Sites');

																								$.append($$anchor, text_4);
																							};

																							let $0 = $.derived(() => $page().url.pathname.startsWith('/admin/dashboard/sites'));

																							$.component(node_19, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																								Sidebar_MenuButton($$anchor, {
																									get isActive() {
																										return $.get($0);
																									},
																									tooltipContentProps: { hidden: false },
																									onclick: () => {
																										window.location.href = get_dashboard_url();
																										sidebar.setOpen(true);
																									},
																									class: 'px-2.5 md:px-2',
																									tooltipContent,
																									children: ($$anchor, $$slotProps) => {
																										var fragment_14 = root_3();
																										var node_20 = $.first_child(fragment_14);

																										Globe(node_20, {});
																										$.next(2);
																										$.append($$anchor, fragment_14);
																									},
																									$$slots: { tooltipContent: true, default: true }
																								});
																							});
																						}

																						$.append($$anchor, fragment_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_21 = $.sibling(node_18, 2);

																			$.component(node_21, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																				Sidebar_MenuItem_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_15 = $.comment();
																						var node_22 = $.first_child(fragment_15);

																						{
																							const tooltipContent = ($$anchor) => {
																								$.next();

																								var text_5 = $.text('Library');

																								$.append($$anchor, text_5);
																							};

																							let $0 = $.derived(() => $page().url.pathname.startsWith('/admin/dashboard/library'));

																							$.component(node_22, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																								Sidebar_MenuButton_1($$anchor, {
																									get isActive() {
																										return $.get($0);
																									},
																									tooltipContentProps: { hidden: false },
																									onclick: () => {
																										goto('/admin/dashboard/library');
																										sidebar.setOpen(true);
																									},
																									class: 'px-2.5 md:px-2',
																									tooltipContent,
																									children: ($$anchor, $$slotProps) => {
																										var fragment_16 = root_4();
																										var node_23 = $.first_child(fragment_16);

																										Library(node_23, {});
																										$.next(2);
																										$.append($$anchor, fragment_16);
																									},
																									$$slots: { tooltipContent: true, default: true }
																								});
																							});
																						}

																						$.append($$anchor, fragment_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_24 = $.sibling(node_21, 2);

																			$.component(node_24, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_2) => {
																				Sidebar_MenuItem_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_17 = $.comment();
																						var node_25 = $.first_child(fragment_17);

																						{
																							const tooltipContent = ($$anchor) => {
																								$.next();

																								var text_6 = $.text('Marketplace');

																								$.append($$anchor, text_6);
																							};

																							let $0 = $.derived(() => $page().url.pathname.startsWith('/admin/dashboard/marketplace'));

																							$.component(node_25, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_2) => {
																								Sidebar_MenuButton_2($$anchor, {
																									get isActive() {
																										return $.get($0);
																									},
																									tooltipContentProps: { hidden: false },
																									onclick: () => {
																										goto('/admin/dashboard/marketplace');
																										sidebar.setOpen(true);
																									},
																									class: 'px-2.5 md:px-2',
																									tooltipContent,
																									children: ($$anchor, $$slotProps) => {
																										var fragment_18 = root_5();
																										var node_26 = $.first_child(fragment_18);

																										Store(node_26, {});
																										$.next(2);
																										$.append($$anchor, fragment_18);
																									},
																									$$slots: { tooltipContent: true, default: true }
																								});
																							});
																						}

																						$.append($$anchor, fragment_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_14, 2);

							$.component(node_27, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
								Sidebar_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = $.comment();
										var node_28 = $.first_child(fragment_19);

										$.component(node_28, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
											Sidebar_Menu_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_20 = $.comment();
													var node_29 = $.first_child(fragment_20);

													$.component(node_29, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_3) => {
														Sidebar_MenuItem_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = $.comment();
																var node_30 = $.first_child(fragment_21);

																$.component(node_30, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																	DropdownMenu_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_22 = root();
																			var node_31 = $.first_child(fragment_22);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var fragment_23 = $.comment();
																					var node_32 = $.first_child(fragment_23);

																					$.component(node_32, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_3) => {
																						Sidebar_MenuButton_3($$anchor, $.spread_props(props, {
																							size: 'lg',
																							class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_24 = root_7();
																								var node_33 = $.first_child(fragment_24);

																								$.component(node_33, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																									Avatar_Root($$anchor, {
																										class: 'h-8 w-8 rounded-lg',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_25 = root();
																											var node_34 = $.first_child(fragment_25);

																											{
																												var consequent = ($$anchor) => {
																													const user_avatar = $.derived(() => `${self.instance?.baseURL}/api/files/collaborators/${$current_user().id}/${$current_user().avatar}`);
																													var fragment_26 = $.comment();
																													var node_35 = $.first_child(fragment_26);

																													$.component(node_35, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																														Avatar_Image($$anchor, {
																															get src() {
																																return $.get(user_avatar);
																															},

																															get alt() {
																																return $current_user().name;
																															}
																														});
																													});

																													$.append($$anchor, fragment_26);
																												};

																												$.if(node_34, ($$render) => {
																													if ($current_user()?.avatar) $$render(consequent);
																												});
																											}

																											var node_36 = $.sibling(node_34, 2);

																											$.component(node_36, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																												Avatar_Fallback($$anchor, {
																													class: 'rounded-lg uppercase',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_7 = $.text();

																														$.template_effect(($0) => $.set_text(text_7, $0), [
																															() => ($current_user()?.name || $current_user()?.email || '').slice(0, 2).toUpperCase()
																														]);

																														$.append($$anchor, text_7);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_25);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var div = $.sibling(node_33, 2);
																								var span = $.child(div);
																								var text_8 = $.only_child(span, true);

																								$.reset(div);

																								var node_37 = $.sibling(div, 2);

																								ChevronsUpDown(node_37, { class: 'ml-auto size-4' });
																								$.template_effect(() => $.set_text(text_8, $current_user()?.email));
																								$.append($$anchor, fragment_24);
																							},
																							$$slots: { default: true }
																						}));
																					});

																					$.append($$anchor, fragment_23);
																				};

																				$.component(node_31, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																					DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																				});
																			}

																			var node_38 = $.sibling(node_31, 2);

																			{
																				let $0 = $.derived(() => sidebar.isMobile ? 'bottom' : 'right');

																				$.component(node_38, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																					DropdownMenu_Content($$anchor, {
																						class: 'w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg',
																						get side() {
																							return $.get($0);
																						},
																						align: 'end',
																						sideOffset: 4,
																						children: ($$anchor, $$slotProps) => {
																							var fragment_28 = root_13();
																							var node_39 = $.first_child(fragment_28);

																							$.component(node_39, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																								DropdownMenu_Label($$anchor, {
																									class: 'p-0 font-normal',
																									children: ($$anchor, $$slotProps) => {
																										var div_1 = root_9();
																										var node_40 = $.child(div_1);

																										$.component(node_40, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																											Avatar_Root_1($$anchor, {
																												class: 'h-10 w-10 rounded-lg',
																												children: ($$anchor, $$slotProps) => {
																													var fragment_29 = root();
																													var node_41 = $.first_child(fragment_29);

																													{
																														var consequent_1 = ($$anchor) => {
																															const user_avatar = $.derived(() => `${self.instance?.baseURL}/api/files/collaborators/${$current_user().id}/${$current_user().avatar}`);
																															var fragment_30 = $.comment();
																															var node_42 = $.first_child(fragment_30);

																															{
																																let $0 = $.derived(() => $current_user()?.name);

																																$.component(node_42, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																																	Avatar_Image_1($$anchor, {
																																		get src() {
																																			return $.get(user_avatar);
																																		},

																																		get alt() {
																																			return $.get($0);
																																		}
																																	});
																																});
																															}

																															$.append($$anchor, fragment_30);
																														};

																														$.if(node_41, ($$render) => {
																															if ($current_user()?.avatar) $$render(consequent_1);
																														});
																													}

																													var node_43 = $.sibling(node_41, 2);

																													$.component(node_43, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																														Avatar_Fallback_1($$anchor, {
																															class: 'rounded-lg uppercase',
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_9 = $.text();

																																$.template_effect(($0) => $.set_text(text_9, $0), [
																																	() => ($current_user()?.name || $current_user()?.email || '').slice(0, 2).toUpperCase()
																																]);

																																$.append($$anchor, text_9);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_29);
																												},
																												$$slots: { default: true }
																											});
																										});

																										var div_2 = $.sibling(node_40, 2);
																										var node_44 = $.child(div_2);

																										{
																											var consequent_2 = ($$anchor) => {
																												var span_1 = root_8();
																												var text_10 = $.only_child(span_1, true);

																												$.template_effect(() => $.set_text(text_10, $current_user()?.name));
																												$.append($$anchor, span_1);
																											};

																											$.if(node_44, ($$render) => {
																												if ($current_user()?.name) $$render(consequent_2);
																											});
																										}

																										var span_2 = $.sibling(node_44, 2);
																										var text_11 = $.only_child(span_2, true);

																										$.reset(div_2);
																										$.reset(div_1);
																										$.template_effect(() => $.set_text(text_11, $current_user()?.email));
																										$.append($$anchor, div_1);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_45 = $.sibling(node_39, 2);

																							$.component(node_45, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																								DropdownMenu_Separator($$anchor, {});
																							});

																							var node_46 = $.sibling(node_45, 2);

																							{
																								var consequent_3 = ($$anchor) => {
																									var fragment_32 = root();
																									var node_47 = $.first_child(fragment_32);

																									$.component(node_47, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																										DropdownMenu_Item($$anchor, {
																											onclick: () => window.open(instance.billing_url, '_blank'),
																											children: ($$anchor, $$slotProps) => {
																												var fragment_33 = root_10();
																												var node_48 = $.first_child(fragment_33);

																												CreditCard(node_48, {});
																												$.next();
																												$.append($$anchor, fragment_33);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_49 = $.sibling(node_47, 2);

																									$.component(node_49, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																										DropdownMenu_Separator_1($$anchor, {});
																									});

																									$.append($$anchor, fragment_32);
																								};

																								$.if(node_46, ($$render) => {
																									if (instance.hosted_mode && instance.billing_url) $$render(consequent_3);
																								});
																							}

																							var node_50 = $.sibling(node_46, 2);

																							$.component(node_50, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																								DropdownMenu_Item_1($$anchor, {
																									onclick: async () => {
																										self.instance?.authStore.clear();
																										await goto('/admin/auth');
																									},

																									children: ($$anchor, $$slotProps) => {
																										var fragment_34 = root_11();
																										var node_51 = $.first_child(fragment_34);

																										LogOut(node_51, {});
																										$.next();
																										$.append($$anchor, fragment_34);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_52 = $.sibling(node_50, 2);

																							{
																								var consequent_4 = ($$anchor) => {
																									var fragment_35 = root_12();
																									var node_53 = $.first_child(fragment_35);

																									$.component(node_53, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
																										DropdownMenu_Separator_2($$anchor, {});
																									});

																									var div_3 = $.sibling(node_53, 2);
																									var text_12 = $.only_child(div_3);

																									$.template_effect(() => $.set_text(text_12, `Primo ${instance.version ?? ''}`));
																									$.append($$anchor, fragment_35);
																								};

																								$.if(node_52, ($$render) => {
																									if (instance.version) $$render(consequent_4);
																								});
																							}

																							$.append($$anchor, fragment_28);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_22);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_20);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_54 = $.sibling(node_13, 2);

				$.component(node_54, () => Sidebar.Root, ($$anchor, Sidebar_Root_2) => {
					Sidebar_Root_2($$anchor, {
						collapsible: 'none',
						class: 'flex-1 flex',
						children: ($$anchor, $$slotProps) => {
							var fragment_36 = $.comment();
							var node_55 = $.first_child(fragment_36);

							{
								var consequent_5 = ($$anchor) => {
									var fragment_37 = root();
									var node_56 = $.first_child(fragment_37);

									$.component(node_56, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
										Sidebar_Header($$anchor, {
											class: 'gap-3.5 border-b p-4',
											children: ($$anchor, $$slotProps) => {
												var div_4 = root_14();
												var node_57 = $.child(div_4);

												Globe(node_57, { class: 'w-4' });
												$.next(2);
												$.reset(div_4);
												$.append($$anchor, div_4);
											},
											$$slots: { default: true }
										});
									});

									var node_58 = $.sibling(node_56, 2);

									$.component(node_58, () => Sidebar.Content, ($$anchor, Sidebar_Content_1) => {
										Sidebar_Content_1($$anchor, {
											class: 'p-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_38 = $.comment();
												var node_59 = $.first_child(fragment_38);

												$.component(node_59, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_2) => {
													Sidebar_Menu_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_39 = root();
															var node_60 = $.first_child(fragment_39);

															$.each(node_60, 17, () => SiteGroups.list() ?? [], $.index, ($$anchor, group) => {
																const url = $.derived(() => `/admin/dashboard/sites?group=${$.get(group).id}`);
																var fragment_40 = $.comment();
																var node_61 = $.first_child(fragment_40);

																$.component(node_61, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_4) => {
																	Sidebar_MenuItem_4($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_41 = $.comment();
																			var node_62 = $.first_child(fragment_41);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var a = root_15();

																					$.attribute_effect(a, () => ({ href: $.get(url), ...props() }));

																					var span_3 = $.child(a);
																					var text_13 = $.only_child(span_3, true);

																					$.reset(a);
																					$.template_effect(() => $.set_text(text_13, $.get(group).name));
																					$.append($$anchor, a);
																				};

																				let $0 = $.derived(() => $page().url.pathname + $page().url.search === $.get(url));

																				$.component(node_62, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_4) => {
																					Sidebar_MenuButton_4($$anchor, {
																						get isActive() {
																							return $.get($0);
																						},
																						child,
																						$$slots: { child: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_41);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_40);
															});

															var node_63 = $.sibling(node_60, 2);

															$.component(node_63, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_5) => {
																Sidebar_MenuItem_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_42 = $.comment();
																		var node_64 = $.first_child(fragment_42);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var button = root_16();
																				var event_handler = () => $.set(is_creating_site_group, true);

																				$.attribute_effect(button, () => ({ ...props(), onclick: event_handler }));

																				var node_65 = $.sibling($.child(button), 2);

																				Plus(node_65, {});
																				$.reset(button);
																				$.append($$anchor, button);
																			};

																			$.component(node_64, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_5) => {
																				Sidebar_MenuButton_5($$anchor, {
																					class: 'text-sidebar-foreground/70',
																					child,
																					$$slots: { child: true }
																				});
																			});
																		}

																		$.append($$anchor, fragment_42);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_39);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_38);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_37);
								};

								var d = $.derived(() => $.get(path).startsWith('/admin/dashboard/sites'));

								var consequent_6 = ($$anchor) => {
									var fragment_43 = root();
									var node_66 = $.first_child(fragment_43);

									$.component(node_66, () => Sidebar.Header, ($$anchor, Sidebar_Header_1) => {
										Sidebar_Header_1($$anchor, {
											class: 'gap-3.5 border-b p-4',
											children: ($$anchor, $$slotProps) => {
												var div_5 = root_17();
												var node_67 = $.child(div_5);

												Library(node_67, { class: 'w-4' });
												$.next(2);
												$.reset(div_5);
												$.append($$anchor, div_5);
											},
											$$slots: { default: true }
										});
									});

									var node_68 = $.sibling(node_66, 2);

									$.component(node_68, () => Sidebar.Content, ($$anchor, Sidebar_Content_2) => {
										Sidebar_Content_2($$anchor, {
											class: 'p-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_44 = $.comment();
												var node_69 = $.first_child(fragment_44);

												$.component(node_69, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_3) => {
													Sidebar_Menu_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_45 = root();
															var node_70 = $.first_child(fragment_45);

															$.each(node_70, 17, () => LibrarySymbolGroups.list() ?? [], $.index, ($$anchor, group) => {
																const url = $.derived(() => `/admin/dashboard/library?group=${$.get(group).id}`);
																var fragment_46 = $.comment();
																var node_71 = $.first_child(fragment_46);

																$.component(node_71, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_6) => {
																	Sidebar_MenuItem_6($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_47 = $.comment();
																			var node_72 = $.first_child(fragment_47);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var a_1 = root_15();

																					$.attribute_effect(a_1, () => ({ href: $.get(url), ...props() }));

																					var span_4 = $.child(a_1);
																					var text_14 = $.only_child(span_4, true);

																					$.reset(a_1);
																					$.template_effect(() => $.set_text(text_14, $.get(group).name));
																					$.append($$anchor, a_1);
																				};

																				let $0 = $.derived(() => $page().url.pathname + $page().url.search === $.get(url));

																				$.component(node_72, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_6) => {
																					Sidebar_MenuButton_6($$anchor, {
																						get isActive() {
																							return $.get($0);
																						},
																						child,
																						$$slots: { child: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_47);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_46);
															});

															var node_73 = $.sibling(node_70, 2);

															$.component(node_73, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_7) => {
																Sidebar_MenuItem_7($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_48 = $.comment();
																		var node_74 = $.first_child(fragment_48);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var button_1 = root_16();
																				var event_handler_1 = () => $.set(is_creating_symbol_group, true);

																				$.attribute_effect(button_1, () => ({ ...props(), onclick: event_handler_1 }));

																				var node_75 = $.sibling($.child(button_1), 2);

																				Plus(node_75, {});
																				$.reset(button_1);
																				$.append($$anchor, button_1);
																			};

																			$.component(node_74, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_7) => {
																				Sidebar_MenuButton_7($$anchor, {
																					class: 'text-sidebar-foreground/70',
																					child,
																					$$slots: { child: true }
																				});
																			});
																		}

																		$.append($$anchor, fragment_48);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_45);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_44);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_43);
								};

								var d_1 = $.derived(() => $.get(path).startsWith('/admin/dashboard/library'));

								var consequent_7 = ($$anchor) => {
									var fragment_49 = root();
									var node_76 = $.first_child(fragment_49);

									$.component(node_76, () => Sidebar.Header, ($$anchor, Sidebar_Header_2) => {
										Sidebar_Header_2($$anchor, {
											class: 'gap-3.5 border-b p-4',
											children: ($$anchor, $$slotProps) => {
												var div_6 = root_18();
												var node_77 = $.child(div_6);

												Store(node_77, { class: 'w-4' });
												$.next(2);
												$.reset(div_6);
												$.append($$anchor, div_6);
											},
											$$slots: { default: true }
										});
									});

									var node_78 = $.sibling(node_76, 2);

									$.component(node_78, () => Sidebar.Content, ($$anchor, Sidebar_Content_3) => {
										Sidebar_Content_3($$anchor, {
											class: 'p-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_50 = $.comment();
												var node_79 = $.first_child(fragment_50);

												$.component(node_79, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_4) => {
													Sidebar_Menu_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_51 = root();
															var node_80 = $.first_child(fragment_51);

															$.component(node_80, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_8) => {
																Sidebar_MenuItem_8($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_52 = $.comment();
																		var node_81 = $.first_child(fragment_52);

																		$.component(node_81, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
																			Collapsible_Root($$anchor, {
																				title: 'Starters',
																				open: true,
																				class: 'group/collapsible',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_53 = $.comment();
																					var node_82 = $.first_child(fragment_53);

																					$.component(node_82, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
																						Sidebar_Group_1($$anchor, {
																							class: 'p-0',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_54 = root();
																								var node_83 = $.first_child(fragment_54);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var fragment_55 = $.comment();
																										var node_84 = $.first_child(fragment_55);

																										$.component(node_84, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																											Collapsible_Trigger($$anchor, $.spread_props(props, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_56 = root_19();
																													var node_85 = $.first_child(fragment_56);

																													LayoutTemplate(node_85, {});

																													var node_86 = $.sibling(node_85, 4);

																													ChevronRight(node_86, {
																														class: 'ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
																													});

																													$.append($$anchor, fragment_56);
																												},
																												$$slots: { default: true }
																											}));
																										});

																										$.append($$anchor, fragment_55);
																									};

																									$.component(node_83, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
																										Sidebar_GroupLabel($$anchor, {
																											class: 'group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm',
																											child,
																											$$slots: { child: true }
																										});
																									});
																								}

																								var node_87 = $.sibling(node_83, 2);

																								$.component(node_87, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																									Collapsible_Content($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_57 = $.comment();
																											var node_88 = $.first_child(fragment_57);

																											$.component(node_88, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_1) => {
																												Sidebar_GroupContent_1($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_58 = $.comment();
																														var node_89 = $.first_child(fragment_58);

																														$.component(node_89, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_5) => {
																															Sidebar_Menu_5($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_59 = $.comment();
																																	var node_90 = $.first_child(fragment_59);

																																	$.each(node_90, 17, () => SiteGroups.from(marketplace).list({ sort: 'index' }) ?? [], $.index, ($$anchor, group) => {
																																		const url = $.derived(() => `/admin/dashboard/marketplace/starters?group=${$.get(group).id}`);
																																		var fragment_60 = $.comment();
																																		var node_91 = $.first_child(fragment_60);

																																		$.component(node_91, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_9) => {
																																			Sidebar_MenuItem_9($$anchor, {
																																				children: ($$anchor, $$slotProps) => {
																																					var fragment_61 = $.comment();
																																					var node_92 = $.first_child(fragment_61);

																																					{
																																						const child = ($$anchor, $$arg0) => {
																																							let props = () => ($$arg0?.()).props;
																																							var a_2 = root_15();

																																							$.attribute_effect(a_2, () => ({ href: $.get(url), ...props() }));

																																							var span_5 = $.child(a_2);
																																							var text_15 = $.only_child(span_5, true);

																																							$.reset(a_2);
																																							$.template_effect(() => $.set_text(text_15, $.get(group).name));
																																							$.append($$anchor, a_2);
																																						};

																																						let $0 = $.derived(() => $page().url.pathname + $page().url.search === $.get(url));

																																						$.component(node_92, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_8) => {
																																							Sidebar_MenuButton_8($$anchor, {
																																								get isActive() {
																																									return $.get($0);
																																								},
																																								child,
																																								$$slots: { child: true }
																																							});
																																						});
																																					}

																																					$.append($$anchor, fragment_61);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_60);
																																	});

																																	$.append($$anchor, fragment_59);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_58);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_57);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_54);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_53);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_52);
																	},
																	$$slots: { default: true }
																});
															});

															var node_93 = $.sibling(node_80, 2);

															$.component(node_93, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_10) => {
																Sidebar_MenuItem_10($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_62 = $.comment();
																		var node_94 = $.first_child(fragment_62);

																		$.component(node_94, () => Collapsible.Root, ($$anchor, Collapsible_Root_1) => {
																			Collapsible_Root_1($$anchor, {
																				title: 'Blocks',
																				open: true,
																				class: 'group/collapsible',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_63 = $.comment();
																					var node_95 = $.first_child(fragment_63);

																					$.component(node_95, () => Sidebar.Group, ($$anchor, Sidebar_Group_2) => {
																						Sidebar_Group_2($$anchor, {
																							class: 'p-0',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_64 = root();
																								var node_96 = $.first_child(fragment_64);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var fragment_65 = $.comment();
																										var node_97 = $.first_child(fragment_65);

																										$.component(node_97, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger_1) => {
																											Collapsible_Trigger_1($$anchor, $.spread_props(props, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_66 = root_20();
																													var node_98 = $.first_child(fragment_66);

																													Cuboid(node_98, {});

																													var node_99 = $.sibling(node_98, 4);

																													ChevronRight(node_99, {
																														class: 'ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
																													});

																													$.append($$anchor, fragment_66);
																												},
																												$$slots: { default: true }
																											}));
																										});

																										$.append($$anchor, fragment_65);
																									};

																									$.component(node_96, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_1) => {
																										Sidebar_GroupLabel_1($$anchor, {
																											class: 'group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm',
																											child,
																											$$slots: { child: true }
																										});
																									});
																								}

																								var node_100 = $.sibling(node_96, 2);

																								$.component(node_100, () => Collapsible.Content, ($$anchor, Collapsible_Content_1) => {
																									Collapsible_Content_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_67 = $.comment();
																											var node_101 = $.first_child(fragment_67);

																											$.component(node_101, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_2) => {
																												Sidebar_GroupContent_2($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_68 = $.comment();
																														var node_102 = $.first_child(fragment_68);

																														$.component(node_102, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_6) => {
																															Sidebar_Menu_6($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_69 = $.comment();
																																	var node_103 = $.first_child(fragment_69);

																																	$.each(node_103, 17, () => LibrarySymbolGroups.from(marketplace).list() ?? [], $.index, ($$anchor, group) => {
																																		const url = $.derived(() => `/admin/dashboard/marketplace/blocks?group=${$.get(group).id}`);
																																		var fragment_70 = $.comment();
																																		var node_104 = $.first_child(fragment_70);

																																		$.component(node_104, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_11) => {
																																			Sidebar_MenuItem_11($$anchor, {
																																				children: ($$anchor, $$slotProps) => {
																																					var fragment_71 = $.comment();
																																					var node_105 = $.first_child(fragment_71);

																																					{
																																						const child = ($$anchor, $$arg0) => {
																																							let props = () => ($$arg0?.()).props;
																																							var a_3 = root_15();

																																							$.attribute_effect(a_3, () => ({ href: $.get(url), ...props() }));

																																							var span_6 = $.child(a_3);
																																							var text_16 = $.only_child(span_6, true);

																																							$.reset(a_3);
																																							$.template_effect(() => $.set_text(text_16, $.get(group).name));
																																							$.append($$anchor, a_3);
																																						};

																																						let $0 = $.derived(() => $page().url.pathname + $page().url.search === $.get(url));

																																						$.component(node_105, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_9) => {
																																							Sidebar_MenuButton_9($$anchor, {
																																								get isActive() {
																																									return $.get($0);
																																								},
																																								child,
																																								$$slots: { child: true }
																																							});
																																						});
																																					}

																																					$.append($$anchor, fragment_71);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_70);
																																	});

																																	$.append($$anchor, fragment_69);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_68);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_67);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_64);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_63);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_62);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_51);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_50);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_49);
								};

								var d_2 = $.derived(() => $.get(path).startsWith('/admin/dashboard/marketplace'));

								$.if(node_55, ($$render) => {
									if ($.get(d)) $$render(consequent_5); else if ($.get(d_1)) $$render(consequent_6, 1); else if ($.get(d_2)) $$render(consequent_7, 2);
								});
							}

							$.append($$anchor, fragment_36);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}