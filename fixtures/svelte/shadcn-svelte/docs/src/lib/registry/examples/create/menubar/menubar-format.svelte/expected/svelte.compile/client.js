import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Bold <!>`, 1);
var root_1 = $.from_html(`<!> Italic <!>`, 1);
var root_2 = $.from_html(`<!> Underline <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Menubar_format($$anchor) {
	Example($$anchor, {
		title: 'Format',
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

												var text = $.text('Format');

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
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															IconPlaceholder(node_5, {
																lucide: 'BoldIcon',
																tabler: 'IconBold',
																hugeicons: 'TextBoldIcon',
																phosphor: 'TextBIcon',
																remixicon: 'RiBold'
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut) => {
																Menubar_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('⌘B');

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

												var node_7 = $.sibling(node_4, 2);

												$.component(node_7, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
													Menubar_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_8 = $.first_child(fragment_6);

															IconPlaceholder(node_8, {
																lucide: 'ItalicIcon',
																tabler: 'IconItalic',
																hugeicons: 'TextItalicIcon',
																phosphor: 'TextItalicIcon',
																remixicon: 'RiItalic'
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_1) => {
																Menubar_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘I');

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

												var node_10 = $.sibling(node_7, 2);

												$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
													Menubar_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_2();
															var node_11 = $.first_child(fragment_7);

															IconPlaceholder(node_11, {
																lucide: 'UnderlineIcon',
																tabler: 'IconUnderline',
																hugeicons: 'TextUnderlineIcon',
																phosphor: 'TextUnderlineIcon',
																remixicon: 'RiUnderline'
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_2) => {
																Menubar_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘U');

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

												var node_13 = $.sibling(node_10, 2);

												$.component(node_13, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
													Menubar_Separator($$anchor, {});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem) => {
													Menubar_CheckboxItem($$anchor, {
														checked: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Strikethrough');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_1) => {
													Menubar_CheckboxItem_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Code');

															$.append($$anchor, text_5);
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

						var node_16 = $.sibling(node_1, 2);

						$.component(node_16, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
							Menubar_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_17 = $.first_child(fragment_8);

									$.component(node_17, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
										Menubar_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('View');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
										Menubar_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_5();
												var node_19 = $.first_child(fragment_9);

												$.component(node_19, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_2) => {
													Menubar_CheckboxItem_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Show Ruler');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_19, 2);

												$.component(node_20, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_3) => {
													Menubar_CheckboxItem_3($$anchor, {
														checked: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Show Grid');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
													Menubar_Separator_1($$anchor, {});
												});

												var node_22 = $.sibling(node_21, 2);

												$.component(node_22, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
													Menubar_Item_3($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Zoom In');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
													Menubar_Item_4($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Zoom Out');

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