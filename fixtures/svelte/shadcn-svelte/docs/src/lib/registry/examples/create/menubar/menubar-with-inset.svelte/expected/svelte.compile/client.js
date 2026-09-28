import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Copy`, 1);
var root_1 = $.from_html(`<!> Cut`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Menubar_with_inset($$anchor) {
	let showBookmarks = $.state(true);
	let showUrls = $.state(false);
	let theme = $.state("system");

	Example($$anchor, {
		title: 'With Inset',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
				Menubar_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
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

												var text = $.text('View');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Menubar.Content, ($$anchor, Menubar_Content) => {
										Menubar_Content($$anchor, {
											class: 'w-44',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_5();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Menubar.Group, ($$anchor, Menubar_Group) => {
													Menubar_Group($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_2();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Menubar.Label, ($$anchor, Menubar_Label) => {
																Menubar_Label($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Actions');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Menubar.Item, ($$anchor, Menubar_Item) => {
																Menubar_Item($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root();
																		var node_7 = $.first_child(fragment_6);

																		IconPlaceholder(node_7, {
																			lucide: 'CopyIcon',
																			tabler: 'IconCopy',
																			hugeicons: 'CopyIcon',
																			phosphor: 'CopyIcon',
																			remixicon: 'RiFileCopyLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_6, 2);

															$.component(node_8, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
																Menubar_Item_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_1();
																		var node_9 = $.first_child(fragment_7);

																		IconPlaceholder(node_9, {
																			lucide: 'ScissorsIcon',
																			tabler: 'IconCut',
																			hugeicons: 'ScissorIcon',
																			phosphor: 'ScissorsIcon',
																			remixicon: 'RiScissorsLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_8, 2);

															$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
																Menubar_Item_2($$anchor, {
																	inset: true,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Paste');

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

												var node_11 = $.sibling(node_4, 2);

												$.component(node_11, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
													Menubar_Separator($$anchor, {});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => Menubar.Group, ($$anchor, Menubar_Group_1) => {
													Menubar_Group_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_3();
															var node_13 = $.first_child(fragment_8);

															$.component(node_13, () => Menubar.Label, ($$anchor, Menubar_Label_1) => {
																Menubar_Label_1($$anchor, {
																	inset: true,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Appearance');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem) => {
																Menubar_CheckboxItem($$anchor, {
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

															var node_15 = $.sibling(node_14, 2);

															$.component(node_15, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_1) => {
																Menubar_CheckboxItem_1($$anchor, {
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

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_12, 2);

												$.component(node_16, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
													Menubar_Separator_1($$anchor, {});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Menubar.Group, ($$anchor, Menubar_Group_2) => {
													Menubar_Group_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_4();
															var node_18 = $.first_child(fragment_9);

															$.component(node_18, () => Menubar.Label, ($$anchor, Menubar_Label_2) => {
																Menubar_Label_2($$anchor, {
																	inset: true,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Theme');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_19 = $.sibling(node_18, 2);

															$.component(node_19, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup) => {
																Menubar_RadioGroup($$anchor, {
																	get value() {
																		return $.get(theme);
																	},

																	set value($$value) {
																		$.set(theme, $$value, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_3();
																		var node_20 = $.first_child(fragment_10);

																		$.component(node_20, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem) => {
																			Menubar_RadioItem($$anchor, {
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

																		var node_21 = $.sibling(node_20, 2);

																		$.component(node_21, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_1) => {
																			Menubar_RadioItem_1($$anchor, {
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

																		var node_22 = $.sibling(node_21, 2);

																		$.component(node_22, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_2) => {
																			Menubar_RadioItem_2($$anchor, {
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

												var node_23 = $.sibling(node_17, 2);

												$.component(node_23, () => Menubar.Separator, ($$anchor, Menubar_Separator_2) => {
													Menubar_Separator_2($$anchor, {});
												});

												var node_24 = $.sibling(node_23, 2);

												$.component(node_24, () => Menubar.Sub, ($$anchor, Menubar_Sub) => {
													Menubar_Sub($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_4();
															var node_25 = $.first_child(fragment_11);

															$.component(node_25, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger) => {
																Menubar_SubTrigger($$anchor, {
																	inset: true,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('More Options');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															var node_26 = $.sibling(node_25, 2);

															$.component(node_26, () => Menubar.SubContent, ($$anchor, Menubar_SubContent) => {
																Menubar_SubContent($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = $.comment();
																		var node_27 = $.first_child(fragment_12);

																		$.component(node_27, () => Menubar.Group, ($$anchor, Menubar_Group_3) => {
																			Menubar_Group_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_13 = root_4();
																					var node_28 = $.first_child(fragment_13);

																					$.component(node_28, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
																						Menubar_Item_3($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_11 = $.text('Save Page...');

																								$.append($$anchor, text_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_29 = $.sibling(node_28, 2);

																					$.component(node_29, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
																						Menubar_Item_4($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_12 = $.text('Create Shortcut...');

																								$.append($$anchor, text_12);
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

															$.append($$anchor, fragment_11);
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