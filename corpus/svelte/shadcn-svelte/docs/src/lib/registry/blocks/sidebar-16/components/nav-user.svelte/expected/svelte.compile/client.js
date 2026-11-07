import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
import BellIcon from "@lucide/svelte/icons/bell";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import LogOutIcon from "@lucide/svelte/icons/log-out";
import SparklesIcon from "@lucide/svelte/icons/sparkles";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="truncate text-xs"> </span></div> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm"><!> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="truncate text-xs"> </span></div></div>`);
var root_3 = $.from_html(`<!> Upgrade to Pro`, 1);
var root_4 = $.from_html(`<!> Account`, 1);
var root_5 = $.from_html(`<!> Billing`, 1);
var root_6 = $.from_html(`<!> Notifications`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> Log out`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Nav_user($$anchor, $$props) {
	$.push($$props, true);

	const sidebar = Sidebar.useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
		Sidebar_Menu($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
					Sidebar_MenuItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
								DropdownMenu_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, $.spread_props(
														{
															size: 'lg',
															class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
														},
														props,
														{
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root_1();
																var node_5 = $.first_child(fragment_5);

																$.component(node_5, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																	Avatar_Root($$anchor, {
																		class: 'size-8 rounded-lg',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_6 = $.first_child(fragment_6);

																			$.component(node_6, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																				Avatar_Image($$anchor, {
																					get src() {
																						return $$props.user.avatar;
																					},

																					get alt() {
																						return $$props.user.name;
																					}
																				});
																			});

																			var node_7 = $.sibling(node_6, 2);

																			$.component(node_7, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																				Avatar_Fallback($$anchor, {
																					class: 'rounded-lg',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text = $.text('CN');

																						$.append($$anchor, text);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var div = $.sibling(node_5, 2);
																var span = $.child(div);
																var text_1 = $.only_child(span, true);
																var span_1 = $.sibling(span, 2);
																var text_2 = $.only_child(span_1, true);

																$.reset(div);

																var node_8 = $.sibling(div, 2);

																ChevronsUpDownIcon(node_8, { class: 'ms-auto size-4' });

																$.template_effect(() => {
																	$.set_text(text_1, $$props.user.name);
																	$.set_text(text_2, $$props.user.email);
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														}
													));
												});

												$.append($$anchor, fragment_4);
											};

											$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_9 = $.sibling(node_3, 2);

										{
											let $0 = $.derived(() => sidebar.isMobile ? "bottom" : "right");

											$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
												DropdownMenu_Content($$anchor, {
													class: 'w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg',
													get side() {
														return $.get($0);
													},
													align: 'end',
													sideOffset: 4,
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root_9();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
															DropdownMenu_Label($$anchor, {
																class: 'p-0 font-normal',
																children: ($$anchor, $$slotProps) => {
																	var div_1 = root_2();
																	var node_11 = $.child(div_1);

																	$.component(node_11, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																		Avatar_Root_1($$anchor, {
																			class: 'size-8 rounded-lg',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root();
																				var node_12 = $.first_child(fragment_8);

																				$.component(node_12, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																					Avatar_Image_1($$anchor, {
																						get src() {
																							return $$props.user.avatar;
																						},

																						get alt() {
																							return $$props.user.name;
																						}
																					});
																				});

																				var node_13 = $.sibling(node_12, 2);

																				$.component(node_13, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																					Avatar_Fallback_1($$anchor, {
																						class: 'rounded-lg',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_3 = $.text('CN');

																							$.append($$anchor, text_3);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_8);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var div_2 = $.sibling(node_11, 2);
																	var span_2 = $.child(div_2);
																	var text_4 = $.only_child(span_2, true);
																	var span_3 = $.sibling(span_2, 2);
																	var text_5 = $.only_child(span_3, true);

																	$.reset(div_2);
																	$.reset(div_1);

																	$.template_effect(() => {
																		$.set_text(text_4, $$props.user.name);
																		$.set_text(text_5, $$props.user.email);
																	});

																	$.append($$anchor, div_1);
																},
																$$slots: { default: true }
															});
														});

														var node_14 = $.sibling(node_10, 2);

														$.component(node_14, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
															DropdownMenu_Separator($$anchor, {});
														});

														var node_15 = $.sibling(node_14, 2);

														$.component(node_15, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
															DropdownMenu_Group($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = $.comment();
																	var node_16 = $.first_child(fragment_9);

																	$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																		DropdownMenu_Item($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = root_3();
																				var node_17 = $.first_child(fragment_10);

																				SparklesIcon(node_17, {});
																				$.next();
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

														var node_18 = $.sibling(node_15, 2);

														$.component(node_18, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
															DropdownMenu_Separator_1($$anchor, {});
														});

														var node_19 = $.sibling(node_18, 2);

														$.component(node_19, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
															DropdownMenu_Group_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_11 = root_7();
																	var node_20 = $.first_child(fragment_11);

																	$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																		DropdownMenu_Item_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_12 = root_4();
																				var node_21 = $.first_child(fragment_12);

																				BadgeCheckIcon(node_21, {});
																				$.next();
																				$.append($$anchor, fragment_12);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_22 = $.sibling(node_20, 2);

																	$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																		DropdownMenu_Item_2($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_13 = root_5();
																				var node_23 = $.first_child(fragment_13);

																				CreditCardIcon(node_23, {});
																				$.next();
																				$.append($$anchor, fragment_13);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_24 = $.sibling(node_22, 2);

																	$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																		DropdownMenu_Item_3($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = root_6();
																				var node_25 = $.first_child(fragment_14);

																				BellIcon(node_25, {});
																				$.next();
																				$.append($$anchor, fragment_14);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_11);
																},
																$$slots: { default: true }
															});
														});

														var node_26 = $.sibling(node_19, 2);

														$.component(node_26, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
															DropdownMenu_Separator_2($$anchor, {});
														});

														var node_27 = $.sibling(node_26, 2);

														$.component(node_27, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
															DropdownMenu_Item_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_15 = root_8();
																	var node_28 = $.first_child(fragment_15);

																	LogOutIcon(node_28, {});
																	$.next();
																	$.append($$anchor, fragment_15);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

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

	$.append($$anchor, fragment);
	$.pop();
}