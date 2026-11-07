import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";

var root = $.from_html(`Back <!>`, 1);
var root_1 = $.from_html(`Forward <!>`, 1);
var root_2 = $.from_html(`Reload <!>`, 1);
var root_3 = $.from_html(`Save Page As... <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Context_menu_demo($$anchor) {
	let showBookmarks = $.state(false);
	let showFullURLs = $.state(true);
	let value = $.state("pedro");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						class: 'flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm',
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
						class: 'w-52',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_7();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
								ContextMenu_Item($$anchor, {
									inset: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();
										var node_4 = $.sibling($.first_child(fragment_3));

										$.component(node_4, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut) => {
											ContextMenu_Shortcut($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('⌘[');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_3, 2);

							$.component(node_5, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
								ContextMenu_Item_1($$anchor, {
									inset: true,
									disabled: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root_1();
										var node_6 = $.sibling($.first_child(fragment_4));

										$.component(node_6, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_1) => {
											ContextMenu_Shortcut_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('⌘]');

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

							var node_7 = $.sibling(node_5, 2);

							$.component(node_7, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
								ContextMenu_Item_2($$anchor, {
									inset: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_5 = root_2();
										var node_8 = $.sibling($.first_child(fragment_5));

										$.component(node_8, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_2) => {
											ContextMenu_Shortcut_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('⌘R');

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

							var node_9 = $.sibling(node_7, 2);

							$.component(node_9, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
								ContextMenu_Sub($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_5();
										var node_10 = $.first_child(fragment_6);

										$.component(node_10, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
											ContextMenu_SubTrigger($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('More Tools');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
											ContextMenu_SubContent($$anchor, {
												class: 'w-48',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_4();
													var node_12 = $.first_child(fragment_7);

													$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
														ContextMenu_Item_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_8 = root_3();
																var node_13 = $.sibling($.first_child(fragment_8));

																$.component(node_13, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_3) => {
																	ContextMenu_Shortcut_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('⇧⌘S');

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

													var node_14 = $.sibling(node_12, 2);

													$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
														ContextMenu_Item_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Create Shortcut...');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													var node_15 = $.sibling(node_14, 2);

													$.component(node_15, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
														ContextMenu_Item_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Name Window...');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
														ContextMenu_Separator($$anchor, {});
													});

													var node_17 = $.sibling(node_16, 2);

													$.component(node_17, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
														ContextMenu_Item_6($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Developer Tools');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_18 = $.sibling(node_9, 2);

							$.component(node_18, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_1) => {
								ContextMenu_Separator_1($$anchor, {});
							});

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem) => {
								ContextMenu_CheckboxItem($$anchor, {
									get checked() {
										return $.get(showBookmarks);
									},

									set checked($$value) {
										$.set(showBookmarks, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Show Bookmarks');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							});

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem_1) => {
								ContextMenu_CheckboxItem_1($$anchor, {
									get checked() {
										return $.get(showFullURLs);
									},

									set checked($$value) {
										$.set(showFullURLs, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text('Show Full URLs');

										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});
							});

							var node_21 = $.sibling(node_20, 2);

							$.component(node_21, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator_2) => {
								ContextMenu_Separator_2($$anchor, {});
							});

							var node_22 = $.sibling(node_21, 2);

							$.component(node_22, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup) => {
								ContextMenu_RadioGroup($$anchor, {
									get value() {
										return $.get(value);
									},

									set value($$value) {
										$.set(value, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_9 = $.comment();
										var node_23 = $.first_child(fragment_9);

										$.component(node_23, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
											ContextMenu_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_6();
													var node_24 = $.first_child(fragment_10);

													$.component(node_24, () => ContextMenu.GroupHeading, ($$anchor, ContextMenu_GroupHeading) => {
														ContextMenu_GroupHeading($$anchor, {
															inset: true,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('People');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_24, 2);

													$.component(node_25, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem) => {
														ContextMenu_RadioItem($$anchor, {
															value: 'pedro',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Pedro Duarte');

																$.append($$anchor, text_12);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_25, 2);

													$.component(node_26, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_1) => {
														ContextMenu_RadioItem_1($$anchor, {
															value: 'colm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_13 = $.text('Colm Tuite');

																$.append($$anchor, text_13);
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

	$.append($$anchor, fragment);
}