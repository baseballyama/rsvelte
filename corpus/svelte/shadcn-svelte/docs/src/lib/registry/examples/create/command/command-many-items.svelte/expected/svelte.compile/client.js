import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span>Home</span> <!>`, 1);
var root_1 = $.from_html(`<!> <span>Inbox</span> <!>`, 1);
var root_2 = $.from_html(`<!> <span>Documents</span> <!>`, 1);
var root_3 = $.from_html(`<!> <span>Folders</span> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <span>New File</span> <!>`, 1);
var root_6 = $.from_html(`<!> <span>New Folder</span> <!>`, 1);
var root_7 = $.from_html(`<!> <span>Copy</span> <!>`, 1);
var root_8 = $.from_html(`<!> <span>Cut</span> <!>`, 1);
var root_9 = $.from_html(`<!> <span>Paste</span> <!>`, 1);
var root_10 = $.from_html(`<!> <span>Delete</span> <!>`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <span>Grid View</span>`, 1);
var root_13 = $.from_html(`<!> <span>List View</span>`, 1);
var root_14 = $.from_html(`<!> <span>Zoom In</span> <!>`, 1);
var root_15 = $.from_html(`<!> <span>Zoom Out</span> <!>`, 1);
var root_16 = $.from_html(`<!> <span>Profile</span> <!>`, 1);
var root_17 = $.from_html(`<!> <span>Billing</span> <!>`, 1);
var root_18 = $.from_html(`<!> <span>Settings</span> <!>`, 1);
var root_19 = $.from_html(`<!> <span>Notifications</span>`, 1);
var root_20 = $.from_html(`<!> <span>Help & Support</span>`, 1);
var root_21 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_22 = $.from_html(`<!> <span>Calculator</span>`, 1);
var root_23 = $.from_html(`<!> <span>Calendar</span>`, 1);
var root_24 = $.from_html(`<!> <span>Image Editor</span>`, 1);
var root_25 = $.from_html(`<!> <span>Code Editor</span>`, 1);
var root_26 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_27 = $.from_html(`<!> <!>`, 1);
var root_28 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Command_many_items($$anchor) {
	let open = $.state(false);

	Example($$anchor, {
		title: 'Many Groups & Items',
		children: ($$anchor, $$slotProps) => {
			var div = root_28();
			var node = $.child(div);

			Button(node, {
				onclick: () => $.set(open, true),
				variant: 'outline',
				class: 'w-fit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Command.Dialog, ($$anchor, Command_Dialog) => {
				Command_Dialog($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_27();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
							Command_Input($$anchor, { placeholder: 'Type a command or search...' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
							Command_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_26();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
										Command_Empty($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('No results found.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
										Command_Group($$anchor, {
											heading: 'Navigation',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root_4();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Command.Item, ($$anchor, Command_Item) => {
													Command_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root();
															var node_7 = $.first_child(fragment_4);

															IconPlaceholder(node_7, {
																lucide: 'HomeIcon',
																tabler: 'IconHome',
																hugeicons: 'HomeIcon',
																phosphor: 'HouseIcon',
																remixicon: 'RiHomeLine'
															});

															var node_8 = $.sibling(node_7, 4);

															$.component(node_8, () => Command.Shortcut, ($$anchor, Command_Shortcut) => {
																Command_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘H');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_4);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_6, 2);

												$.component(node_9, () => Command.Item, ($$anchor, Command_Item_1) => {
													Command_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_1();
															var node_10 = $.first_child(fragment_5);

															IconPlaceholder(node_10, {
																lucide: 'InboxIcon',
																tabler: 'IconInbox',
																hugeicons: 'InboxIcon',
																phosphor: 'TrayIcon',
																remixicon: 'RiInboxLine'
															});

															var node_11 = $.sibling(node_10, 4);

															$.component(node_11, () => Command.Shortcut, ($$anchor, Command_Shortcut_1) => {
																Command_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘I');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_9, 2);

												$.component(node_12, () => Command.Item, ($$anchor, Command_Item_2) => {
													Command_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_13 = $.first_child(fragment_6);

															IconPlaceholder(node_13, {
																lucide: 'FileTextIcon',
																tabler: 'IconFileText',
																hugeicons: 'File02Icon',
																phosphor: 'FileTextIcon',
																remixicon: 'RiFileTextLine'
															});

															var node_14 = $.sibling(node_13, 4);

															$.component(node_14, () => Command.Shortcut, ($$anchor, Command_Shortcut_2) => {
																Command_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘D');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_12, 2);

												$.component(node_15, () => Command.Item, ($$anchor, Command_Item_3) => {
													Command_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_3();
															var node_16 = $.first_child(fragment_7);

															IconPlaceholder(node_16, {
																lucide: 'FolderIcon',
																tabler: 'IconFolder',
																hugeicons: 'FolderIcon',
																phosphor: 'FolderIcon',
																remixicon: 'RiFolderLine'
															});

															var node_17 = $.sibling(node_16, 4);

															$.component(node_17, () => Command.Shortcut, ($$anchor, Command_Shortcut_3) => {
																Command_Shortcut_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('⌘F');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_5, 2);

									$.component(node_18, () => Command.Separator, ($$anchor, Command_Separator) => {
										Command_Separator($$anchor, {});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Command.Group, ($$anchor, Command_Group_1) => {
										Command_Group_1($$anchor, {
											heading: 'Actions',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_11();
												var node_20 = $.first_child(fragment_8);

												$.component(node_20, () => Command.Item, ($$anchor, Command_Item_4) => {
													Command_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_5();
															var node_21 = $.first_child(fragment_9);

															IconPlaceholder(node_21, {
																lucide: 'PlusIcon',
																tabler: 'IconPlus',
																hugeicons: 'PlusSignIcon',
																phosphor: 'PlusIcon',
																remixicon: 'RiAddLine'
															});

															var node_22 = $.sibling(node_21, 4);

															$.component(node_22, () => Command.Shortcut, ($$anchor, Command_Shortcut_4) => {
																Command_Shortcut_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('⌘N');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_20, 2);

												$.component(node_23, () => Command.Item, ($$anchor, Command_Item_5) => {
													Command_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_6();
															var node_24 = $.first_child(fragment_10);

															IconPlaceholder(node_24, {
																lucide: 'FolderPlusIcon',
																tabler: 'IconFolderPlus',
																hugeicons: 'FolderAddIcon',
																phosphor: 'FolderPlusIcon',
																remixicon: 'RiFolderAddLine'
															});

															var node_25 = $.sibling(node_24, 4);

															$.component(node_25, () => Command.Shortcut, ($$anchor, Command_Shortcut_5) => {
																Command_Shortcut_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('⇧⌘N');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var node_26 = $.sibling(node_23, 2);

												$.component(node_26, () => Command.Item, ($$anchor, Command_Item_6) => {
													Command_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_7();
															var node_27 = $.first_child(fragment_11);

															IconPlaceholder(node_27, {
																lucide: 'CopyIcon',
																tabler: 'IconCopy',
																hugeicons: 'CopyIcon',
																phosphor: 'CopyIcon',
																remixicon: 'RiFileCopyLine'
															});

															var node_28 = $.sibling(node_27, 4);

															$.component(node_28, () => Command.Shortcut, ($$anchor, Command_Shortcut_6) => {
																Command_Shortcut_6($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('⌘C');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_29 = $.sibling(node_26, 2);

												$.component(node_29, () => Command.Item, ($$anchor, Command_Item_7) => {
													Command_Item_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root_8();
															var node_30 = $.first_child(fragment_12);

															IconPlaceholder(node_30, {
																lucide: 'ScissorsIcon',
																tabler: 'IconCut',
																hugeicons: 'ScissorIcon',
																phosphor: 'ScissorsIcon',
																remixicon: 'RiScissorsLine'
															});

															var node_31 = $.sibling(node_30, 4);

															$.component(node_31, () => Command.Shortcut, ($$anchor, Command_Shortcut_7) => {
																Command_Shortcut_7($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('⌘X');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_29, 2);

												$.component(node_32, () => Command.Item, ($$anchor, Command_Item_8) => {
													Command_Item_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_9();
															var node_33 = $.first_child(fragment_13);

															IconPlaceholder(node_33, {
																lucide: 'ClipboardPasteIcon',
																tabler: 'IconClipboard',
																hugeicons: 'ClipboardIcon',
																phosphor: 'ClipboardIcon',
																remixicon: 'RiClipboardLine'
															});

															var node_34 = $.sibling(node_33, 4);

															$.component(node_34, () => Command.Shortcut, ($$anchor, Command_Shortcut_8) => {
																Command_Shortcut_8($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('⌘V');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												var node_35 = $.sibling(node_32, 2);

												$.component(node_35, () => Command.Item, ($$anchor, Command_Item_9) => {
													Command_Item_9($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_14 = root_10();
															var node_36 = $.first_child(fragment_14);

															IconPlaceholder(node_36, {
																lucide: 'TrashIcon',
																tabler: 'IconTrash',
																hugeicons: 'DeleteIcon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});

															var node_37 = $.sibling(node_36, 4);

															$.component(node_37, () => Command.Shortcut, ($$anchor, Command_Shortcut_9) => {
																Command_Shortcut_9($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('⌫');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_38 = $.sibling(node_19, 2);

									$.component(node_38, () => Command.Separator, ($$anchor, Command_Separator_1) => {
										Command_Separator_1($$anchor, {});
									});

									var node_39 = $.sibling(node_38, 2);

									$.component(node_39, () => Command.Group, ($$anchor, Command_Group_2) => {
										Command_Group_2($$anchor, {
											heading: 'View',
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root_4();
												var node_40 = $.first_child(fragment_15);

												$.component(node_40, () => Command.Item, ($$anchor, Command_Item_10) => {
													Command_Item_10($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root_12();
															var node_41 = $.first_child(fragment_16);

															IconPlaceholder(node_41, {
																lucide: 'LayoutGridIcon',
																tabler: 'IconLayoutGrid',
																hugeicons: 'GridIcon',
																phosphor: 'GridFourIcon',
																remixicon: 'RiGridLine'
															});

															$.next(2);
															$.append($$anchor, fragment_16);
														},
														$$slots: { default: true }
													});
												});

												var node_42 = $.sibling(node_40, 2);

												$.component(node_42, () => Command.Item, ($$anchor, Command_Item_11) => {
													Command_Item_11($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_17 = root_13();
															var node_43 = $.first_child(fragment_17);

															IconPlaceholder(node_43, {
																lucide: 'ListIcon',
																tabler: 'IconList',
																hugeicons: 'Menu05Icon',
																phosphor: 'ListIcon',
																remixicon: 'RiListUnordered'
															});

															$.next(2);
															$.append($$anchor, fragment_17);
														},
														$$slots: { default: true }
													});
												});

												var node_44 = $.sibling(node_42, 2);

												$.component(node_44, () => Command.Item, ($$anchor, Command_Item_12) => {
													Command_Item_12($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root_14();
															var node_45 = $.first_child(fragment_18);

															IconPlaceholder(node_45, {
																lucide: 'ZoomInIcon',
																tabler: 'IconZoomIn',
																hugeicons: 'ZoomInAreaIcon',
																phosphor: 'MagnifyingGlassPlusIcon',
																remixicon: 'RiZoomInLine'
															});

															var node_46 = $.sibling(node_45, 4);

															$.component(node_46, () => Command.Shortcut, ($$anchor, Command_Shortcut_10) => {
																Command_Shortcut_10($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('⌘+');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_18);
														},
														$$slots: { default: true }
													});
												});

												var node_47 = $.sibling(node_44, 2);

												$.component(node_47, () => Command.Item, ($$anchor, Command_Item_13) => {
													Command_Item_13($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_19 = root_15();
															var node_48 = $.first_child(fragment_19);

															IconPlaceholder(node_48, {
																lucide: 'ZoomOutIcon',
																tabler: 'IconZoomOut',
																hugeicons: 'ZoomOutAreaIcon',
																phosphor: 'MagnifyingGlassMinusIcon',
																remixicon: 'RiSearchEyeLine'
															});

															var node_49 = $.sibling(node_48, 4);

															$.component(node_49, () => Command.Shortcut, ($$anchor, Command_Shortcut_11) => {
																Command_Shortcut_11($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text('⌘-');

																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_19);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});
									});

									var node_50 = $.sibling(node_39, 2);

									$.component(node_50, () => Command.Separator, ($$anchor, Command_Separator_2) => {
										Command_Separator_2($$anchor, {});
									});

									var node_51 = $.sibling(node_50, 2);

									$.component(node_51, () => Command.Group, ($$anchor, Command_Group_3) => {
										Command_Group_3($$anchor, {
											heading: 'Account',
											children: ($$anchor, $$slotProps) => {
												var fragment_20 = root_21();
												var node_52 = $.first_child(fragment_20);

												$.component(node_52, () => Command.Item, ($$anchor, Command_Item_14) => {
													Command_Item_14($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_21 = root_16();
															var node_53 = $.first_child(fragment_21);

															IconPlaceholder(node_53, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															var node_54 = $.sibling(node_53, 4);

															$.component(node_54, () => Command.Shortcut, ($$anchor, Command_Shortcut_12) => {
																Command_Shortcut_12($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_14 = $.text('⌘P');

																		$.append($$anchor, text_14);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_21);
														},
														$$slots: { default: true }
													});
												});

												var node_55 = $.sibling(node_52, 2);

												$.component(node_55, () => Command.Item, ($$anchor, Command_Item_15) => {
													Command_Item_15($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = root_17();
															var node_56 = $.first_child(fragment_22);

															IconPlaceholder(node_56, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															var node_57 = $.sibling(node_56, 4);

															$.component(node_57, () => Command.Shortcut, ($$anchor, Command_Shortcut_13) => {
																Command_Shortcut_13($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_15 = $.text('⌘B');

																		$.append($$anchor, text_15);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												var node_58 = $.sibling(node_55, 2);

												$.component(node_58, () => Command.Item, ($$anchor, Command_Item_16) => {
													Command_Item_16($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_23 = root_18();
															var node_59 = $.first_child(fragment_23);

															IconPlaceholder(node_59, {
																lucide: 'SettingsIcon',
																tabler: 'IconSettings',
																hugeicons: 'SettingsIcon',
																phosphor: 'GearIcon',
																remixicon: 'RiSettingsLine'
															});

															var node_60 = $.sibling(node_59, 4);

															$.component(node_60, () => Command.Shortcut, ($$anchor, Command_Shortcut_14) => {
																Command_Shortcut_14($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_16 = $.text('⌘S');

																		$.append($$anchor, text_16);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_23);
														},
														$$slots: { default: true }
													});
												});

												var node_61 = $.sibling(node_58, 2);

												$.component(node_61, () => Command.Item, ($$anchor, Command_Item_17) => {
													Command_Item_17($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_24 = root_19();
															var node_62 = $.first_child(fragment_24);

															IconPlaceholder(node_62, {
																lucide: 'BellIcon',
																tabler: 'IconBell',
																hugeicons: 'NotificationIcon',
																phosphor: 'BellIcon',
																remixicon: 'RiNotificationLine'
															});

															$.next(2);
															$.append($$anchor, fragment_24);
														},
														$$slots: { default: true }
													});
												});

												var node_63 = $.sibling(node_61, 2);

												$.component(node_63, () => Command.Item, ($$anchor, Command_Item_18) => {
													Command_Item_18($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_25 = root_20();
															var node_64 = $.first_child(fragment_25);

															IconPlaceholder(node_64, {
																lucide: 'HelpCircleIcon',
																tabler: 'IconHelpCircle',
																hugeicons: 'HelpCircleIcon',
																phosphor: 'QuestionIcon',
																remixicon: 'RiQuestionLine'
															});

															$.next(2);
															$.append($$anchor, fragment_25);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_20);
											},
											$$slots: { default: true }
										});
									});

									var node_65 = $.sibling(node_51, 2);

									$.component(node_65, () => Command.Separator, ($$anchor, Command_Separator_3) => {
										Command_Separator_3($$anchor, {});
									});

									var node_66 = $.sibling(node_65, 2);

									$.component(node_66, () => Command.Group, ($$anchor, Command_Group_4) => {
										Command_Group_4($$anchor, {
											heading: 'Tools',
											children: ($$anchor, $$slotProps) => {
												var fragment_26 = root_4();
												var node_67 = $.first_child(fragment_26);

												$.component(node_67, () => Command.Item, ($$anchor, Command_Item_19) => {
													Command_Item_19($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_27 = root_22();
															var node_68 = $.first_child(fragment_27);

															IconPlaceholder(node_68, {
																lucide: 'CalculatorIcon',
																tabler: 'IconCalculator',
																hugeicons: 'CalculatorIcon',
																phosphor: 'CalculatorIcon',
																remixicon: 'RiCalculatorLine'
															});

															$.next(2);
															$.append($$anchor, fragment_27);
														},
														$$slots: { default: true }
													});
												});

												var node_69 = $.sibling(node_67, 2);

												$.component(node_69, () => Command.Item, ($$anchor, Command_Item_20) => {
													Command_Item_20($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_28 = root_23();
															var node_70 = $.first_child(fragment_28);

															IconPlaceholder(node_70, {
																lucide: 'CalendarIcon',
																tabler: 'IconCalendar',
																hugeicons: 'CalendarIcon',
																phosphor: 'CalendarBlankIcon',
																remixicon: 'RiCalendarLine'
															});

															$.next(2);
															$.append($$anchor, fragment_28);
														},
														$$slots: { default: true }
													});
												});

												var node_71 = $.sibling(node_69, 2);

												$.component(node_71, () => Command.Item, ($$anchor, Command_Item_21) => {
													Command_Item_21($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_29 = root_24();
															var node_72 = $.first_child(fragment_29);

															IconPlaceholder(node_72, {
																lucide: 'ImageIcon',
																tabler: 'IconPhoto',
																hugeicons: 'ImageIcon',
																phosphor: 'ImageIcon',
																remixicon: 'RiImageLine'
															});

															$.next(2);
															$.append($$anchor, fragment_29);
														},
														$$slots: { default: true }
													});
												});

												var node_73 = $.sibling(node_71, 2);

												$.component(node_73, () => Command.Item, ($$anchor, Command_Item_22) => {
													Command_Item_22($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_30 = root_25();
															var node_74 = $.first_child(fragment_30);

															IconPlaceholder(node_74, {
																lucide: 'CodeIcon',
																tabler: 'IconCode',
																hugeicons: 'CodeIcon',
																phosphor: 'CodeIcon',
																remixicon: 'RiCodeLine'
															});

															$.next(2);
															$.append($$anchor, fragment_30);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_26);
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

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}