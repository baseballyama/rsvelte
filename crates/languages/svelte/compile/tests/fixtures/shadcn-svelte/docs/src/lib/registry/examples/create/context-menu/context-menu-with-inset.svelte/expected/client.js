import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Copy`, 1);
var root_1 = $.from_html(`<!> Cut`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Context_menu_with_inset($$anchor) {
	let showBookmarks = $.state(true);
	let showUrls = $.state(false);
	let theme = $.state("system");

	Example($$anchor, {
		title: 'With Inset',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
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
								class: 'w-44',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_5();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_2();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => ContextMenu.Label, ($$anchor, ContextMenu_Label) => {
													ContextMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Actions');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
													ContextMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															IconPlaceholder(node_6, {
																lucide: 'CopyIcon',
																tabler: 'IconCopy',
																hugeicons: 'CopyIcon',
																phosphor: 'CopyIcon',
																remixicon: 'RiFileCopyLine'
															});

															$.next();
															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_5, 2);

												$.component(node_7, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
													ContextMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_8 = $.first_child(fragment_6);

															IconPlaceholder(node_8, {
																lucide: 'ScissorsIcon',
																tabler: 'IconCut',
																hugeicons: 'ScissorIcon',
																phosphor: 'ScissorsIcon',
																remixicon: 'RiScissorsLine'
															});

															$.next();
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_7, 2);

												$.component(node_9, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
													ContextMenu_Item_2($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Paste');

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

									var node_10 = $.sibling(node_3, 2);

									$.component(node_10, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
										ContextMenu_Separator($$anchor, {});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
										ContextMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_3();
												var node_12 = $.first_child(fragment_7);

												$.component(node_12, () => ContextMenu.Label, ($$anchor, ContextMenu_Label_1) => {
													ContextMenu_Label_1($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Appearance');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem) => {
													ContextMenu_CheckboxItem($$anchor, {
														inset: true,
														get checked() {
															return $.get(showBookmarks);
														},

														set checked($$value) {
															$.set(showBookmarks, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Bookmarks');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem_1) => {
													ContextMenu_CheckboxItem_1($$anchor, {
														inset: true,
														get checked() {
															return $.get(showUrls);
														},

														set checked($$value) {
															$.set(showUrls, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Full URLs');

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

									var node_15 = $.sibling(node_11, 2);

									$.component(node_15, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_1) => {
										ContextMenu_Separator_1($$anchor, {});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_2) => {
										ContextMenu_Group_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_4();
												var node_17 = $.first_child(fragment_8);

												$.component(node_17, () => ContextMenu.Label, ($$anchor, ContextMenu_Label_2) => {
													ContextMenu_Label_2($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Theme');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup) => {
													ContextMenu_RadioGroup($$anchor, {
														get value() {
															return $.get(theme);
														},

														set value($$value) {
															$.set(theme, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_3();
															var node_19 = $.first_child(fragment_9);

															$.component(node_19, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem) => {
																ContextMenu_RadioItem($$anchor, {
																	inset: true,
																	value: 'light',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Light');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_20 = $.sibling(node_19, 2);

															$.component(node_20, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_1) => {
																ContextMenu_RadioItem_1($$anchor, {
																	inset: true,
																	value: 'dark',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Dark');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_21 = $.sibling(node_20, 2);

															$.component(node_21, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_2) => {
																ContextMenu_RadioItem_2($$anchor, {
																	inset: true,
																	value: 'system',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('System');

																		$.append($$anchor, text_9);
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

									var node_22 = $.sibling(node_16, 2);

									$.component(node_22, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_2) => {
										ContextMenu_Separator_2($$anchor, {});
									});

									var node_23 = $.sibling(node_22, 2);

									$.component(node_23, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
										ContextMenu_Sub($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_4();
												var node_24 = $.first_child(fragment_10);

												$.component(node_24, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
													ContextMenu_SubTrigger($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('More Options');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_25 = $.sibling(node_24, 2);

												$.component(node_25, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
													ContextMenu_SubContent($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_26 = $.first_child(fragment_11);

															$.component(node_26, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_3) => {
																ContextMenu_Group_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = root_4();
																		var node_27 = $.first_child(fragment_12);

																		$.component(node_27, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
																			ContextMenu_Item_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text('Save Page...');

																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_28 = $.sibling(node_27, 2);

																		$.component(node_28, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
																			ContextMenu_Item_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_12 = $.text('Create Shortcut...');

																					$.append($$anchor, text_12);
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

												$.append($$anchor, fragment_10);
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