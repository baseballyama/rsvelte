import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Menubar from "$lib/registry/ui/menubar/index.js";
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
var root_7 = $.from_html(`Undo <!>`, 1);
var root_8 = $.from_html(`Redo <!>`, 1);

export default function Menubar_in_dialog($$anchor) {
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

															var text_1 = $.text('Menubar Example');

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

															var text_2 = $.text('Use the menubar below to see the menu options.');

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

									$.component(node_6, () => Menubar.Root, ($$anchor, Menubar_Root) => {
										Menubar_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
													Menubar_Menu($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Menubar.Trigger, ($$anchor, Menubar_Trigger) => {
																Menubar_Trigger($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('File');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Menubar.Content, ($$anchor, Menubar_Content) => {
																Menubar_Content($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_6();
																		var node_10 = $.first_child(fragment_8);

																		$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item) => {
																			Menubar_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_1();
																					var node_11 = $.first_child(fragment_9);

																					IconPlaceholder(node_11, {
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

																		var node_12 = $.sibling(node_10, 2);

																		$.component(node_12, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
																			Menubar_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root_2();
																					var node_13 = $.first_child(fragment_10);

																					IconPlaceholder(node_13, {
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

																		var node_14 = $.sibling(node_12, 2);

																		$.component(node_14, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
																			Menubar_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_3();
																					var node_15 = $.first_child(fragment_11);

																					IconPlaceholder(node_15, {
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

																		var node_16 = $.sibling(node_14, 2);

																		$.component(node_16, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
																			Menubar_Separator($$anchor, {});
																		});

																		var node_17 = $.sibling(node_16, 2);

																		$.component(node_17, () => Menubar.Sub, ($$anchor, Menubar_Sub) => {
																			Menubar_Sub($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root();
																					var node_18 = $.first_child(fragment_12);

																					$.component(node_18, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger) => {
																						Menubar_SubTrigger($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text('More Options');

																								$.append($$anchor, text_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_19 = $.sibling(node_18, 2);

																					$.component(node_19, () => Menubar.SubContent, ($$anchor, Menubar_SubContent) => {
																						Menubar_SubContent($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_13 = root_4();
																								var node_20 = $.first_child(fragment_13);

																								$.component(node_20, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
																									Menubar_Item_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Save Page...');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_21 = $.sibling(node_20, 2);

																								$.component(node_21, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
																									Menubar_Item_4($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_6 = $.text('Create Shortcut...');

																											$.append($$anchor, text_6);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_21, 2);

																								$.component(node_22, () => Menubar.Item, ($$anchor, Menubar_Item_5) => {
																									Menubar_Item_5($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text('Name Window...');

																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_23 = $.sibling(node_22, 2);

																								$.component(node_23, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
																									Menubar_Separator_1($$anchor, {});
																								});

																								var node_24 = $.sibling(node_23, 2);

																								$.component(node_24, () => Menubar.Item, ($$anchor, Menubar_Item_6) => {
																									Menubar_Item_6($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text('Developer Tools');

																											$.append($$anchor, text_8);
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

																		var node_25 = $.sibling(node_17, 2);

																		$.component(node_25, () => Menubar.Separator, ($$anchor, Menubar_Separator_2) => {
																			Menubar_Separator_2($$anchor, {});
																		});

																		var node_26 = $.sibling(node_25, 2);

																		$.component(node_26, () => Menubar.Item, ($$anchor, Menubar_Item_7) => {
																			Menubar_Item_7($$anchor, {
																				variant: 'destructive',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root_5();
																					var node_27 = $.first_child(fragment_14);

																					IconPlaceholder(node_27, {
																						lucide: 'TrashIcon',
																						tabler: 'IconTrash',
																						hugeicons: 'DeleteIcon',
																						phosphor: 'TrashIcon',
																						remixicon: 'RiDeleteBinLine'
																					});

																					$.next();
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

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_7, 2);

												$.component(node_28, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
													Menubar_Menu_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root();
															var node_29 = $.first_child(fragment_15);

															$.component(node_29, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
																Menubar_Trigger_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Edit');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_30 = $.sibling(node_29, 2);

															$.component(node_30, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
																Menubar_Content_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = root();
																		var node_31 = $.first_child(fragment_16);

																		$.component(node_31, () => Menubar.Item, ($$anchor, Menubar_Item_8) => {
																			Menubar_Item_8($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_17 = root_7();
																					var node_32 = $.sibling($.first_child(fragment_17));

																					$.component(node_32, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut) => {
																						Menubar_Shortcut($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_10 = $.text('⌘Z');

																								$.append($$anchor, text_10);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_17);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_33 = $.sibling(node_31, 2);

																		$.component(node_33, () => Menubar.Item, ($$anchor, Menubar_Item_9) => {
																			Menubar_Item_9($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_18 = root_8();
																					var node_34 = $.sibling($.first_child(fragment_18));

																					$.component(node_34, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_1) => {
																						Menubar_Shortcut_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_11 = $.text('⇧⌘Z');

																								$.append($$anchor, text_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_18);
																				},
																				$$slots: { default: true }
																			});
																		});

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