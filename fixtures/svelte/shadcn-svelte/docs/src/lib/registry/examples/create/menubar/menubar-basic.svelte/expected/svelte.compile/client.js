import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`New Tab <!>`, 1);
var root_1 = $.from_html(`New Window <!>`, 1);
var root_2 = $.from_html(`Print... <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`Undo <!>`, 1);
var root_6 = $.from_html(`Redo <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Menubar_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
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
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_3();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Menubar.Item, ($$anchor, Menubar_Item) => {
													Menubar_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root();
															var node_5 = $.sibling($.first_child(fragment_5));

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

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_4, 2);

												$.component(node_6, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
													Menubar_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root_1();
															var node_7 = $.sibling($.first_child(fragment_6));

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

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_6, 2);

												$.component(node_8, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
													Menubar_Item_2($$anchor, {
														disabled: true,
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

												$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
													Menubar_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_7 = root_2();
															var node_11 = $.sibling($.first_child(fragment_7));

															$.component(node_11, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_2) => {
																Menubar_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘P');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_1, 2);

						$.component(node_12, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
							Menubar_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_13 = $.first_child(fragment_8);

									$.component(node_13, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
										Menubar_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Edit');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
										Menubar_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_7();
												var node_15 = $.first_child(fragment_9);

												$.component(node_15, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
													Menubar_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_10 = root_5();
															var node_16 = $.sibling($.first_child(fragment_10));

															$.component(node_16, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_3) => {
																Menubar_Shortcut_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('⌘Z');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_15, 2);

												$.component(node_17, () => Menubar.Item, ($$anchor, Menubar_Item_5) => {
													Menubar_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_11 = root_6();
															var node_18 = $.sibling($.first_child(fragment_11));

															$.component(node_18, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_4) => {
																Menubar_Shortcut_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('⇧⌘Z');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_17, 2);

												$.component(node_19, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
													Menubar_Separator_1($$anchor, {});
												});

												var node_20 = $.sibling(node_19, 2);

												$.component(node_20, () => Menubar.Item, ($$anchor, Menubar_Item_6) => {
													Menubar_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Cut');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => Menubar.Item, ($$anchor, Menubar_Item_7) => {
													Menubar_Item_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Copy');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_22 = $.sibling(node_21, 2);

												$.component(node_22, () => Menubar.Item, ($$anchor, Menubar_Item_8) => {
													Menubar_Item_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Paste');

															$.append($$anchor, text_10);
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