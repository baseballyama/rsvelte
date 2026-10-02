import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> New File <!>`, 1);
var root_1 = $.from_html(`<!> New Folder <!>`, 1);
var root_2 = $.from_html(`<!> Open Recent`, 1);
var root_3 = $.from_html(`<!> Project Alpha`, 1);
var root_4 = $.from_html(`<!> Project Beta`, 1);
var root_5 = $.from_html(`<!> More Projects`, 1);
var root_6 = $.from_html(`<!> Project Gamma`, 1);
var root_7 = $.from_html(`<!> Project Delta`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_10 = $.from_html(`<!> Browse...`, 1);
var root_11 = $.from_html(`<!> <!> <!>`, 1);
var root_12 = $.from_html(`<!> Save <!>`, 1);
var root_13 = $.from_html(`<!> Export <!>`, 1);
var root_14 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_15 = $.from_html(`<!> Show Sidebar`, 1);
var root_16 = $.from_html(`<!> Show Status Bar`, 1);
var root_17 = $.from_html(`<!> Theme`, 1);
var root_18 = $.from_html(`<!> Light`, 1);
var root_19 = $.from_html(`<!> Dark`, 1);
var root_20 = $.from_html(`<!> System`, 1);
var root_21 = $.from_html(`<!> Profile <!>`, 1);
var root_22 = $.from_html(`<!> Billing`, 1);
var root_23 = $.from_html(`<!> Settings`, 1);
var root_24 = $.from_html(`<!> Keyboard Shortcuts`, 1);
var root_25 = $.from_html(`<!> Language`, 1);
var root_26 = $.from_html(`<!> Notifications`, 1);
var root_27 = $.from_html(`<!> Push Notifications`, 1);
var root_28 = $.from_html(`<!> Email Notifications`, 1);
var root_29 = $.from_html(`<!> Privacy & Security`, 1);
var root_30 = $.from_html(`<!> Help & Support`, 1);
var root_31 = $.from_html(`<!> Documentation`, 1);
var root_32 = $.from_html(`<!> Sign Out <!>`, 1);
var root_33 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_menu_complex($$anchor) {
	let notifications = $.state($.proxy({ email: true, sms: false, push: true }));
	let theme = $.state("light");

	Example($$anchor, {
		title: 'Complex',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_8();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Complex Menu');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								class: 'style-vega:w-56 style-nova:w-48 style-lyra:w-48 style-maia:w-56 style-mira:w-48',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_33();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_14();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
													DropdownMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('File');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_6 = $.first_child(fragment_6);

															IconPlaceholder(node_6, {
																lucide: 'FileIcon',
																tabler: 'IconFile',
																hugeicons: 'FileIcon',
																phosphor: 'FileIcon',
																remixicon: 'RiFileLine'
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
																DropdownMenu_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘N');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_5, 2);

												$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_9 = $.first_child(fragment_7);

															IconPlaceholder(node_9, {
																lucide: 'FolderIcon',
																tabler: 'IconFolder',
																hugeicons: 'FolderIcon',
																phosphor: 'FolderIcon',
																remixicon: 'RiFolderLine'
															});

															var node_10 = $.sibling(node_9, 2);

															$.component(node_10, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_1) => {
																DropdownMenu_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⇧⌘N');

																		$.append($$anchor, text_3);
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

												$.component(node_11, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
													DropdownMenu_Sub($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_8();
															var node_12 = $.first_child(fragment_8);

															$.component(node_12, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																DropdownMenu_SubTrigger($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_2();
																		var node_13 = $.first_child(fragment_9);

																		IconPlaceholder(node_13, {
																			lucide: 'FolderOpenIcon',
																			tabler: 'IconFolderOpen',
																			hugeicons: 'FolderOpenIcon',
																			phosphor: 'FolderOpenIcon',
																			remixicon: 'RiFolderOpenLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_12, 2);

															$.component(node_14, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
																DropdownMenu_Portal($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_15 = $.first_child(fragment_10);

																		$.component(node_15, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																			DropdownMenu_SubContent($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_11();
																					var node_16 = $.first_child(fragment_11);

																					$.component(node_16, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																						DropdownMenu_Group_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root_9();
																								var node_17 = $.first_child(fragment_12);

																								$.component(node_17, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																									DropdownMenu_Label_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('Recent Projects');

																											$.append($$anchor, text_4);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_18 = $.sibling(node_17, 2);

																								$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																									DropdownMenu_Item_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = root_3();
																											var node_19 = $.first_child(fragment_13);

																											IconPlaceholder(node_19, {
																												lucide: 'FileCodeIcon',
																												tabler: 'IconFileCode',
																												hugeicons: 'CodeIcon',
																												phosphor: 'CodeIcon',
																												remixicon: 'RiFileCodeLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_20 = $.sibling(node_18, 2);

																								$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																									DropdownMenu_Item_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_14 = root_4();
																											var node_21 = $.first_child(fragment_14);

																											IconPlaceholder(node_21, {
																												lucide: 'FileCodeIcon',
																												tabler: 'IconFileCode',
																												hugeicons: 'CodeIcon',
																												phosphor: 'CodeIcon',
																												remixicon: 'RiFileCodeLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_14);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_20, 2);

																								$.component(node_22, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_1) => {
																									DropdownMenu_Sub_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_15 = root_8();
																											var node_23 = $.first_child(fragment_15);

																											$.component(node_23, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_1) => {
																												DropdownMenu_SubTrigger_1($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_16 = root_5();
																														var node_24 = $.first_child(fragment_16);

																														IconPlaceholder(node_24, {
																															lucide: 'MoreHorizontalIcon',
																															tabler: 'IconDots',
																															hugeicons: 'MoreHorizontalCircle01Icon',
																															phosphor: 'DotsThreeOutlineIcon',
																															remixicon: 'RiMoreLine'
																														});

																														$.next();
																														$.append($$anchor, fragment_16);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_25 = $.sibling(node_23, 2);

																											$.component(node_25, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_1) => {
																												DropdownMenu_Portal_1($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_17 = $.comment();
																														var node_26 = $.first_child(fragment_17);

																														$.component(node_26, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_1) => {
																															DropdownMenu_SubContent_1($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_18 = root_8();
																																	var node_27 = $.first_child(fragment_18);

																																	$.component(node_27, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																																		DropdownMenu_Item_4($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_19 = root_6();
																																				var node_28 = $.first_child(fragment_19);

																																				IconPlaceholder(node_28, {
																																					lucide: 'FileCodeIcon',
																																					tabler: 'IconFileCode',
																																					hugeicons: 'CodeIcon',
																																					phosphor: 'FileCodeIcon',
																																					remixicon: 'RiFileCodeLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_19);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_29 = $.sibling(node_27, 2);

																																	$.component(node_29, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																																		DropdownMenu_Item_5($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_20 = root_7();
																																				var node_30 = $.first_child(fragment_20);

																																				IconPlaceholder(node_30, {
																																					lucide: 'FileCodeIcon',
																																					tabler: 'IconFileCode',
																																					hugeicons: 'CodeIcon',
																																					phosphor: 'FileCodeIcon',
																																					remixicon: 'RiFileCodeLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_20);
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

																											$.append($$anchor, fragment_15);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_31 = $.sibling(node_16, 2);

																					$.component(node_31, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																						DropdownMenu_Separator($$anchor, {});
																					});

																					var node_32 = $.sibling(node_31, 2);

																					$.component(node_32, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																						DropdownMenu_Group_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_21 = $.comment();
																								var node_33 = $.first_child(fragment_21);

																								$.component(node_33, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																									DropdownMenu_Item_6($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_22 = root_10();
																											var node_34 = $.first_child(fragment_22);

																											IconPlaceholder(node_34, {
																												lucide: 'FolderSearchIcon',
																												tabler: 'IconFolderSearch',
																												hugeicons: 'SearchIcon',
																												phosphor: 'MagnifyingGlassIcon',
																												remixicon: 'RiSearchLine'
																											});

																											$.next();
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

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_35 = $.sibling(node_11, 2);

												$.component(node_35, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
													DropdownMenu_Separator_1($$anchor, {});
												});

												var node_36 = $.sibling(node_35, 2);

												$.component(node_36, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
													DropdownMenu_Item_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_23 = root_12();
															var node_37 = $.first_child(fragment_23);

															IconPlaceholder(node_37, {
																lucide: 'SaveIcon',
																tabler: 'IconDeviceFloppy',
																hugeicons: 'FloppyDiskIcon',
																phosphor: 'FloppyDiskIcon',
																remixicon: 'RiSaveLine'
															});

															var node_38 = $.sibling(node_37, 2);

															$.component(node_38, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_2) => {
																DropdownMenu_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('⌘S');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_23);
														},
														$$slots: { default: true }
													});
												});

												var node_39 = $.sibling(node_36, 2);

												$.component(node_39, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
													DropdownMenu_Item_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_24 = root_13();
															var node_40 = $.first_child(fragment_24);

															IconPlaceholder(node_40, {
																lucide: 'DownloadIcon',
																tabler: 'IconDownload',
																hugeicons: 'DownloadIcon',
																phosphor: 'DownloadIcon',
																remixicon: 'RiDownloadLine'
															});

															var node_41 = $.sibling(node_40, 2);

															$.component(node_41, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_3) => {
																DropdownMenu_Shortcut_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('⇧⌘E');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_24);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_42 = $.sibling(node_3, 2);

									$.component(node_42, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
										DropdownMenu_Separator_2($$anchor, {});
									});

									var node_43 = $.sibling(node_42, 2);

									$.component(node_43, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
										DropdownMenu_Group_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_25 = root_9();
												var node_44 = $.first_child(fragment_25);

												$.component(node_44, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_2) => {
													DropdownMenu_Label_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('View');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_45 = $.sibling(node_44, 2);

												$.component(node_45, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
													DropdownMenu_CheckboxItem($$anchor, {
														get checked() {
															return $.get(notifications).email;
														},
														onCheckedChange: (checked) => $.set(notifications, { ...$.get(notifications), email: checked === true }, true),
														children: ($$anchor, $$slotProps) => {
															var fragment_26 = root_15();
															var node_46 = $.first_child(fragment_26);

															IconPlaceholder(node_46, {
																lucide: 'EyeIcon',
																tabler: 'IconEye',
																hugeicons: 'EyeIcon',
																phosphor: 'EyeIcon',
																remixicon: 'RiEyeLine'
															});

															$.next();
															$.append($$anchor, fragment_26);
														},
														$$slots: { default: true }
													});
												});

												var node_47 = $.sibling(node_45, 2);

												$.component(node_47, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_1) => {
													DropdownMenu_CheckboxItem_1($$anchor, {
														get checked() {
															return $.get(notifications).sms;
														},
														onCheckedChange: (checked) => $.set(notifications, { ...$.get(notifications), sms: checked === true }, true),
														children: ($$anchor, $$slotProps) => {
															var fragment_27 = root_16();
															var node_48 = $.first_child(fragment_27);

															IconPlaceholder(node_48, {
																lucide: 'LayoutIcon',
																tabler: 'IconLayout',
																hugeicons: 'LayoutIcon',
																phosphor: 'LayoutIcon',
																remixicon: 'RiLayoutLine'
															});

															$.next();
															$.append($$anchor, fragment_27);
														},
														$$slots: { default: true }
													});
												});

												var node_49 = $.sibling(node_47, 2);

												$.component(node_49, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_2) => {
													DropdownMenu_Sub_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_28 = root_8();
															var node_50 = $.first_child(fragment_28);

															$.component(node_50, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_2) => {
																DropdownMenu_SubTrigger_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_29 = root_17();
																		var node_51 = $.first_child(fragment_29);

																		IconPlaceholder(node_51, {
																			lucide: 'PaletteIcon',
																			tabler: 'IconPalette',
																			hugeicons: 'PaintBoardIcon',
																			phosphor: 'PaletteIcon',
																			remixicon: 'RiPaletteLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_29);
																	},
																	$$slots: { default: true }
																});
															});

															var node_52 = $.sibling(node_50, 2);

															$.component(node_52, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_2) => {
																DropdownMenu_Portal_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_30 = $.comment();
																		var node_53 = $.first_child(fragment_30);

																		$.component(node_53, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_2) => {
																			DropdownMenu_SubContent_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_31 = $.comment();
																					var node_54 = $.first_child(fragment_31);

																					$.component(node_54, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_4) => {
																						DropdownMenu_Group_4($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_32 = root_8();
																								var node_55 = $.first_child(fragment_32);

																								$.component(node_55, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_3) => {
																									DropdownMenu_Label_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text('Appearance');

																											$.append($$anchor, text_8);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_56 = $.sibling(node_55, 2);

																								$.component(node_56, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																									DropdownMenu_RadioGroup($$anchor, {
																										get value() {
																											return $.get(theme);
																										},

																										set value($$value) {
																											$.set(theme, $$value, true);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_33 = root_11();
																											var node_57 = $.first_child(fragment_33);

																											$.component(node_57, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																												DropdownMenu_RadioItem($$anchor, {
																													value: 'light',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_34 = root_18();
																														var node_58 = $.first_child(fragment_34);

																														IconPlaceholder(node_58, {
																															lucide: 'SunIcon',
																															tabler: 'IconSun',
																															hugeicons: 'SunIcon',
																															phosphor: 'SunIcon',
																															remixicon: 'RiSunLine'
																														});

																														$.next();
																														$.append($$anchor, fragment_34);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_59 = $.sibling(node_57, 2);

																											$.component(node_59, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																												DropdownMenu_RadioItem_1($$anchor, {
																													value: 'dark',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_35 = root_19();
																														var node_60 = $.first_child(fragment_35);

																														IconPlaceholder(node_60, {
																															lucide: 'MoonIcon',
																															tabler: 'IconMoon',
																															hugeicons: 'MoonIcon',
																															phosphor: 'MoonIcon',
																															remixicon: 'RiMoonLine'
																														});

																														$.next();
																														$.append($$anchor, fragment_35);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_61 = $.sibling(node_59, 2);

																											$.component(node_61, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																												DropdownMenu_RadioItem_2($$anchor, {
																													value: 'system',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_36 = root_20();
																														var node_62 = $.first_child(fragment_36);

																														IconPlaceholder(node_62, {
																															lucide: 'MonitorIcon',
																															tabler: 'IconDeviceDesktop',
																															hugeicons: 'ComputerIcon',
																															phosphor: 'MonitorIcon',
																															remixicon: 'RiComputerLine'
																														});

																														$.next();
																														$.append($$anchor, fragment_36);
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

															$.append($$anchor, fragment_28);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_25);
											},
											$$slots: { default: true }
										});
									});

									var node_63 = $.sibling(node_43, 2);

									$.component(node_63, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
										DropdownMenu_Separator_3($$anchor, {});
									});

									var node_64 = $.sibling(node_63, 2);

									$.component(node_64, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_5) => {
										DropdownMenu_Group_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_37 = root_9();
												var node_65 = $.first_child(fragment_37);

												$.component(node_65, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_4) => {
													DropdownMenu_Label_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Account');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_66 = $.sibling(node_65, 2);

												$.component(node_66, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
													DropdownMenu_Item_9($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_38 = root_21();
															var node_67 = $.first_child(fragment_38);

															IconPlaceholder(node_67, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															var node_68 = $.sibling(node_67, 2);

															$.component(node_68, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_4) => {
																DropdownMenu_Shortcut_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('⇧⌘P');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_38);
														},
														$$slots: { default: true }
													});
												});

												var node_69 = $.sibling(node_66, 2);

												$.component(node_69, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
													DropdownMenu_Item_10($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_39 = root_22();
															var node_70 = $.first_child(fragment_39);

															IconPlaceholder(node_70, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															$.next();
															$.append($$anchor, fragment_39);
														},
														$$slots: { default: true }
													});
												});

												var node_71 = $.sibling(node_69, 2);

												$.component(node_71, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_3) => {
													DropdownMenu_Sub_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_40 = root_8();
															var node_72 = $.first_child(fragment_40);

															$.component(node_72, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_3) => {
																DropdownMenu_SubTrigger_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_41 = root_23();
																		var node_73 = $.first_child(fragment_41);

																		IconPlaceholder(node_73, {
																			lucide: 'SettingsIcon',
																			tabler: 'IconSettings',
																			hugeicons: 'SettingsIcon',
																			phosphor: 'GearIcon',
																			remixicon: 'RiSettingsLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_41);
																	},
																	$$slots: { default: true }
																});
															});

															var node_74 = $.sibling(node_72, 2);

															$.component(node_74, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_3) => {
																DropdownMenu_Portal_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_42 = $.comment();
																		var node_75 = $.first_child(fragment_42);

																		$.component(node_75, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_3) => {
																			DropdownMenu_SubContent_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_43 = root_11();
																					var node_76 = $.first_child(fragment_43);

																					$.component(node_76, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_6) => {
																						DropdownMenu_Group_6($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_44 = root_9();
																								var node_77 = $.first_child(fragment_44);

																								$.component(node_77, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_5) => {
																									DropdownMenu_Label_5($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_11 = $.text('Preferences');

																											$.append($$anchor, text_11);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_78 = $.sibling(node_77, 2);

																								$.component(node_78, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
																									DropdownMenu_Item_11($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_45 = root_24();
																											var node_79 = $.first_child(fragment_45);

																											IconPlaceholder(node_79, {
																												lucide: 'KeyboardIcon',
																												tabler: 'IconKeyboard',
																												hugeicons: 'KeyboardIcon',
																												phosphor: 'KeyboardIcon',
																												remixicon: 'RiKeyboardLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_45);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_80 = $.sibling(node_78, 2);

																								$.component(node_80, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_12) => {
																									DropdownMenu_Item_12($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_46 = root_25();
																											var node_81 = $.first_child(fragment_46);

																											IconPlaceholder(node_81, {
																												lucide: 'LanguagesIcon',
																												tabler: 'IconLanguage',
																												hugeicons: 'LanguageCircleIcon',
																												phosphor: 'TranslateIcon',
																												remixicon: 'RiTranslate'
																											});

																											$.next();
																											$.append($$anchor, fragment_46);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_82 = $.sibling(node_80, 2);

																								$.component(node_82, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_4) => {
																									DropdownMenu_Sub_4($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_47 = root_8();
																											var node_83 = $.first_child(fragment_47);

																											$.component(node_83, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_4) => {
																												DropdownMenu_SubTrigger_4($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_48 = root_26();
																														var node_84 = $.first_child(fragment_48);

																														IconPlaceholder(node_84, {
																															lucide: 'BellIcon',
																															tabler: 'IconBell',
																															hugeicons: 'NotificationIcon',
																															phosphor: 'BellIcon',
																															remixicon: 'RiNotificationLine'
																														});

																														$.next();
																														$.append($$anchor, fragment_48);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_85 = $.sibling(node_83, 2);

																											$.component(node_85, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_4) => {
																												DropdownMenu_Portal_4($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_49 = $.comment();
																														var node_86 = $.first_child(fragment_49);

																														$.component(node_86, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_4) => {
																															DropdownMenu_SubContent_4($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_50 = $.comment();
																																	var node_87 = $.first_child(fragment_50);

																																	$.component(node_87, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_7) => {
																																		DropdownMenu_Group_7($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_51 = root_11();
																																				var node_88 = $.first_child(fragment_51);

																																				$.component(node_88, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_6) => {
																																					DropdownMenu_Label_6($$anchor, {
																																						children: ($$anchor, $$slotProps) => {
																																							$.next();

																																							var text_12 = $.text('Notification Types');

																																							$.append($$anchor, text_12);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				var node_89 = $.sibling(node_88, 2);

																																				$.component(node_89, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_2) => {
																																					DropdownMenu_CheckboxItem_2($$anchor, {
																																						get checked() {
																																							return $.get(notifications).push;
																																						},
																																						onCheckedChange: (checked) => $.set(notifications, { ...$.get(notifications), push: checked === true }, true),
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_52 = root_27();
																																							var node_90 = $.first_child(fragment_52);

																																							IconPlaceholder(node_90, {
																																								lucide: 'BellIcon',
																																								tabler: 'IconBell',
																																								hugeicons: 'NotificationIcon',
																																								phosphor: 'BellIcon',
																																								remixicon: 'RiNotificationLine'
																																							});

																																							$.next();
																																							$.append($$anchor, fragment_52);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				var node_91 = $.sibling(node_89, 2);

																																				$.component(node_91, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_3) => {
																																					DropdownMenu_CheckboxItem_3($$anchor, {
																																						get checked() {
																																							return $.get(notifications).email;
																																						},
																																						onCheckedChange: (checked) => $.set(notifications, { ...$.get(notifications), email: checked === true }, true),
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_53 = root_28();
																																							var node_92 = $.first_child(fragment_53);

																																							IconPlaceholder(node_92, {
																																								lucide: 'MailIcon',
																																								tabler: 'IconMail',
																																								hugeicons: 'MailIcon',
																																								phosphor: 'EnvelopeIcon',
																																								remixicon: 'RiMailLine'
																																							});

																																							$.next();
																																							$.append($$anchor, fragment_53);
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
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_47);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_44);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_93 = $.sibling(node_76, 2);

																					$.component(node_93, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_4) => {
																						DropdownMenu_Separator_4($$anchor, {});
																					});

																					var node_94 = $.sibling(node_93, 2);

																					$.component(node_94, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_8) => {
																						DropdownMenu_Group_8($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_54 = $.comment();
																								var node_95 = $.first_child(fragment_54);

																								$.component(node_95, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_13) => {
																									DropdownMenu_Item_13($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_55 = root_29();
																											var node_96 = $.first_child(fragment_55);

																											IconPlaceholder(node_96, {
																												lucide: 'ShieldIcon',
																												tabler: 'IconShield',
																												hugeicons: 'ShieldIcon',
																												phosphor: 'ShieldIcon',
																												remixicon: 'RiShieldLine'
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

																					$.append($$anchor, fragment_43);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_42);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_40);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_37);
											},
											$$slots: { default: true }
										});
									});

									var node_97 = $.sibling(node_64, 2);

									$.component(node_97, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_5) => {
										DropdownMenu_Separator_5($$anchor, {});
									});

									var node_98 = $.sibling(node_97, 2);

									$.component(node_98, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_9) => {
										DropdownMenu_Group_9($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_56 = root_8();
												var node_99 = $.first_child(fragment_56);

												$.component(node_99, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_14) => {
													DropdownMenu_Item_14($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_57 = root_30();
															var node_100 = $.first_child(fragment_57);

															IconPlaceholder(node_100, {
																lucide: 'HelpCircleIcon',
																tabler: 'IconHelpCircle',
																hugeicons: 'HelpCircleIcon',
																phosphor: 'QuestionIcon',
																remixicon: 'RiQuestionLine'
															});

															$.next();
															$.append($$anchor, fragment_57);
														},
														$$slots: { default: true }
													});
												});

												var node_101 = $.sibling(node_99, 2);

												$.component(node_101, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_15) => {
													DropdownMenu_Item_15($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_58 = root_31();
															var node_102 = $.first_child(fragment_58);

															IconPlaceholder(node_102, {
																lucide: 'FileTextIcon',
																tabler: 'IconFileText',
																hugeicons: 'File01Icon',
																phosphor: 'FileTextIcon',
																remixicon: 'RiFileTextLine'
															});

															$.next();
															$.append($$anchor, fragment_58);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_56);
											},
											$$slots: { default: true }
										});
									});

									var node_103 = $.sibling(node_98, 2);

									$.component(node_103, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_6) => {
										DropdownMenu_Separator_6($$anchor, {});
									});

									var node_104 = $.sibling(node_103, 2);

									$.component(node_104, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_10) => {
										DropdownMenu_Group_10($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_59 = $.comment();
												var node_105 = $.first_child(fragment_59);

												$.component(node_105, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_16) => {
													DropdownMenu_Item_16($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															var fragment_60 = root_32();
															var node_106 = $.first_child(fragment_60);

															IconPlaceholder(node_106, {
																lucide: 'LogOutIcon',
																tabler: 'IconLogout',
																hugeicons: 'LogoutIcon',
																phosphor: 'SignOutIcon',
																remixicon: 'RiLogoutBoxLine'
															});

															var node_107 = $.sibling(node_106, 2);

															$.component(node_107, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_5) => {
																DropdownMenu_Shortcut_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text('⇧⌘Q');

																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_60);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_59);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
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
}