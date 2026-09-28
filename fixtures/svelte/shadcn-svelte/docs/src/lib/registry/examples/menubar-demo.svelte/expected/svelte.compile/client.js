import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";

var root = $.from_html(`New Tab <!>`, 1);
var root_1 = $.from_html(`New Window <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`Print... <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`Undo <!>`, 1);
var root_7 = $.from_html(`Redo <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_10 = $.from_html(`Reload <!>`, 1);
var root_11 = $.from_html(`Force Reload <!>`, 1);
var root_12 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_13 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Menubar_demo($$anchor) {
	let bookmarks = $.state(false);
	let fullUrls = $.state(true);
	let profileRadioValue = $.state("benoit");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
		Menubar_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_13();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
					Menubar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

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
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_5();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Menubar.Item, ($$anchor, Menubar_Item) => {
											Menubar_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_4 = root();
													var node_5 = $.sibling($.first_child(fragment_4));

													$.component(node_5, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut) => {
														Menubar_Shortcut($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('⌘T');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_4, 2);

										$.component(node_6, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
											Menubar_Item_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_5 = root_1();
													var node_7 = $.sibling($.first_child(fragment_5));

													$.component(node_7, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_1) => {
														Menubar_Shortcut_1($$anchor, {
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

										var node_8 = $.sibling(node_6, 2);

										$.component(node_8, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
											Menubar_Item_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('New Incognito Window');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
											Menubar_Separator($$anchor, {});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => Menubar.Sub, ($$anchor, Menubar_Sub) => {
											Menubar_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_3();
													var node_11 = $.first_child(fragment_6);

													$.component(node_11, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger) => {
														Menubar_SubTrigger($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Share');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => Menubar.SubContent, ($$anchor, Menubar_SubContent) => {
														Menubar_SubContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_2();
																var node_13 = $.first_child(fragment_7);

																$.component(node_13, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
																	Menubar_Item_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Email link');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_13, 2);

																$.component(node_14, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
																	Menubar_Item_4($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Messages');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_15 = $.sibling(node_14, 2);

																$.component(node_15, () => Menubar.Item, ($$anchor, Menubar_Item_5) => {
																	Menubar_Item_5($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_7 = $.text('Notes');

																			$.append($$anchor, text_7);
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

										var node_16 = $.sibling(node_10, 2);

										$.component(node_16, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
											Menubar_Separator_1($$anchor, {});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Menubar.Item, ($$anchor, Menubar_Item_6) => {
											Menubar_Item_6($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_4();
													var node_18 = $.sibling($.first_child(fragment_8));

													$.component(node_18, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_2) => {
														Menubar_Shortcut_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('⌘P');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
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

				var node_19 = $.sibling(node_1, 2);

				$.component(node_19, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
					Menubar_Menu_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_3();
							var node_20 = $.first_child(fragment_9);

							$.component(node_20, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
								Menubar_Trigger_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Edit');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							});

							var node_21 = $.sibling(node_20, 2);

							$.component(node_21, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
								Menubar_Content_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_9();
										var node_22 = $.first_child(fragment_10);

										$.component(node_22, () => Menubar.Item, ($$anchor, Menubar_Item_7) => {
											Menubar_Item_7($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_11 = root_6();
													var node_23 = $.sibling($.first_child(fragment_11));

													$.component(node_23, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_3) => {
														Menubar_Shortcut_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text('⌘Z');

																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_22, 2);

										$.component(node_24, () => Menubar.Item, ($$anchor, Menubar_Item_8) => {
											Menubar_Item_8($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_12 = root_7();
													var node_25 = $.sibling($.first_child(fragment_12));

													$.component(node_25, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_4) => {
														Menubar_Shortcut_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('⇧⌘Z');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										var node_26 = $.sibling(node_24, 2);

										$.component(node_26, () => Menubar.Separator, ($$anchor, Menubar_Separator_2) => {
											Menubar_Separator_2($$anchor, {});
										});

										var node_27 = $.sibling(node_26, 2);

										$.component(node_27, () => Menubar.Sub, ($$anchor, Menubar_Sub_1) => {
											Menubar_Sub_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_3();
													var node_28 = $.first_child(fragment_13);

													$.component(node_28, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger_1) => {
														Menubar_SubTrigger_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Find');

																$.append($$anchor, text_12);
															},
															$$slots: { default: true }
														});
													});

													var node_29 = $.sibling(node_28, 2);

													$.component(node_29, () => Menubar.SubContent, ($$anchor, Menubar_SubContent_1) => {
														Menubar_SubContent_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = root_8();
																var node_30 = $.first_child(fragment_14);

																$.component(node_30, () => Menubar.Item, ($$anchor, Menubar_Item_9) => {
																	Menubar_Item_9($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_13 = $.text('Search the web');

																			$.append($$anchor, text_13);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_31 = $.sibling(node_30, 2);

																$.component(node_31, () => Menubar.Separator, ($$anchor, Menubar_Separator_3) => {
																	Menubar_Separator_3($$anchor, {});
																});

																var node_32 = $.sibling(node_31, 2);

																$.component(node_32, () => Menubar.Item, ($$anchor, Menubar_Item_10) => {
																	Menubar_Item_10($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_14 = $.text('Find...');

																			$.append($$anchor, text_14);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_33 = $.sibling(node_32, 2);

																$.component(node_33, () => Menubar.Item, ($$anchor, Menubar_Item_11) => {
																	Menubar_Item_11($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_15 = $.text('Find Next');

																			$.append($$anchor, text_15);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_34 = $.sibling(node_33, 2);

																$.component(node_34, () => Menubar.Item, ($$anchor, Menubar_Item_12) => {
																	Menubar_Item_12($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_16 = $.text('Find Previous');

																			$.append($$anchor, text_16);
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

										var node_35 = $.sibling(node_27, 2);

										$.component(node_35, () => Menubar.Separator, ($$anchor, Menubar_Separator_4) => {
											Menubar_Separator_4($$anchor, {});
										});

										var node_36 = $.sibling(node_35, 2);

										$.component(node_36, () => Menubar.Item, ($$anchor, Menubar_Item_13) => {
											Menubar_Item_13($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Cut');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										var node_37 = $.sibling(node_36, 2);

										$.component(node_37, () => Menubar.Item, ($$anchor, Menubar_Item_14) => {
											Menubar_Item_14($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text('Copy');

													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});
										});

										var node_38 = $.sibling(node_37, 2);

										$.component(node_38, () => Menubar.Item, ($$anchor, Menubar_Item_15) => {
											Menubar_Item_15($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_19 = $.text('Paste');

													$.append($$anchor, text_19);
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

				var node_39 = $.sibling(node_19, 2);

				$.component(node_39, () => Menubar.Menu, ($$anchor, Menubar_Menu_2) => {
					Menubar_Menu_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root_3();
							var node_40 = $.first_child(fragment_15);

							$.component(node_40, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_2) => {
								Menubar_Trigger_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_20 = $.text('View');

										$.append($$anchor, text_20);
									},
									$$slots: { default: true }
								});
							});

							var node_41 = $.sibling(node_40, 2);

							$.component(node_41, () => Menubar.Content, ($$anchor, Menubar_Content_2) => {
								Menubar_Content_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_16 = root_12();
										var node_42 = $.first_child(fragment_16);

										$.component(node_42, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem) => {
											Menubar_CheckboxItem($$anchor, {
												get checked() {
													return $.get(bookmarks);
												},

												set checked($$value) {
													$.set(bookmarks, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_21 = $.text('Always Show Bookmarks Bar');

													$.append($$anchor, text_21);
												},
												$$slots: { default: true }
											});
										});

										var node_43 = $.sibling(node_42, 2);

										$.component(node_43, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_1) => {
											Menubar_CheckboxItem_1($$anchor, {
												get checked() {
													return $.get(fullUrls);
												},

												set checked($$value) {
													$.set(fullUrls, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_22 = $.text('Always Show Full URLs');

													$.append($$anchor, text_22);
												},
												$$slots: { default: true }
											});
										});

										var node_44 = $.sibling(node_43, 2);

										$.component(node_44, () => Menubar.Separator, ($$anchor, Menubar_Separator_5) => {
											Menubar_Separator_5($$anchor, {});
										});

										var node_45 = $.sibling(node_44, 2);

										$.component(node_45, () => Menubar.Item, ($$anchor, Menubar_Item_16) => {
											Menubar_Item_16($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_17 = root_10();
													var node_46 = $.sibling($.first_child(fragment_17));

													$.component(node_46, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_5) => {
														Menubar_Shortcut_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_23 = $.text('⌘R');

																$.append($$anchor, text_23);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										var node_47 = $.sibling(node_45, 2);

										$.component(node_47, () => Menubar.Item, ($$anchor, Menubar_Item_17) => {
											Menubar_Item_17($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_18 = root_11();
													var node_48 = $.sibling($.first_child(fragment_18));

													$.component(node_48, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_6) => {
														Menubar_Shortcut_6($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_24 = $.text('⇧⌘R');

																$.append($$anchor, text_24);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});

										var node_49 = $.sibling(node_47, 2);

										$.component(node_49, () => Menubar.Separator, ($$anchor, Menubar_Separator_6) => {
											Menubar_Separator_6($$anchor, {});
										});

										var node_50 = $.sibling(node_49, 2);

										$.component(node_50, () => Menubar.Item, ($$anchor, Menubar_Item_18) => {
											Menubar_Item_18($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Toggle Fullscreen');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});
										});

										var node_51 = $.sibling(node_50, 2);

										$.component(node_51, () => Menubar.Separator, ($$anchor, Menubar_Separator_7) => {
											Menubar_Separator_7($$anchor, {});
										});

										var node_52 = $.sibling(node_51, 2);

										$.component(node_52, () => Menubar.Item, ($$anchor, Menubar_Item_19) => {
											Menubar_Item_19($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_26 = $.text('Hide Sidebar');

													$.append($$anchor, text_26);
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

				var node_53 = $.sibling(node_39, 2);

				$.component(node_53, () => Menubar.Menu, ($$anchor, Menubar_Menu_3) => {
					Menubar_Menu_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_3();
							var node_54 = $.first_child(fragment_19);

							$.component(node_54, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_3) => {
								Menubar_Trigger_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_27 = $.text('Profiles');

										$.append($$anchor, text_27);
									},
									$$slots: { default: true }
								});
							});

							var node_55 = $.sibling(node_54, 2);

							$.component(node_55, () => Menubar.Content, ($$anchor, Menubar_Content_3) => {
								Menubar_Content_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_20 = root_8();
										var node_56 = $.first_child(fragment_20);

										$.component(node_56, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup) => {
											Menubar_RadioGroup($$anchor, {
												get value() {
													return $.get(profileRadioValue);
												},

												set value($$value) {
													$.set(profileRadioValue, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_21 = root_2();
													var node_57 = $.first_child(fragment_21);

													$.component(node_57, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem) => {
														Menubar_RadioItem($$anchor, {
															value: 'andy',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_28 = $.text('Andy');

																$.append($$anchor, text_28);
															},
															$$slots: { default: true }
														});
													});

													var node_58 = $.sibling(node_57, 2);

													$.component(node_58, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_1) => {
														Menubar_RadioItem_1($$anchor, {
															value: 'benoit',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_29 = $.text('Benoit');

																$.append($$anchor, text_29);
															},
															$$slots: { default: true }
														});
													});

													var node_59 = $.sibling(node_58, 2);

													$.component(node_59, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_2) => {
														Menubar_RadioItem_2($$anchor, {
															value: 'Luis',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_30 = $.text('Luis');

																$.append($$anchor, text_30);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_21);
												},
												$$slots: { default: true }
											});
										});

										var node_60 = $.sibling(node_56, 2);

										$.component(node_60, () => Menubar.Separator, ($$anchor, Menubar_Separator_8) => {
											Menubar_Separator_8($$anchor, {});
										});

										var node_61 = $.sibling(node_60, 2);

										$.component(node_61, () => Menubar.Item, ($$anchor, Menubar_Item_20) => {
											Menubar_Item_20($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_31 = $.text('Edit...');

													$.append($$anchor, text_31);
												},
												$$slots: { default: true }
											});
										});

										var node_62 = $.sibling(node_61, 2);

										$.component(node_62, () => Menubar.Separator, ($$anchor, Menubar_Separator_9) => {
											Menubar_Separator_9($$anchor, {});
										});

										var node_63 = $.sibling(node_62, 2);

										$.component(node_63, () => Menubar.Item, ($$anchor, Menubar_Item_21) => {
											Menubar_Item_21($$anchor, {
												inset: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_32 = $.text('Add Profile...');

													$.append($$anchor, text_32);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_20);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_19);
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