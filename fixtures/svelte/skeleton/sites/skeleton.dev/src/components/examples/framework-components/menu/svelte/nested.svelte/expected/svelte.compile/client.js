import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Nested($$anchor) {
	Menu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Open Menu');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_2();
											var node_4 = $.first_child(fragment_4);

											Menu(node_4, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Menu.TriggerItem, ($$anchor, Menu_TriggerItem) => {
														Menu_TriggerItem($$anchor, {
															value: 'new',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_6 = $.first_child(fragment_6);

																$.component(node_6, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
																	Menu_ItemText($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('New');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_7 = $.sibling(node_6, 2);

																$.component(node_7, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator) => {
																	Menu_ItemIndicator($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			ChevronRightIcon($$anchor, { class: 'size-4' });
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_5, 2);

													Portal(node_8, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_9 = $.first_child(fragment_8);

															$.component(node_9, () => Menu.Positioner, ($$anchor, Menu_Positioner_1) => {
																Menu_Positioner_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = $.comment();
																		var node_10 = $.first_child(fragment_9);

																		$.component(node_10, () => Menu.Content, ($$anchor, Menu_Content_1) => {
																			Menu_Content_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root_1();
																					var node_11 = $.first_child(fragment_10);

																					$.component(node_11, () => Menu.Item, ($$anchor, Menu_Item) => {
																						Menu_Item($$anchor, {
																							value: 'project',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = $.comment();
																								var node_12 = $.first_child(fragment_11);

																								$.component(node_12, () => Menu.ItemText, ($$anchor, Menu_ItemText_1) => {
																									Menu_ItemText_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_2 = $.text('New Project');

																											$.append($$anchor, text_2);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_13 = $.sibling(node_11, 2);

																					$.component(node_13, () => Menu.Item, ($$anchor, Menu_Item_1) => {
																						Menu_Item_1($$anchor, {
																							value: 'file',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = $.comment();
																								var node_14 = $.first_child(fragment_12);

																								$.component(node_14, () => Menu.ItemText, ($$anchor, Menu_ItemText_2) => {
																									Menu_ItemText_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('New File');

																											$.append($$anchor, text_3);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_15 = $.sibling(node_13, 2);

																					$.component(node_15, () => Menu.Item, ($$anchor, Menu_Item_2) => {
																						Menu_Item_2($$anchor, {
																							value: 'folder',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_13 = $.comment();
																								var node_16 = $.first_child(fragment_13);

																								$.component(node_16, () => Menu.ItemText, ($$anchor, Menu_ItemText_3) => {
																									Menu_ItemText_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('New Folder');

																											$.append($$anchor, text_4);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_13);
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

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});

											var node_17 = $.sibling(node_4, 2);

											$.component(node_17, () => Menu.Item, ($$anchor, Menu_Item_3) => {
												Menu_Item_3($$anchor, {
													value: 'open',
													children: ($$anchor, $$slotProps) => {
														var fragment_14 = $.comment();
														var node_18 = $.first_child(fragment_14);

														$.component(node_18, () => Menu.ItemText, ($$anchor, Menu_ItemText_4) => {
															Menu_ItemText_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text('Open File');

																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_14);
													},
													$$slots: { default: true }
												});
											});

											var node_19 = $.sibling(node_17, 2);

											$.component(node_19, () => Menu.Separator, ($$anchor, Menu_Separator) => {
												Menu_Separator($$anchor, {});
											});

											var node_20 = $.sibling(node_19, 2);

											$.component(node_20, () => Menu.Item, ($$anchor, Menu_Item_4) => {
												Menu_Item_4($$anchor, {
													value: 'save',
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = $.comment();
														var node_21 = $.first_child(fragment_15);

														$.component(node_21, () => Menu.ItemText, ($$anchor, Menu_ItemText_5) => {
															Menu_ItemText_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_6 = $.text('Save');

																	$.append($$anchor, text_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_15);
													},
													$$slots: { default: true }
												});
											});

											var node_22 = $.sibling(node_20, 2);

											$.component(node_22, () => Menu.Item, ($$anchor, Menu_Item_5) => {
												Menu_Item_5($$anchor, {
													value: 'export',
													children: ($$anchor, $$slotProps) => {
														var fragment_16 = $.comment();
														var node_23 = $.first_child(fragment_16);

														$.component(node_23, () => Menu.ItemText, ($$anchor, Menu_ItemText_6) => {
															Menu_ItemText_6($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Export');

																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_16);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}