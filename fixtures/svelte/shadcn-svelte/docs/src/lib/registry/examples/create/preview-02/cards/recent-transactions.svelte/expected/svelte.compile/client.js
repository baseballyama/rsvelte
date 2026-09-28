import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex size-10 items-center justify-center rounded-lg bg-muted"><!></div>`);
var root_2 = $.from_html(`<div class="flex flex-col"><span class="font-medium">Blue Bottle Coffee</span> <span class="text-sm text-muted-foreground">Food & Drink</span></div>`);
var root_3 = $.from_html(`<span class="text-sm font-semibold tabular-nums">-$6.50</span>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex flex-col"><span class="font-medium">Whole Foods Market</span> <span class="text-sm text-muted-foreground">Groceries</span></div>`);
var root_7 = $.from_html(`<span class="text-sm font-semibold tabular-nums">-$142.30</span>`);
var root_8 = $.from_html(`<div class="flex flex-col"><span class="font-medium">Stripe Payout</span> <span class="text-sm text-muted-foreground">Income</span></div>`);
var root_9 = $.from_html(`<span class="text-sm font-semibold text-emerald-500 tabular-nums">+$4,200.00</span>`);
var root_10 = $.from_html(`<div class="flex flex-col"><span class="font-medium">Uber Technologies</span> <span class="text-sm text-muted-foreground">Transport</span></div>`);
var root_11 = $.from_html(`<span class="text-sm font-semibold tabular-nums">-$24.10</span>`);
var root_12 = $.from_html(`<div class="flex flex-col"><span class="font-medium">Netflix Subscription</span> <span class="text-sm text-muted-foreground">Entertainment</span></div>`);
var root_13 = $.from_html(`<span class="text-sm font-semibold tabular-nums">-$19.99</span>`);

export default function Recent_transactions($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Recent Transactions');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Your latest account activity.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'outline',
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('View All');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Table.Root, ($$anchor, Table_Root) => {
								Table_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Table.Body, ($$anchor, Table_Body) => {
											Table_Body($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_4();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Table.Row, ($$anchor, Table_Row) => {
														Table_Row($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_4();
																var node_9 = $.first_child(fragment_7);

																$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell) => {
																	Table_Cell($$anchor, {
																		class: 'w-10',
																		children: ($$anchor, $$slotProps) => {
																			var div = root_1();
																			var node_10 = $.child(div);

																			IconPlaceholder(node_10, {
																				class: 'size-4 shrink-0',
																				lucide: 'CoffeeIcon',
																				tabler: 'IconCoffee',
																				hugeicons: 'CoffeeIcon',
																				phosphor: 'CoffeeIcon',
																				remixicon: 'RiCupLine'
																			});

																			$.reset(div);
																			$.append($$anchor, div);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_11 = $.sibling(node_9, 2);

																$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																	Table_Cell_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var div_1 = root_2();

																			$.append($$anchor, div_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_12 = $.sibling(node_11, 2);

																$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																	Table_Cell_2($$anchor, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Today, 10:24 AM');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_13 = $.sibling(node_12, 2);

																$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																	Table_Cell_3($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			var span = root_3();

																			$.append($$anchor, span);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_13, 2);

																$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																	Table_Cell_4($$anchor, {
																		class: 'w-8',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = $.comment();
																			var node_15 = $.first_child(fragment_8);

																			$.component(node_15, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																				DropdownMenu_Root($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = root_5();
																						var node_16 = $.first_child(fragment_9);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;

																								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
																									children: ($$anchor, $$slotProps) => {
																										IconPlaceholder($$anchor, {
																											lucide: 'MoreHorizontalIcon',
																											tabler: 'IconDotsVertical',
																											hugeicons: 'MoreVerticalCircle01Icon',
																											phosphor: 'DotsThreeIcon',
																											remixicon: 'RiMore2Line'
																										});
																									},
																									$$slots: { default: true }
																								}));
																							};

																							$.component(node_16, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_17 = $.sibling(node_16, 2);

																						$.component(node_17, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																							DropdownMenu_Content($$anchor, {
																								align: 'end',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_12 = root_4();
																									var node_18 = $.first_child(fragment_12);

																									$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																										DropdownMenu_Item($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_4 = $.text('View details');

																												$.append($$anchor, text_4);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_19 = $.sibling(node_18, 2);

																									$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																										DropdownMenu_Item_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_5 = $.text('Add note');

																												$.append($$anchor, text_5);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_20 = $.sibling(node_19, 2);

																									$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																										DropdownMenu_Item_2($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_6 = $.text('Categorize');

																												$.append($$anchor, text_6);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_21 = $.sibling(node_20, 2);

																									$.component(node_21, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																										DropdownMenu_Separator($$anchor, {});
																									});

																									var node_22 = $.sibling(node_21, 2);

																									$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																										DropdownMenu_Item_3($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_7 = $.text('Dispute');

																												$.append($$anchor, text_7);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_12);
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

																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_8, 2);

													$.component(node_23, () => Table.Row, ($$anchor, Table_Row_1) => {
														Table_Row_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_4();
																var node_24 = $.first_child(fragment_13);

																$.component(node_24, () => Table.Cell, ($$anchor, Table_Cell_5) => {
																	Table_Cell_5($$anchor, {
																		class: 'w-10',
																		children: ($$anchor, $$slotProps) => {
																			var div_2 = root_1();
																			var node_25 = $.child(div_2);

																			IconPlaceholder(node_25, {
																				class: 'size-4 shrink-0',
																				lucide: 'ShoppingCartIcon',
																				tabler: 'IconShoppingCart',
																				hugeicons: 'ShoppingCart01Icon',
																				phosphor: 'ShoppingCartIcon',
																				remixicon: 'RiShoppingCartLine'
																			});

																			$.reset(div_2);
																			$.append($$anchor, div_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_26 = $.sibling(node_24, 2);

																$.component(node_26, () => Table.Cell, ($$anchor, Table_Cell_6) => {
																	Table_Cell_6($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var div_3 = root_6();

																			$.append($$anchor, div_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_27 = $.sibling(node_26, 2);

																$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_7) => {
																	Table_Cell_7($$anchor, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Yesterday');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_28 = $.sibling(node_27, 2);

																$.component(node_28, () => Table.Cell, ($$anchor, Table_Cell_8) => {
																	Table_Cell_8($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			var span_1 = root_7();

																			$.append($$anchor, span_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_29 = $.sibling(node_28, 2);

																$.component(node_29, () => Table.Cell, ($$anchor, Table_Cell_9) => {
																	Table_Cell_9($$anchor, {
																		class: 'w-8',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = $.comment();
																			var node_30 = $.first_child(fragment_14);

																			$.component(node_30, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
																				DropdownMenu_Root_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_15 = root_5();
																						var node_31 = $.first_child(fragment_15);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;

																								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
																									children: ($$anchor, $$slotProps) => {
																										IconPlaceholder($$anchor, {
																											lucide: 'MoreHorizontalIcon',
																											tabler: 'IconDotsVertical',
																											hugeicons: 'MoreVerticalCircle01Icon',
																											phosphor: 'DotsThreeIcon',
																											remixicon: 'RiMore2Line'
																										});
																									},
																									$$slots: { default: true }
																								}));
																							};

																							$.component(node_31, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
																								DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_32 = $.sibling(node_31, 2);

																						$.component(node_32, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
																							DropdownMenu_Content_1($$anchor, {
																								align: 'end',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_18 = root_4();
																									var node_33 = $.first_child(fragment_18);

																									$.component(node_33, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																										DropdownMenu_Item_4($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_9 = $.text('View details');

																												$.append($$anchor, text_9);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_34 = $.sibling(node_33, 2);

																									$.component(node_34, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																										DropdownMenu_Item_5($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_10 = $.text('Add note');

																												$.append($$anchor, text_10);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_35 = $.sibling(node_34, 2);

																									$.component(node_35, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																										DropdownMenu_Item_6($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_11 = $.text('Categorize');

																												$.append($$anchor, text_11);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_36 = $.sibling(node_35, 2);

																									$.component(node_36, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																										DropdownMenu_Separator_1($$anchor, {});
																									});

																									var node_37 = $.sibling(node_36, 2);

																									$.component(node_37, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																										DropdownMenu_Item_7($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_12 = $.text('Dispute');

																												$.append($$anchor, text_12);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_18);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_15);
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

													var node_38 = $.sibling(node_23, 2);

													$.component(node_38, () => Table.Row, ($$anchor, Table_Row_2) => {
														Table_Row_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = root_4();
																var node_39 = $.first_child(fragment_19);

																$.component(node_39, () => Table.Cell, ($$anchor, Table_Cell_10) => {
																	Table_Cell_10($$anchor, {
																		class: 'w-10',
																		children: ($$anchor, $$slotProps) => {
																			var div_4 = root_1();
																			var node_40 = $.child(div_4);

																			IconPlaceholder(node_40, {
																				class: 'size-4 shrink-0',
																				lucide: 'WalletIcon',
																				tabler: 'IconWallet',
																				hugeicons: 'Wallet01Icon',
																				phosphor: 'WalletIcon',
																				remixicon: 'RiWalletLine'
																			});

																			$.reset(div_4);
																			$.append($$anchor, div_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_41 = $.sibling(node_39, 2);

																$.component(node_41, () => Table.Cell, ($$anchor, Table_Cell_11) => {
																	Table_Cell_11($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var div_5 = root_8();

																			$.append($$anchor, div_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_42 = $.sibling(node_41, 2);

																$.component(node_42, () => Table.Cell, ($$anchor, Table_Cell_12) => {
																	Table_Cell_12($$anchor, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_13 = $.text('Oct 12');

																			$.append($$anchor, text_13);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_43 = $.sibling(node_42, 2);

																$.component(node_43, () => Table.Cell, ($$anchor, Table_Cell_13) => {
																	Table_Cell_13($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			var span_2 = root_9();

																			$.append($$anchor, span_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_44 = $.sibling(node_43, 2);

																$.component(node_44, () => Table.Cell, ($$anchor, Table_Cell_14) => {
																	Table_Cell_14($$anchor, {
																		class: 'w-8',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_20 = $.comment();
																			var node_45 = $.first_child(fragment_20);

																			$.component(node_45, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_2) => {
																				DropdownMenu_Root_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_21 = root_5();
																						var node_46 = $.first_child(fragment_21);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;

																								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
																									children: ($$anchor, $$slotProps) => {
																										IconPlaceholder($$anchor, {
																											lucide: 'MoreHorizontalIcon',
																											tabler: 'IconDotsVertical',
																											hugeicons: 'MoreVerticalCircle01Icon',
																											phosphor: 'DotsThreeIcon',
																											remixicon: 'RiMore2Line'
																										});
																									},
																									$$slots: { default: true }
																								}));
																							};

																							$.component(node_46, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_2) => {
																								DropdownMenu_Trigger_2($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_47 = $.sibling(node_46, 2);

																						$.component(node_47, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_2) => {
																							DropdownMenu_Content_2($$anchor, {
																								align: 'end',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_24 = root_4();
																									var node_48 = $.first_child(fragment_24);

																									$.component(node_48, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
																										DropdownMenu_Item_8($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_14 = $.text('View details');

																												$.append($$anchor, text_14);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_49 = $.sibling(node_48, 2);

																									$.component(node_49, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
																										DropdownMenu_Item_9($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_15 = $.text('Add note');

																												$.append($$anchor, text_15);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_50 = $.sibling(node_49, 2);

																									$.component(node_50, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
																										DropdownMenu_Item_10($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_16 = $.text('Categorize');

																												$.append($$anchor, text_16);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_51 = $.sibling(node_50, 2);

																									$.component(node_51, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
																										DropdownMenu_Separator_2($$anchor, {});
																									});

																									var node_52 = $.sibling(node_51, 2);

																									$.component(node_52, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
																										DropdownMenu_Item_11($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_17 = $.text('Dispute');

																												$.append($$anchor, text_17);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_24);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_21);
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

													var node_53 = $.sibling(node_38, 2);

													$.component(node_53, () => Table.Row, ($$anchor, Table_Row_3) => {
														Table_Row_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_25 = root_4();
																var node_54 = $.first_child(fragment_25);

																$.component(node_54, () => Table.Cell, ($$anchor, Table_Cell_15) => {
																	Table_Cell_15($$anchor, {
																		class: 'w-10',
																		children: ($$anchor, $$slotProps) => {
																			var div_6 = root_1();
																			var node_55 = $.child(div_6);

																			IconPlaceholder(node_55, {
																				class: 'size-4 shrink-0',
																				lucide: 'CarIcon',
																				tabler: 'IconCar',
																				hugeicons: 'Car01Icon',
																				phosphor: 'CarIcon',
																				remixicon: 'RiCarLine'
																			});

																			$.reset(div_6);
																			$.append($$anchor, div_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_56 = $.sibling(node_54, 2);

																$.component(node_56, () => Table.Cell, ($$anchor, Table_Cell_16) => {
																	Table_Cell_16($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var div_7 = root_10();

																			$.append($$anchor, div_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_57 = $.sibling(node_56, 2);

																$.component(node_57, () => Table.Cell, ($$anchor, Table_Cell_17) => {
																	Table_Cell_17($$anchor, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_18 = $.text('Oct 11');

																			$.append($$anchor, text_18);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_58 = $.sibling(node_57, 2);

																$.component(node_58, () => Table.Cell, ($$anchor, Table_Cell_18) => {
																	Table_Cell_18($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			var span_3 = root_11();

																			$.append($$anchor, span_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_59 = $.sibling(node_58, 2);

																$.component(node_59, () => Table.Cell, ($$anchor, Table_Cell_19) => {
																	Table_Cell_19($$anchor, {
																		class: 'w-8',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_26 = $.comment();
																			var node_60 = $.first_child(fragment_26);

																			$.component(node_60, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_3) => {
																				DropdownMenu_Root_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_27 = root_5();
																						var node_61 = $.first_child(fragment_27);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;

																								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
																									children: ($$anchor, $$slotProps) => {
																										IconPlaceholder($$anchor, {
																											lucide: 'MoreHorizontalIcon',
																											tabler: 'IconDotsVertical',
																											hugeicons: 'MoreVerticalCircle01Icon',
																											phosphor: 'DotsThreeIcon',
																											remixicon: 'RiMore2Line'
																										});
																									},
																									$$slots: { default: true }
																								}));
																							};

																							$.component(node_61, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_3) => {
																								DropdownMenu_Trigger_3($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_62 = $.sibling(node_61, 2);

																						$.component(node_62, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_3) => {
																							DropdownMenu_Content_3($$anchor, {
																								align: 'end',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_30 = root_4();
																									var node_63 = $.first_child(fragment_30);

																									$.component(node_63, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_12) => {
																										DropdownMenu_Item_12($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_19 = $.text('View details');

																												$.append($$anchor, text_19);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_64 = $.sibling(node_63, 2);

																									$.component(node_64, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_13) => {
																										DropdownMenu_Item_13($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_20 = $.text('Add note');

																												$.append($$anchor, text_20);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_65 = $.sibling(node_64, 2);

																									$.component(node_65, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_14) => {
																										DropdownMenu_Item_14($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_21 = $.text('Categorize');

																												$.append($$anchor, text_21);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_66 = $.sibling(node_65, 2);

																									$.component(node_66, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
																										DropdownMenu_Separator_3($$anchor, {});
																									});

																									var node_67 = $.sibling(node_66, 2);

																									$.component(node_67, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_15) => {
																										DropdownMenu_Item_15($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_22 = $.text('Dispute');

																												$.append($$anchor, text_22);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_30);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_27);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_26);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_25);
															},
															$$slots: { default: true }
														});
													});

													var node_68 = $.sibling(node_53, 2);

													$.component(node_68, () => Table.Row, ($$anchor, Table_Row_4) => {
														Table_Row_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_31 = root_4();
																var node_69 = $.first_child(fragment_31);

																$.component(node_69, () => Table.Cell, ($$anchor, Table_Cell_20) => {
																	Table_Cell_20($$anchor, {
																		class: 'w-10',
																		children: ($$anchor, $$slotProps) => {
																			var div_8 = root_1();
																			var node_70 = $.child(div_8);

																			IconPlaceholder(node_70, {
																				class: 'size-4 shrink-0',
																				lucide: 'TvIcon',
																				tabler: 'IconDeviceTv',
																				hugeicons: 'Tv01Icon',
																				phosphor: 'TelevisionIcon',
																				remixicon: 'RiTvLine'
																			});

																			$.reset(div_8);
																			$.append($$anchor, div_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_71 = $.sibling(node_69, 2);

																$.component(node_71, () => Table.Cell, ($$anchor, Table_Cell_21) => {
																	Table_Cell_21($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var div_9 = root_12();

																			$.append($$anchor, div_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_72 = $.sibling(node_71, 2);

																$.component(node_72, () => Table.Cell, ($$anchor, Table_Cell_22) => {
																	Table_Cell_22($$anchor, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_23 = $.text('Oct 10');

																			$.append($$anchor, text_23);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_73 = $.sibling(node_72, 2);

																$.component(node_73, () => Table.Cell, ($$anchor, Table_Cell_23) => {
																	Table_Cell_23($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			var span_4 = root_13();

																			$.append($$anchor, span_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_74 = $.sibling(node_73, 2);

																$.component(node_74, () => Table.Cell, ($$anchor, Table_Cell_24) => {
																	Table_Cell_24($$anchor, {
																		class: 'w-8',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_32 = $.comment();
																			var node_75 = $.first_child(fragment_32);

																			$.component(node_75, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_4) => {
																				DropdownMenu_Root_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_33 = root_5();
																						var node_76 = $.first_child(fragment_33);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;

																								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
																									children: ($$anchor, $$slotProps) => {
																										IconPlaceholder($$anchor, {
																											lucide: 'MoreHorizontalIcon',
																											tabler: 'IconDotsVertical',
																											hugeicons: 'MoreVerticalCircle01Icon',
																											phosphor: 'DotsThreeIcon',
																											remixicon: 'RiMore2Line'
																										});
																									},
																									$$slots: { default: true }
																								}));
																							};

																							$.component(node_76, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_4) => {
																								DropdownMenu_Trigger_4($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_77 = $.sibling(node_76, 2);

																						$.component(node_77, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_4) => {
																							DropdownMenu_Content_4($$anchor, {
																								align: 'end',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_36 = root_4();
																									var node_78 = $.first_child(fragment_36);

																									$.component(node_78, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_16) => {
																										DropdownMenu_Item_16($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_24 = $.text('View details');

																												$.append($$anchor, text_24);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_79 = $.sibling(node_78, 2);

																									$.component(node_79, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_17) => {
																										DropdownMenu_Item_17($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_25 = $.text('Add note');

																												$.append($$anchor, text_25);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_80 = $.sibling(node_79, 2);

																									$.component(node_80, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_18) => {
																										DropdownMenu_Item_18($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_26 = $.text('Categorize');

																												$.append($$anchor, text_26);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_81 = $.sibling(node_80, 2);

																									$.component(node_81, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_4) => {
																										DropdownMenu_Separator_4($$anchor, {});
																									});

																									var node_82 = $.sibling(node_81, 2);

																									$.component(node_82, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_19) => {
																										DropdownMenu_Item_19($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_27 = $.text('Dispute');

																												$.append($$anchor, text_27);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_36);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_33);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_32);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_31);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
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