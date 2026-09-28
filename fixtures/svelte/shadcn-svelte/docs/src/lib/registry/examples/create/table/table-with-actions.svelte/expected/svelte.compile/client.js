import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Open menu</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Table_with_actions($$anchor) {
	Example($$anchor, {
		title: 'With Actions',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Product');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Price');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Actions');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => Table.Row, ($$anchor, Table_Row_1) => {
										Table_Row_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Wireless Mouse');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell_1) => {
													Table_Cell_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('$29.99');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_2) => {
													Table_Cell_2($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_11 = $.first_child(fragment_7);

															$.component(node_11, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																DropdownMenu_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_3();
																		var node_12 = $.first_child(fragment_8);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;

																				Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon', class: 'size-8' }, props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root_1();
																						var node_13 = $.first_child(fragment_10);

																						IconPlaceholder(node_13, {
																							lucide: 'MoreHorizontalIcon',
																							tabler: 'IconDots',
																							hugeicons: 'MoreHorizontalCircle01Icon',
																							phosphor: 'DotsThreeOutlineIcon',
																							remixicon: 'RiMoreLine'
																						});

																						$.next(2);
																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				}));
																			};

																			$.component(node_12, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																				DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_14 = $.sibling(node_12, 2);

																		$.component(node_14, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																			DropdownMenu_Content($$anchor, {
																				align: 'end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_2();
																					var node_15 = $.first_child(fragment_11);

																					$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																						DropdownMenu_Item($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text('Edit');

																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_16 = $.sibling(node_15, 2);

																					$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																						DropdownMenu_Item_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('Duplicate');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_17 = $.sibling(node_16, 2);

																					$.component(node_17, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																						DropdownMenu_Separator($$anchor, {});
																					});

																					var node_18 = $.sibling(node_17, 2);

																					$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																						DropdownMenu_Item_2($$anchor, {
																							variant: 'destructive',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text('Delete');

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

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_7, 2);

									$.component(node_19, () => Table.Row, ($$anchor, Table_Row_2) => {
										Table_Row_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root();
												var node_20 = $.first_child(fragment_12);

												$.component(node_20, () => Table.Cell, ($$anchor, Table_Cell_3) => {
													Table_Cell_3($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Mechanical Keyboard');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell_4) => {
													Table_Cell_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('$129.99');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_22 = $.sibling(node_21, 2);

												$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_5) => {
													Table_Cell_5($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = $.comment();
															var node_23 = $.first_child(fragment_13);

															$.component(node_23, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
																DropdownMenu_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = root_3();
																		var node_24 = $.first_child(fragment_14);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;

																				Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon', class: 'size-8' }, props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_16 = root_1();
																						var node_25 = $.first_child(fragment_16);

																						IconPlaceholder(node_25, {
																							lucide: 'MoreHorizontalIcon',
																							tabler: 'IconDots',
																							hugeicons: 'MoreHorizontalCircle01Icon',
																							phosphor: 'DotsThreeOutlineIcon',
																							remixicon: 'RiMoreLine'
																						});

																						$.next(2);
																						$.append($$anchor, fragment_16);
																					},
																					$$slots: { default: true }
																				}));
																			};

																			$.component(node_24, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
																				DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_26 = $.sibling(node_24, 2);

																		$.component(node_26, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
																			DropdownMenu_Content_1($$anchor, {
																				align: 'end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_17 = root_2();
																					var node_27 = $.first_child(fragment_17);

																					$.component(node_27, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																						DropdownMenu_Item_3($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_10 = $.text('Edit');

																								$.append($$anchor, text_10);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_28 = $.sibling(node_27, 2);

																					$.component(node_28, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																						DropdownMenu_Item_4($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_11 = $.text('Duplicate');

																								$.append($$anchor, text_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_29 = $.sibling(node_28, 2);

																					$.component(node_29, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																						DropdownMenu_Separator_1($$anchor, {});
																					});

																					var node_30 = $.sibling(node_29, 2);

																					$.component(node_30, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																						DropdownMenu_Item_5($$anchor, {
																							variant: 'destructive',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_12 = $.text('Delete');

																								$.append($$anchor, text_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_17);
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

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									var node_31 = $.sibling(node_19, 2);

									$.component(node_31, () => Table.Row, ($$anchor, Table_Row_3) => {
										Table_Row_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root();
												var node_32 = $.first_child(fragment_18);

												$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_6) => {
													Table_Cell_6($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('USB-C Hub');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												var node_33 = $.sibling(node_32, 2);

												$.component(node_33, () => Table.Cell, ($$anchor, Table_Cell_7) => {
													Table_Cell_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('$49.99');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												var node_34 = $.sibling(node_33, 2);

												$.component(node_34, () => Table.Cell, ($$anchor, Table_Cell_8) => {
													Table_Cell_8($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															var fragment_19 = $.comment();
															var node_35 = $.first_child(fragment_19);

															$.component(node_35, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_2) => {
																DropdownMenu_Root_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_20 = root_3();
																		var node_36 = $.first_child(fragment_20);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;

																				Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon', class: 'size-8' }, props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_22 = root_1();
																						var node_37 = $.first_child(fragment_22);

																						IconPlaceholder(node_37, {
																							lucide: 'MoreHorizontalIcon',
																							tabler: 'IconDots',
																							hugeicons: 'MoreHorizontalCircle01Icon',
																							phosphor: 'DotsThreeOutlineIcon',
																							remixicon: 'RiMoreLine'
																						});

																						$.next(2);
																						$.append($$anchor, fragment_22);
																					},
																					$$slots: { default: true }
																				}));
																			};

																			$.component(node_36, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_2) => {
																				DropdownMenu_Trigger_2($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_38 = $.sibling(node_36, 2);

																		$.component(node_38, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_2) => {
																			DropdownMenu_Content_2($$anchor, {
																				align: 'end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_23 = root_2();
																					var node_39 = $.first_child(fragment_23);

																					$.component(node_39, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																						DropdownMenu_Item_6($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_15 = $.text('Edit');

																								$.append($$anchor, text_15);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_40 = $.sibling(node_39, 2);

																					$.component(node_40, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																						DropdownMenu_Item_7($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_16 = $.text('Duplicate');

																								$.append($$anchor, text_16);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_41 = $.sibling(node_40, 2);

																					$.component(node_41, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
																						DropdownMenu_Separator_2($$anchor, {});
																					});

																					var node_42 = $.sibling(node_41, 2);

																					$.component(node_42, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
																						DropdownMenu_Item_8($$anchor, {
																							variant: 'destructive',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_17 = $.text('Delete');

																								$.append($$anchor, text_17);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_23);
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

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
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