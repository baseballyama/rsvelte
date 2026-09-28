import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Media`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> Link <!>`, 1);
var root_4 = $.from_html(`<!> Table`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> Find & Replace <!>`, 1);
var root_7 = $.from_html(`<!> Spell Check`, 1);

export default function Menubar_insert($$anchor) {
	Example($$anchor, {
		title: 'Insert',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
				Menubar_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
							Menubar_Menu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Menubar.Trigger, ($$anchor, Menubar_Trigger) => {
										Menubar_Trigger($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Insert');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Menubar.Content, ($$anchor, Menubar_Content) => {
										Menubar_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_5();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Menubar.Sub, ($$anchor, Menubar_Sub) => {
													Menubar_Sub($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_2();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger) => {
																Menubar_SubTrigger($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root();
																		var node_6 = $.first_child(fragment_6);

																		IconPlaceholder(node_6, {
																			lucide: 'ImageIcon',
																			tabler: 'IconPhoto',
																			hugeicons: 'ImageIcon',
																			phosphor: 'ImageIcon',
																			remixicon: 'RiImageLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_5, 2);

															$.component(node_7, () => Menubar.SubContent, ($$anchor, Menubar_SubContent) => {
																Menubar_SubContent($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_1();
																		var node_8 = $.first_child(fragment_7);

																		$.component(node_8, () => Menubar.Item, ($$anchor, Menubar_Item) => {
																			Menubar_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('Image');

																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_9 = $.sibling(node_8, 2);

																		$.component(node_9, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
																			Menubar_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Video');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_10 = $.sibling(node_9, 2);

																		$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
																			Menubar_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('Audio');

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

												$.component(node_12, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
													Menubar_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_3();
															var node_13 = $.first_child(fragment_8);

															IconPlaceholder(node_13, {
																lucide: 'LinkIcon',
																tabler: 'IconLink',
																hugeicons: 'LinkIcon',
																phosphor: 'LinkIcon',
																remixicon: 'RiLinksLine'
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut) => {
																Menubar_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘K');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_12, 2);

												$.component(node_15, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
													Menubar_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_4();
															var node_16 = $.first_child(fragment_9);

															IconPlaceholder(node_16, {
																lucide: 'TableIcon',
																tabler: 'IconTable',
																hugeicons: 'TableIcon',
																phosphor: 'TableIcon',
																remixicon: 'RiTableLine'
															});

															$.next();
															$.append($$anchor, fragment_9);
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

						var node_17 = $.sibling(node_1, 2);

						$.component(node_17, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
							Menubar_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_2();
									var node_18 = $.first_child(fragment_10);

									$.component(node_18, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
										Menubar_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Tools');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
										Menubar_Content_1($$anchor, {
											class: 'w-44',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_2();
												var node_20 = $.first_child(fragment_11);

												$.component(node_20, () => Menubar.Item, ($$anchor, Menubar_Item_5) => {
													Menubar_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root_6();
															var node_21 = $.first_child(fragment_12);

															IconPlaceholder(node_21, {
																lucide: 'SearchIcon',
																tabler: 'IconSearch',
																hugeicons: 'SearchIcon',
																phosphor: 'MagnifyingGlassIcon',
																remixicon: 'RiSearchLine'
															});

															var node_22 = $.sibling(node_21, 2);

															$.component(node_22, () => Menubar.Shortcut, ($$anchor, Menubar_Shortcut_1) => {
																Menubar_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('⌘F');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_20, 2);

												$.component(node_23, () => Menubar.Item, ($$anchor, Menubar_Item_6) => {
													Menubar_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_7();
															var node_24 = $.first_child(fragment_13);

															IconPlaceholder(node_24, {
																lucide: 'CheckIcon',
																tabler: 'IconCheck',
																hugeicons: 'Tick02Icon',
																phosphor: 'CheckIcon',
																remixicon: 'RiCheckLine'
															});

															$.next();
															$.append($$anchor, fragment_13);
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