import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Copy <!>`, 1);
var root_1 = $.from_html(`Cut <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Context_menu_with_submenu($$anchor) {
	Example($$anchor, {
		title: 'With Submenu',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
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
									var fragment_3 = root_2();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_2();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
													ContextMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root();
															var node_5 = $.sibling($.first_child(fragment_5));

															$.component(node_5, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut) => {
																ContextMenu_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('⌘C');

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

												var node_6 = $.sibling(node_4, 2);

												$.component(node_6, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
													ContextMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root_1();
															var node_7 = $.sibling($.first_child(fragment_6));

															$.component(node_7, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_1) => {
																ContextMenu_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘X');

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

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_3, 2);

									$.component(node_8, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
										ContextMenu_Sub($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
													ContextMenu_SubTrigger($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('More Tools');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
													ContextMenu_SubContent($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_4();
															var node_11 = $.first_child(fragment_8);

															$.component(node_11, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
																ContextMenu_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_3();
																		var node_12 = $.first_child(fragment_9);

																		$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
																			ContextMenu_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('Save Page...');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_13 = $.sibling(node_12, 2);

																		$.component(node_13, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
																			ContextMenu_Item_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Create Shortcut...');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_14 = $.sibling(node_13, 2);

																		$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
																			ContextMenu_Item_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Name Window...');

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

															var node_15 = $.sibling(node_11, 2);

															$.component(node_15, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
																ContextMenu_Separator($$anchor, {});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_2) => {
																ContextMenu_Group_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_17 = $.first_child(fragment_10);

																		$.component(node_17, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
																			ContextMenu_Item_5($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('Developer Tools');

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

															var node_18 = $.sibling(node_16, 2);

															$.component(node_18, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_1) => {
																ContextMenu_Separator_1($$anchor, {});
															});

															var node_19 = $.sibling(node_18, 2);

															$.component(node_19, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_3) => {
																ContextMenu_Group_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_20 = $.first_child(fragment_11);

																		$.component(node_20, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
																			ContextMenu_Item_6($$anchor, {
																				variant: 'destructive',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_8 = $.text('Delete');

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