import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Copy`, 1);
var root_2 = $.from_html(`<!> Cut`, 1);
var root_3 = $.from_html(`<!> Paste`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> Delete`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Context_menu_in_dialog($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);

	Example($$anchor, {
		title: 'In Dialog',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open Dialog');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Context Menu Example');

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

															var text_2 = $.text('Right click on the area below to see the context menu.');

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

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
										ContextMenu_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_7 = $.first_child(fragment_5);

												$.component(node_7, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
													ContextMenu_Trigger($$anchor, {
														class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Right click here');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
													ContextMenu_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_6();
															var node_9 = $.first_child(fragment_6);

															$.component(node_9, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
																ContextMenu_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_4();
																		var node_10 = $.first_child(fragment_7);

																		$.component(node_10, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
																			ContextMenu_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root_1();
																					var node_11 = $.first_child(fragment_8);

																					IconPlaceholder(node_11, {
																						lucide: 'CopyIcon',
																						tabler: 'IconCopy',
																						hugeicons: 'CopyIcon',
																						phosphor: 'CopyIcon',
																						remixicon: 'RiFileCopyLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_12 = $.sibling(node_10, 2);

																		$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
																			ContextMenu_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_2();
																					var node_13 = $.first_child(fragment_9);

																					IconPlaceholder(node_13, {
																						lucide: 'ScissorsIcon',
																						tabler: 'IconCut',
																						hugeicons: 'ScissorIcon',
																						phosphor: 'ScissorsIcon',
																						remixicon: 'RiScissorsLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_14 = $.sibling(node_12, 2);

																		$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
																			ContextMenu_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root_3();
																					var node_15 = $.first_child(fragment_10);

																					IconPlaceholder(node_15, {
																						lucide: 'ClipboardPasteIcon',
																						tabler: 'IconClipboard',
																						hugeicons: 'ClipboardIcon',
																						phosphor: 'ClipboardIcon',
																						remixicon: 'RiClipboardLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_16 = $.sibling(node_9, 2);

															$.component(node_16, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
																ContextMenu_Separator($$anchor, {});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
																ContextMenu_Sub($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = root();
																		var node_18 = $.first_child(fragment_11);

																		$.component(node_18, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
																			ContextMenu_SubTrigger($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('More Options');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_19 = $.sibling(node_18, 2);

																		$.component(node_19, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
																			ContextMenu_SubContent($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_4();
																					var node_20 = $.first_child(fragment_12);

																					$.component(node_20, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
																						ContextMenu_Group_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_13 = root_4();
																								var node_21 = $.first_child(fragment_13);

																								$.component(node_21, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
																									ContextMenu_Item_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Save Page...');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_21, 2);

																								$.component(node_22, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
																									ContextMenu_Item_4($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_6 = $.text('Create Shortcut...');

																											$.append($$anchor, text_6);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_23 = $.sibling(node_22, 2);

																								$.component(node_23, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
																									ContextMenu_Item_5($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text('Name Window...');

																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_13);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_24 = $.sibling(node_20, 2);

																					$.component(node_24, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_1) => {
																						ContextMenu_Separator_1($$anchor, {});
																					});

																					var node_25 = $.sibling(node_24, 2);

																					$.component(node_25, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_2) => {
																						ContextMenu_Group_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_14 = $.comment();
																								var node_26 = $.first_child(fragment_14);

																								$.component(node_26, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
																									ContextMenu_Item_6($$anchor, {
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

															var node_27 = $.sibling(node_17, 2);

															$.component(node_27, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_2) => {
																ContextMenu_Separator_2($$anchor, {});
															});

															var node_28 = $.sibling(node_27, 2);

															$.component(node_28, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_3) => {
																ContextMenu_Group_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_15 = $.comment();
																		var node_29 = $.first_child(fragment_15);

																		$.component(node_29, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_7) => {
																			ContextMenu_Item_7($$anchor, {
																				variant: 'destructive',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_16 = root_5();
																					var node_30 = $.first_child(fragment_16);

																					IconPlaceholder(node_30, {
																						lucide: 'TrashIcon',
																						tabler: 'IconTrash',
																						hugeicons: 'DeleteIcon',
																						phosphor: 'TrashIcon',
																						remixicon: 'RiDeleteBinLine'
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

	$.pop();
}