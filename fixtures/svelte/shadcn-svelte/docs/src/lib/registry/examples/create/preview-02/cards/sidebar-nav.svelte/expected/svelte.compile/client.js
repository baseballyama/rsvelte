import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

var root = $.from_html(`<!> Dashboard`, 1);
var root_1 = $.from_html(`<!> Transactions`, 1);
var root_2 = $.from_html(`<!> Investments`, 1);
var root_3 = $.from_html(`<!> Accounts`, 1);
var root_4 = $.from_html(`<!> Spending`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!> Goals`, 1);
var root_8 = $.from_html(`<!> Budget`, 1);
var root_9 = $.from_html(`<!> Reports`, 1);
var root_10 = $.from_html(`<!> Documents`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <!> <!>`, 1);
var root_13 = $.from_html(`<!> Profile`, 1);
var root_14 = $.from_html(`<!> Billing`, 1);
var root_15 = $.from_html(`<!> Notifications`, 1);
var root_16 = $.from_html(`<!> Security`, 1);
var root_17 = $.from_html(`<!> Appearance`, 1);
var root_18 = $.from_html(`<!> Help Center`, 1);
var root_19 = $.from_html(`<!> Contact Us`, 1);
var root_20 = $.from_html(`<!> Documentation`, 1);
var root_21 = $.from_html(`<!> Status`, 1);
var root_22 = $.from_html(`<div class="grid grid-cols-2 items-start gap-6"><!> <!></div>`);

export default function Sidebar_nav($$anchor) {
	var div = root_22();
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'overflow-hidden py-0',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
					Sidebar_Provider($$anchor, {
						class: 'min-h-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
								Sidebar_Root($$anchor, {
									collapsible: 'none',
									class: 'w-full bg-transparent',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
											Sidebar_Content($$anchor, {
												class: 'gap-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_12();
													var node_4 = $.first_child(fragment_3);

													$.component(node_4, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
														Sidebar_Group($$anchor, {
															class: 'pb-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root_6();
																var node_5 = $.first_child(fragment_4);

																$.component(node_5, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
																	Sidebar_GroupLabel($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text('Overview');

																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_6 = $.sibling(node_5, 2);

																$.component(node_6, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
																	Sidebar_GroupContent($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_5 = $.comment();
																			var node_7 = $.first_child(fragment_5);

																			$.component(node_7, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																				Sidebar_Menu($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_6 = root_5();
																						var node_8 = $.first_child(fragment_6);

																						$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																							Sidebar_MenuItem($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_7 = $.comment();
																									var node_9 = $.first_child(fragment_7);

																									$.component(node_9, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																										Sidebar_MenuButton($$anchor, {
																											isActive: true,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_8 = root();
																												var node_10 = $.first_child(fragment_8);

																												IconPlaceholder(node_10, {
																													lucide: 'LayoutDashboardIcon',
																													tabler: 'IconLayoutDashboard',
																													hugeicons: 'DashboardSquare01Icon',
																													phosphor: 'SquaresFourIcon',
																													remixicon: 'RiDashboardLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_8);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_7);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_11 = $.sibling(node_8, 2);

																						$.component(node_11, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																							Sidebar_MenuItem_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_9 = $.comment();
																									var node_12 = $.first_child(fragment_9);

																									$.component(node_12, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																										Sidebar_MenuButton_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_10 = root_1();
																												var node_13 = $.first_child(fragment_10);

																												IconPlaceholder(node_13, {
																													lucide: 'ArrowLeftRightIcon',
																													tabler: 'IconArrowsLeftRight',
																													hugeicons: 'ArrowDataTransferHorizontalIcon',
																													phosphor: 'ArrowsLeftRightIcon',
																													remixicon: 'RiArrowLeftRightLine'
																												});

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

																						var node_14 = $.sibling(node_11, 2);

																						$.component(node_14, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_2) => {
																							Sidebar_MenuItem_2($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_11 = $.comment();
																									var node_15 = $.first_child(fragment_11);

																									$.component(node_15, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_2) => {
																										Sidebar_MenuButton_2($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_12 = root_2();
																												var node_16 = $.first_child(fragment_12);

																												IconPlaceholder(node_16, {
																													lucide: 'TrendingUpIcon',
																													tabler: 'IconTrendingUp',
																													hugeicons: 'AnalyticsUpIcon',
																													phosphor: 'TrendUpIcon',
																													remixicon: 'RiLineChartLine'
																												});

																												$.next();
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

																						var node_17 = $.sibling(node_14, 2);

																						$.component(node_17, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_3) => {
																							Sidebar_MenuItem_3($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_13 = $.comment();
																									var node_18 = $.first_child(fragment_13);

																									$.component(node_18, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_3) => {
																										Sidebar_MenuButton_3($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_14 = root_3();
																												var node_19 = $.first_child(fragment_14);

																												IconPlaceholder(node_19, {
																													lucide: 'Building2Icon',
																													tabler: 'IconBuildingBank',
																													hugeicons: 'BankIcon',
																													phosphor: 'BankIcon',
																													remixicon: 'RiBankLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_14);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_13);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_20 = $.sibling(node_17, 2);

																						$.component(node_20, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_4) => {
																							Sidebar_MenuItem_4($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_15 = $.comment();
																									var node_21 = $.first_child(fragment_15);

																									$.component(node_21, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_4) => {
																										Sidebar_MenuButton_4($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_16 = root_4();
																												var node_22 = $.first_child(fragment_16);

																												IconPlaceholder(node_22, {
																													lucide: 'PieChartIcon',
																													tabler: 'IconChartPie',
																													hugeicons: 'PieChartIcon',
																													phosphor: 'ChartPieIcon',
																													remixicon: 'RiPieChartLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_16);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_15);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_6);
																					},
																					$$slots: { default: true }
																				});
																			});

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

													var node_23 = $.sibling(node_4, 2);

													$.component(node_23, () => Sidebar.Separator, ($$anchor, Sidebar_Separator) => {
														Sidebar_Separator($$anchor, { class: 'w-auto!' });
													});

													var node_24 = $.sibling(node_23, 2);

													$.component(node_24, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
														Sidebar_Group_1($$anchor, {
															class: 'pt-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root_6();
																var node_25 = $.first_child(fragment_17);

																$.component(node_25, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_1) => {
																	Sidebar_GroupLabel_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Planning');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_26 = $.sibling(node_25, 2);

																$.component(node_26, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_1) => {
																	Sidebar_GroupContent_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = $.comment();
																			var node_27 = $.first_child(fragment_18);

																			$.component(node_27, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
																				Sidebar_Menu_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_19 = root_11();
																						var node_28 = $.first_child(fragment_19);

																						$.component(node_28, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_5) => {
																							Sidebar_MenuItem_5($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_20 = $.comment();
																									var node_29 = $.first_child(fragment_20);

																									$.component(node_29, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_5) => {
																										Sidebar_MenuButton_5($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_21 = root_7();
																												var node_30 = $.first_child(fragment_21);

																												IconPlaceholder(node_30, {
																													lucide: 'TargetIcon',
																													tabler: 'IconTarget',
																													hugeicons: 'Target02Icon',
																													phosphor: 'TargetIcon',
																													remixicon: 'RiFocus3Line'
																												});

																												$.next();
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

																						var node_31 = $.sibling(node_28, 2);

																						$.component(node_31, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_6) => {
																							Sidebar_MenuItem_6($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_22 = $.comment();
																									var node_32 = $.first_child(fragment_22);

																									$.component(node_32, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_6) => {
																										Sidebar_MenuButton_6($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_23 = root_8();
																												var node_33 = $.first_child(fragment_23);

																												IconPlaceholder(node_33, {
																													lucide: 'WalletIcon',
																													tabler: 'IconWallet',
																													hugeicons: 'Wallet01Icon',
																													phosphor: 'WalletIcon',
																													remixicon: 'RiWalletLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_23);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_22);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_34 = $.sibling(node_31, 2);

																						$.component(node_34, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_7) => {
																							Sidebar_MenuItem_7($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_24 = $.comment();
																									var node_35 = $.first_child(fragment_24);

																									$.component(node_35, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_7) => {
																										Sidebar_MenuButton_7($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_25 = root_9();
																												var node_36 = $.first_child(fragment_25);

																												IconPlaceholder(node_36, {
																													lucide: 'FileBarChartIcon',
																													tabler: 'IconReportAnalytics',
																													hugeicons: 'ChartBarLineIcon',
																													phosphor: 'ChartBarIcon',
																													remixicon: 'RiBarChartLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_25);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_24);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_37 = $.sibling(node_34, 2);

																						$.component(node_37, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_8) => {
																							Sidebar_MenuItem_8($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_26 = $.comment();
																									var node_38 = $.first_child(fragment_26);

																									$.component(node_38, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_8) => {
																										Sidebar_MenuButton_8($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_27 = root_10();
																												var node_39 = $.first_child(fragment_27);

																												IconPlaceholder(node_39, {
																													lucide: 'FileTextIcon',
																													tabler: 'IconFileText',
																													hugeicons: 'File02Icon',
																													phosphor: 'FileTextIcon',
																													remixicon: 'RiFileTextLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_27);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_26);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_19);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

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
			},
			$$slots: { default: true }
		});
	});

	var node_40 = $.sibling(node, 2);

	$.component(node_40, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			class: 'overflow-hidden py-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_28 = $.comment();
				var node_41 = $.first_child(fragment_28);

				$.component(node_41, () => Sidebar.Provider, ($$anchor, Sidebar_Provider_1) => {
					Sidebar_Provider_1($$anchor, {
						class: 'min-h-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_29 = $.comment();
							var node_42 = $.first_child(fragment_29);

							$.component(node_42, () => Sidebar.Root, ($$anchor, Sidebar_Root_1) => {
								Sidebar_Root_1($$anchor, {
									collapsible: 'none',
									class: 'w-full bg-transparent',
									children: ($$anchor, $$slotProps) => {
										var fragment_30 = $.comment();
										var node_43 = $.first_child(fragment_30);

										$.component(node_43, () => Sidebar.Content, ($$anchor, Sidebar_Content_1) => {
											Sidebar_Content_1($$anchor, {
												class: 'gap-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_31 = root_12();
													var node_44 = $.first_child(fragment_31);

													$.component(node_44, () => Sidebar.Group, ($$anchor, Sidebar_Group_2) => {
														Sidebar_Group_2($$anchor, {
															class: 'pb-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_32 = root_6();
																var node_45 = $.first_child(fragment_32);

																$.component(node_45, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_2) => {
																	Sidebar_GroupLabel_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Account');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_46 = $.sibling(node_45, 2);

																$.component(node_46, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_2) => {
																	Sidebar_GroupContent_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_33 = $.comment();
																			var node_47 = $.first_child(fragment_33);

																			$.component(node_47, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_2) => {
																				Sidebar_Menu_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_34 = root_5();
																						var node_48 = $.first_child(fragment_34);

																						$.component(node_48, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_9) => {
																							Sidebar_MenuItem_9($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_35 = $.comment();
																									var node_49 = $.first_child(fragment_35);

																									$.component(node_49, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_9) => {
																										Sidebar_MenuButton_9($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_36 = root_13();
																												var node_50 = $.first_child(fragment_36);

																												IconPlaceholder(node_50, {
																													lucide: 'UserIcon',
																													tabler: 'IconUser',
																													hugeicons: 'UserIcon',
																													phosphor: 'UserIcon',
																													remixicon: 'RiUserLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_36);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_35);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_51 = $.sibling(node_48, 2);

																						$.component(node_51, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_10) => {
																							Sidebar_MenuItem_10($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_37 = $.comment();
																									var node_52 = $.first_child(fragment_37);

																									$.component(node_52, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_10) => {
																										Sidebar_MenuButton_10($$anchor, {
																											isActive: true,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_38 = root_14();
																												var node_53 = $.first_child(fragment_38);

																												IconPlaceholder(node_53, {
																													lucide: 'CreditCardIcon',
																													tabler: 'IconCreditCard',
																													hugeicons: 'CreditCardIcon',
																													phosphor: 'CreditCardIcon',
																													remixicon: 'RiBankCardLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_38);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_37);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_54 = $.sibling(node_51, 2);

																						$.component(node_54, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_11) => {
																							Sidebar_MenuItem_11($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_39 = $.comment();
																									var node_55 = $.first_child(fragment_39);

																									$.component(node_55, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_11) => {
																										Sidebar_MenuButton_11($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_40 = root_15();
																												var node_56 = $.first_child(fragment_40);

																												IconPlaceholder(node_56, {
																													lucide: 'BellIcon',
																													tabler: 'IconBell',
																													hugeicons: 'Notification03Icon',
																													phosphor: 'BellIcon',
																													remixicon: 'RiBellLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_40);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_39);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_57 = $.sibling(node_54, 2);

																						$.component(node_57, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_12) => {
																							Sidebar_MenuItem_12($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_41 = $.comment();
																									var node_58 = $.first_child(fragment_41);

																									$.component(node_58, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_12) => {
																										Sidebar_MenuButton_12($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_42 = root_16();
																												var node_59 = $.first_child(fragment_42);

																												IconPlaceholder(node_59, {
																													lucide: 'ShieldIcon',
																													tabler: 'IconShield',
																													hugeicons: 'ShieldIcon',
																													phosphor: 'ShieldIcon',
																													remixicon: 'RiShieldLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_42);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_41);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_60 = $.sibling(node_57, 2);

																						$.component(node_60, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_13) => {
																							Sidebar_MenuItem_13($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_43 = $.comment();
																									var node_61 = $.first_child(fragment_43);

																									$.component(node_61, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_13) => {
																										Sidebar_MenuButton_13($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_44 = root_17();
																												var node_62 = $.first_child(fragment_44);

																												IconPlaceholder(node_62, {
																													lucide: 'PaintbrushIcon',
																													tabler: 'IconPalette',
																													hugeicons: 'PaintBoardIcon',
																													phosphor: 'PaletteIcon',
																													remixicon: 'RiPaletteLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_44);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_43);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_34);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_33);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_32);
															},
															$$slots: { default: true }
														});
													});

													var node_63 = $.sibling(node_44, 2);

													$.component(node_63, () => Sidebar.Separator, ($$anchor, Sidebar_Separator_1) => {
														Sidebar_Separator_1($$anchor, { class: 'w-auto!' });
													});

													var node_64 = $.sibling(node_63, 2);

													$.component(node_64, () => Sidebar.Group, ($$anchor, Sidebar_Group_3) => {
														Sidebar_Group_3($$anchor, {
															class: 'pt-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_45 = root_6();
																var node_65 = $.first_child(fragment_45);

																$.component(node_65, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_3) => {
																	Sidebar_GroupLabel_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Support');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_66 = $.sibling(node_65, 2);

																$.component(node_66, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_3) => {
																	Sidebar_GroupContent_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_46 = $.comment();
																			var node_67 = $.first_child(fragment_46);

																			$.component(node_67, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_3) => {
																				Sidebar_Menu_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_47 = root_11();
																						var node_68 = $.first_child(fragment_47);

																						$.component(node_68, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_14) => {
																							Sidebar_MenuItem_14($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_48 = $.comment();
																									var node_69 = $.first_child(fragment_48);

																									$.component(node_69, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_14) => {
																										Sidebar_MenuButton_14($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_49 = root_18();
																												var node_70 = $.first_child(fragment_49);

																												IconPlaceholder(node_70, {
																													lucide: 'CircleHelpIcon',
																													tabler: 'IconHelp',
																													hugeicons: 'HelpCircleIcon',
																													phosphor: 'QuestionIcon',
																													remixicon: 'RiQuestionLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_49);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_48);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_71 = $.sibling(node_68, 2);

																						$.component(node_71, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_15) => {
																							Sidebar_MenuItem_15($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_50 = $.comment();
																									var node_72 = $.first_child(fragment_50);

																									$.component(node_72, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_15) => {
																										Sidebar_MenuButton_15($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_51 = root_19();
																												var node_73 = $.first_child(fragment_51);

																												IconPlaceholder(node_73, {
																													lucide: 'MessageSquareIcon',
																													tabler: 'IconMessage',
																													hugeicons: 'Message01Icon',
																													phosphor: 'ChatIcon',
																													remixicon: 'RiChat1Line'
																												});

																												$.next();
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

																						var node_74 = $.sibling(node_71, 2);

																						$.component(node_74, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_16) => {
																							Sidebar_MenuItem_16($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_52 = $.comment();
																									var node_75 = $.first_child(fragment_52);

																									$.component(node_75, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_16) => {
																										Sidebar_MenuButton_16($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_53 = root_20();
																												var node_76 = $.first_child(fragment_53);

																												IconPlaceholder(node_76, {
																													lucide: 'BookOpenIcon',
																													tabler: 'IconBook',
																													hugeicons: 'BookOpen02Icon',
																													phosphor: 'BookOpenIcon',
																													remixicon: 'RiBookOpenLine'
																												});

																												$.next();
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

																						var node_77 = $.sibling(node_74, 2);

																						$.component(node_77, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_17) => {
																							Sidebar_MenuItem_17($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_54 = $.comment();
																									var node_78 = $.first_child(fragment_54);

																									$.component(node_78, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_17) => {
																										Sidebar_MenuButton_17($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_55 = root_21();
																												var node_79 = $.first_child(fragment_55);

																												IconPlaceholder(node_79, {
																													lucide: 'ActivityIcon',
																													tabler: 'IconActivity',
																													hugeicons: 'ActivityIcon',
																													phosphor: 'PulseIcon',
																													remixicon: 'RiPulseLine'
																												});

																												$.next();
																												$.append($$anchor, fragment_55);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_54);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_47);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_46);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_45);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_31);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_30);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_29);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_28);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}