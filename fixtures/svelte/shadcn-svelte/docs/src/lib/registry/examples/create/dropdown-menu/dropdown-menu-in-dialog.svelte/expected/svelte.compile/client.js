import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Copy`, 1);
var root_2 = $.from_html(`<!> Cut`, 1);
var root_3 = $.from_html(`<!> Paste`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> Delete`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_menu_in_dialog($$anchor) {
	Example($$anchor, {
		title: 'In Dialog',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open Dialog');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Dropdown Menu Example');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Click the button below to see the dropdown menu.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
										DropdownMenu_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Open Menu');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_7, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
														DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
													DropdownMenu_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_6();
															var node_9 = $.first_child(fragment_8);

															$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																DropdownMenu_Item($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_1();
																		var node_10 = $.first_child(fragment_9);

																		IconPlaceholder(node_10, {
																			lucide: 'CopyIcon',
																			tabler: 'IconCopy',
																			hugeicons: 'CopyIcon',
																			phosphor: 'CopyIcon',
																			remixicon: 'RiFileCopyLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_11 = $.sibling(node_9, 2);

															$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																DropdownMenu_Item_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_2();
																		var node_12 = $.first_child(fragment_10);

																		IconPlaceholder(node_12, {
																			lucide: 'ScissorsIcon',
																			tabler: 'IconCut',
																			hugeicons: 'ScissorIcon',
																			phosphor: 'ScissorsIcon',
																			remixicon: 'RiScissorsLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_11, 2);

															$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																DropdownMenu_Item_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = root_3();
																		var node_14 = $.first_child(fragment_11);

																		IconPlaceholder(node_14, {
																			lucide: 'ClipboardPasteIcon',
																			tabler: 'IconClipboard',
																			hugeicons: 'ClipboardIcon',
																			phosphor: 'ClipboardIcon',
																			remixicon: 'RiClipboardLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_15 = $.sibling(node_13, 2);

															$.component(node_15, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																DropdownMenu_Separator($$anchor, {});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
																DropdownMenu_Sub($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = root();
																		var node_17 = $.first_child(fragment_12);

																		$.component(node_17, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																			DropdownMenu_SubTrigger($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('More Options');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_18 = $.sibling(node_17, 2);

																		$.component(node_18, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
																			DropdownMenu_Portal($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_13 = $.comment();
																					var node_19 = $.first_child(fragment_13);

																					$.component(node_19, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																						DropdownMenu_SubContent($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_14 = root_4();
																								var node_20 = $.first_child(fragment_14);

																								$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																									DropdownMenu_Item_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Save Page...');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_21 = $.sibling(node_20, 2);

																								$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																									DropdownMenu_Item_4($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_6 = $.text('Create Shortcut...');

																											$.append($$anchor, text_6);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_21, 2);

																								$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																									DropdownMenu_Item_5($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text('Name Window...');

																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_23 = $.sibling(node_22, 2);

																								$.component(node_23, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																									DropdownMenu_Separator_1($$anchor, {});
																								});

																								var node_24 = $.sibling(node_23, 2);

																								$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																									DropdownMenu_Item_6($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text('Developer Tools');

																											$.append($$anchor, text_8);
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
																			});
																		});

																		$.append($$anchor, fragment_12);
																	},
																	$$slots: { default: true }
																});
															});

															var node_25 = $.sibling(node_16, 2);

															$.component(node_25, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
																DropdownMenu_Separator_2($$anchor, {});
															});

															var node_26 = $.sibling(node_25, 2);

															$.component(node_26, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																DropdownMenu_Item_7($$anchor, {
																	variant: 'destructive',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_15 = root_5();
																		var node_27 = $.first_child(fragment_15);

																		IconPlaceholder(node_27, {
																			lucide: 'TrashIcon',
																			tabler: 'IconTrash',
																			hugeicons: 'DeleteIcon',
																			phosphor: 'TrashIcon',
																			remixicon: 'RiDeleteBinLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_15);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
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