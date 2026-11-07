import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`New File <!>`, 1);
var root_1 = $.from_html(`Open File <!>`, 1);
var root_2 = $.from_html(`Save <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`Undo <!>`, 1);
var root_5 = $.from_html(`Redo <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`Cut <!>`, 1);
var root_8 = $.from_html(`Copy <!>`, 1);
var root_9 = $.from_html(`Paste <!>`, 1);
var root_10 = $.from_html(`Delete <!>`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <!>`, 1);

export default function Context_menu_with_groups($$anchor) {
	Example($$anchor, {
		title: 'With Groups, Labels & Separators',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_12();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
							ContextMenu_Trigger($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Right click here');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
							ContextMenu_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_11();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_3();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => ContextMenu.Label, ($$anchor, ContextMenu_Label) => {
													ContextMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('File');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
													ContextMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root();
															var node_6 = $.sibling($.first_child(fragment_5));

															$.component(node_6, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut) => {
																ContextMenu_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘N');

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

												var node_7 = $.sibling(node_5, 2);

												$.component(node_7, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
													ContextMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root_1();
															var node_8 = $.sibling($.first_child(fragment_6));

															$.component(node_8, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_1) => {
																ContextMenu_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘O');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_7, 2);

												$.component(node_9, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
													ContextMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_7 = root_2();
															var node_10 = $.sibling($.first_child(fragment_7));

															$.component(node_10, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_2) => {
																ContextMenu_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘S');

																		$.append($$anchor, text_4);
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

									var node_11 = $.sibling(node_3, 2);

									$.component(node_11, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
										ContextMenu_Separator($$anchor, {});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
										ContextMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_6();
												var node_13 = $.first_child(fragment_8);

												$.component(node_13, () => ContextMenu.Label, ($$anchor, ContextMenu_Label_1) => {
													ContextMenu_Label_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Edit');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
													ContextMenu_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_9 = root_4();
															var node_15 = $.sibling($.first_child(fragment_9));

															$.component(node_15, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_3) => {
																ContextMenu_Shortcut_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('⌘Z');

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

												var node_16 = $.sibling(node_14, 2);

												$.component(node_16, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
													ContextMenu_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_10 = root_5();
															var node_17 = $.sibling($.first_child(fragment_10));

															$.component(node_17, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_4) => {
																ContextMenu_Shortcut_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('⇧⌘Z');

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

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_12, 2);

									$.component(node_18, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_1) => {
										ContextMenu_Separator_1($$anchor, {});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_2) => {
										ContextMenu_Group_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_6();
												var node_20 = $.first_child(fragment_11);

												$.component(node_20, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
													ContextMenu_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_12 = root_7();
															var node_21 = $.sibling($.first_child(fragment_12));

															$.component(node_21, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_5) => {
																ContextMenu_Shortcut_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('⌘X');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												var node_22 = $.sibling(node_20, 2);

												$.component(node_22, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
													ContextMenu_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_13 = root_8();
															var node_23 = $.sibling($.first_child(fragment_13));

															$.component(node_23, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_6) => {
																ContextMenu_Shortcut_6($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('⌘C');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												var node_24 = $.sibling(node_22, 2);

												$.component(node_24, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_7) => {
													ContextMenu_Item_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_14 = root_9();
															var node_25 = $.sibling($.first_child(fragment_14));

															$.component(node_25, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_7) => {
																ContextMenu_Shortcut_7($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('⌘V');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

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

									$.component(node_26, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_2) => {
										ContextMenu_Separator_2($$anchor, {});
									});

									var node_27 = $.sibling(node_26, 2);

									$.component(node_27, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_3) => {
										ContextMenu_Group_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = $.comment();
												var node_28 = $.first_child(fragment_15);

												$.component(node_28, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_8) => {
													ContextMenu_Item_8($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_16 = root_10();
															var node_29 = $.sibling($.first_child(fragment_16));

															$.component(node_29, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_8) => {
																ContextMenu_Shortcut_8($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('⌫');

																		$.append($$anchor, text_11);
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
}