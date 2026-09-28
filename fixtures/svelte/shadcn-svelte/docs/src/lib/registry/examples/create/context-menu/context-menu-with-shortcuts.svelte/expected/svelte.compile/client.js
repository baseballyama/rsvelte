import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Back <!>`, 1);
var root_1 = $.from_html(`Forward <!>`, 1);
var root_2 = $.from_html(`Reload <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`Save <!>`, 1);
var root_5 = $.from_html(`Save As... <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Context_menu_with_shortcuts($$anchor) {
	Example($$anchor, {
		title: 'With Shortcuts',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_6();
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
									var fragment_3 = root_3();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_3();
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

																		var text_1 = $.text('⌘[');

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
														disabled: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root_1();
															var node_7 = $.sibling($.first_child(fragment_6));

															$.component(node_7, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_1) => {
																ContextMenu_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘]');

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

												$.component(node_8, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
													ContextMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_7 = root_2();
															var node_9 = $.sibling($.first_child(fragment_7));

															$.component(node_9, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_2) => {
																ContextMenu_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘R');

																		$.append($$anchor, text_3);
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

									var node_10 = $.sibling(node_3, 2);

									$.component(node_10, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
										ContextMenu_Separator($$anchor, {});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
										ContextMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_6();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
													ContextMenu_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_9 = root_4();
															var node_13 = $.sibling($.first_child(fragment_9));

															$.component(node_13, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_3) => {
																ContextMenu_Shortcut_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘S');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_12, 2);

												$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
													ContextMenu_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_10 = root_5();
															var node_15 = $.sibling($.first_child(fragment_10));

															$.component(node_15, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut_4) => {
																ContextMenu_Shortcut_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('⇧⌘S');

																		$.append($$anchor, text_5);
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