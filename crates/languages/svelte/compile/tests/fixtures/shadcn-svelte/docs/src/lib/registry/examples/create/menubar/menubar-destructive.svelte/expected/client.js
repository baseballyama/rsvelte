import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> New File <!>`, 1);
var root_1 = $.from_html(`<!> Open Folder`, 1);
var root_2 = $.from_html(`<!> Delete File <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> Profile`, 1);
var root_6 = $.from_html(`<!> Settings`, 1);
var root_7 = $.from_html(`<!> Sign out`, 1);
var root_8 = $.from_html(`<!> Delete`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Menubar_destructive($$anchor) {
	Example($$anchor, {
		title: 'Destructive',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
				Menubar_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
							Menubar_Menu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_4();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Menubar.Trigger, ($$anchor, Menubar_Trigger) => {
										Menubar_Trigger($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('File');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Menubar.Content, ($$anchor, Menubar_Content) => {
										Menubar_Content($$anchor, {
											class: 'w-40',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_3();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Menubar.Item, ($$anchor, Menubar_Item) => {
													Menubar_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															IconPlaceholder(node_5, {
																lucide: 'FileIcon',
																tabler: 'IconFile',
																hugeicons: 'FileIcon',
																phosphor: 'FileIcon',
																remixicon: 'RiFileLine'
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut) => {
																Menubar_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('⌘N');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_4, 2);

												$.component(node_7, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
													Menubar_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_8 = $.first_child(fragment_6);

															IconPlaceholder(node_8, {
																lucide: 'FolderIcon',
																tabler: 'IconFolder',
																hugeicons: 'FolderIcon',
																phosphor: 'FolderIcon',
																remixicon: 'RiFolderLine'
															});

															$.next();
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_7, 2);

												$.component(node_9, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
													Menubar_Separator($$anchor, {});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
													Menubar_Item_2($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_2();
															var node_11 = $.first_child(fragment_7);

															IconPlaceholder(node_11, {
																lucide: 'TrashIcon',
																tabler: 'IconTrash',
																hugeicons: 'DeleteIcon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_1) => {
																Menubar_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘⌫');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_1, 2);

						$.component(node_13, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
							Menubar_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_14 = $.first_child(fragment_8);

									$.component(node_14, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
										Menubar_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Account');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
										Menubar_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_9();
												var node_16 = $.first_child(fragment_9);

												$.component(node_16, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
													Menubar_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_5();
															var node_17 = $.first_child(fragment_10);

															IconPlaceholder(node_17, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															$.next();
															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_16, 2);

												$.component(node_18, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
													Menubar_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_6();
															var node_19 = $.first_child(fragment_11);

															IconPlaceholder(node_19, {
																lucide: 'SettingsIcon',
																tabler: 'IconSettings',
																hugeicons: 'SettingsIcon',
																phosphor: 'GearIcon',
																remixicon: 'RiSettingsLine'
															});

															$.next();
															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_18, 2);

												$.component(node_20, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
													Menubar_Separator_1($$anchor, {});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => Menubar.Item, ($$anchor, Menubar_Item_5) => {
													Menubar_Item_5($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root_7();
															var node_22 = $.first_child(fragment_12);

															IconPlaceholder(node_22, {
																lucide: 'LogOutIcon',
																tabler: 'IconLogout',
																hugeicons: 'LogoutIcon',
																phosphor: 'SignOutIcon',
																remixicon: 'RiLogoutBoxLine'
															});

															$.next();
															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_21, 2);

												$.component(node_23, () => Menubar.Separator, ($$anchor, Menubar_Separator_2) => {
													Menubar_Separator_2($$anchor, {});
												});

												var node_24 = $.sibling(node_23, 2);

												$.component(node_24, () => Menubar.Item, ($$anchor, Menubar_Item_6) => {
													Menubar_Item_6($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_8();
															var node_25 = $.first_child(fragment_13);

															IconPlaceholder(node_25, {
																lucide: 'TrashIcon',
																tabler: 'IconTrash',
																hugeicons: 'DeleteIcon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});

															$.next();
															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
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