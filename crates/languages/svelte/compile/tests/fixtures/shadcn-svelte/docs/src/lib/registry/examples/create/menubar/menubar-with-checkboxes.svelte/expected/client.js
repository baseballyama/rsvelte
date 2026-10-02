import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Reload <!>`, 1);
var root_1 = $.from_html(`Force Reload <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Menubar_with_checkboxes($$anchor) {
	Example($$anchor, {
		title: 'With Checkboxes',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
				Menubar_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
							Menubar_Menu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_3();
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
											class: 'w-64',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_2();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem) => {
													Menubar_CheckboxItem($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Always Show Bookmarks Bar');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_1) => {
													Menubar_CheckboxItem_1($$anchor, {
														checked: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Always Show Full URLs');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
													Menubar_Separator($$anchor, {});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Menubar.Item, ($$anchor, Menubar_Item) => {
													Menubar_Item($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root();
															var node_8 = $.sibling($.first_child(fragment_5));

															$.component(node_8, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut) => {
																Menubar_Shortcut($$anchor, {
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

												$.component(node_9, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
													Menubar_Item_1($$anchor, {
														disabled: true,
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root_1();
															var node_10 = $.sibling($.first_child(fragment_6));

															$.component(node_10, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_1) => {
																Menubar_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⇧⌘R');

																		$.append($$anchor, text_4);
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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_1, 2);

						$.component(node_11, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
							Menubar_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();
									var node_12 = $.first_child(fragment_7);

									$.component(node_12, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
										Menubar_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Format');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
										Menubar_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_4();
												var node_14 = $.first_child(fragment_8);

												$.component(node_14, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_2) => {
													Menubar_CheckboxItem_2($$anchor, {
														checked: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Strikethrough');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_3) => {
													Menubar_CheckboxItem_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Code');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_15, 2);

												$.component(node_16, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_4) => {
													Menubar_CheckboxItem_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Superscript');

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

									$.append($$anchor, fragment_7);
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