import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-semibold">shadcn</span> <span class="truncate text-xs text-muted-foreground">shadcn@example.com</span></div> <!>`, 1);
var root_2 = $.from_html(`<!> Account`, 1);
var root_3 = $.from_html(`<!> Billing`, 1);
var root_4 = $.from_html(`<!> Notifications`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> Sign Out`, 1);
var root_7 = $.from_html(`<div class="flex items-center justify-between gap-4"><!> <!></div>`);

export default function Dropdown_menu_with_avatar($$anchor) {
	Example($$anchor, {
		title: 'With Avatar',
		children: ($$anchor, $$slotProps) => {
			var div = root_7();
			var node = $.child(div);

			$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(
									{
										variant: 'outline',
										class: 'h-12 justify-start px-2 md:max-w-[200px]'
									},
									props,
									{
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_1();
											var node_2 = $.first_child(fragment_3);

											$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
												Avatar_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root();
														var node_3 = $.first_child(fragment_4);

														$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
															Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: 'Shadcn' });
														});

														var node_4 = $.sibling(node_3, 2);

														$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
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

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_2, 4);

											IconPlaceholder(node_5, {
												lucide: 'ChevronsUpDownIcon',
												tabler: 'IconSelector',
												hugeicons: 'UnfoldMoreIcon',
												phosphor: 'CaretUpDownIcon',
												remixicon: 'RiArrowUpDownLine',
												class: 'ml-auto text-muted-foreground'
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									}
								));
							};

							$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								class: 'w-(--anchor-width) min-w-56',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_5();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_5();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_2();
															var node_9 = $.first_child(fragment_7);

															IconPlaceholder(node_9, {
																lucide: 'BadgeCheckIcon',
																tabler: 'IconRosetteDiscountCheck',
																hugeicons: 'CheckmarkBadgeIcon',
																phosphor: 'CheckCircleIcon',
																remixicon: 'RiCheckboxCircleLine'
															});

															$.next();
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_8, 2);

												$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_3();
															var node_11 = $.first_child(fragment_8);

															IconPlaceholder(node_11, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															$.next();
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_10, 2);

												$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
													DropdownMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_4();
															var node_13 = $.first_child(fragment_9);

															IconPlaceholder(node_13, {
																lucide: 'BellIcon',
																tabler: 'IconBell',
																hugeicons: 'NotificationIcon',
																phosphor: 'BellIcon',
																remixicon: 'RiNotificationLine'
															});

															$.next();
															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_7, 2);

									$.component(node_14, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
										DropdownMenu_Separator($$anchor, {});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
										DropdownMenu_Item_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_6();
												var node_16 = $.first_child(fragment_10);

												IconPlaceholder(node_16, {
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$.next();
												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_17 = $.sibling(node, 2);

			$.component(node_17, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
				DropdownMenu_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root();
						var node_18 = $.first_child(fragment_11);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon', class: 'rounded-full' }, props, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = $.comment();
										var node_19 = $.first_child(fragment_13);

										$.component(node_19, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
											Avatar_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root();
													var node_20 = $.first_child(fragment_14);

													$.component(node_20, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
														Avatar_Image_1($$anchor, { src: 'https://github.com/shadcn.png', alt: 'shadcn' });
													});

													var node_21 = $.sibling(node_20, 2);

													$.component(node_21, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
														Avatar_Fallback_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('LR');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_18, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
								DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_22 = $.sibling(node_18, 2);

						$.component(node_22, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
							DropdownMenu_Content_1($$anchor, {
								align: 'end',
								side: 'top',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_5();
									var node_23 = $.first_child(fragment_15);

									$.component(node_23, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
										DropdownMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root_5();
												var node_24 = $.first_child(fragment_16);

												$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
													DropdownMenu_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_17 = root_2();
															var node_25 = $.first_child(fragment_17);

															IconPlaceholder(node_25, {
																lucide: 'BadgeCheckIcon',
																tabler: 'IconRosetteDiscountCheck',
																hugeicons: 'CheckmarkBadgeIcon',
																phosphor: 'CheckCircleIcon',
																remixicon: 'RiCheckboxCircleLine'
															});

															$.next();
															$.append($$anchor, fragment_17);
														},
														$$slots: { default: true }
													});
												});

												var node_26 = $.sibling(node_24, 2);

												$.component(node_26, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
													DropdownMenu_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root_3();
															var node_27 = $.first_child(fragment_18);

															IconPlaceholder(node_27, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															$.next();
															$.append($$anchor, fragment_18);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_26, 2);

												$.component(node_28, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
													DropdownMenu_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_19 = root_4();
															var node_29 = $.first_child(fragment_19);

															IconPlaceholder(node_29, {
																lucide: 'BellIcon',
																tabler: 'IconBell',
																hugeicons: 'NotificationIcon',
																phosphor: 'BellIcon',
																remixicon: 'RiNotificationLine'
															});

															$.next();
															$.append($$anchor, fragment_19);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									var node_30 = $.sibling(node_23, 2);

									$.component(node_30, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
										DropdownMenu_Separator_1($$anchor, {});
									});

									var node_31 = $.sibling(node_30, 2);

									$.component(node_31, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
										DropdownMenu_Item_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_20 = root_6();
												var node_32 = $.first_child(fragment_20);

												IconPlaceholder(node_32, {
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$.next();
												$.append($$anchor, fragment_20);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}