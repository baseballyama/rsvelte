import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Invoice($$anchor, $$props) {
	$.push($$props, true);

	const INVOICE_ITEMS = [
		{ item: "Design System License", qty: 1, unitPrice: 499 },
		{ item: "Priority Support", qty: 12, unitPrice: 99 },
		{ item: "Custom Components", qty: 3, unitPrice: 250 }
	];

	const subtotal = INVOICE_ITEMS.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
	const tax = 0;
	const totalDue = subtotal + tax;

	function formatCurrency(value) {
		return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
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

										var text = $.text('Invoice #INV-2847');

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

										var text_1 = $.text('Due March 30, 2026');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'secondary',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Pending');

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
										var fragment_5 = root_2();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Table.Header, ($$anchor, Table_Header) => {
											Table_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Table.Row, ($$anchor, Table_Row) => {
														Table_Row($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_1();
																var node_9 = $.first_child(fragment_7);

																$.component(node_9, () => Table.Head, ($$anchor, Table_Head) => {
																	Table_Head($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Item');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Table.Head, ($$anchor, Table_Head_1) => {
																	Table_Head_1($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Qty');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_11 = $.sibling(node_10, 2);

																$.component(node_11, () => Table.Head, ($$anchor, Table_Head_2) => {
																	Table_Head_2($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Rate');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_12 = $.sibling(node_11, 2);

																$.component(node_12, () => Table.Head, ($$anchor, Table_Head_3) => {
																	Table_Head_3($$anchor, {
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Amount');

																			$.append($$anchor, text_6);
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

										var node_13 = $.sibling(node_7, 2);

										$.component(node_13, () => Table.Body, ($$anchor, Table_Body) => {
											Table_Body($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_14 = $.first_child(fragment_8);

													$.each(node_14, 17, () => INVOICE_ITEMS, $.index, ($$anchor, row) => {
														var fragment_9 = $.comment();
														var node_15 = $.first_child(fragment_9);

														$.component(node_15, () => Table.Row, ($$anchor, Table_Row_1) => {
															Table_Row_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root_1();
																	var node_16 = $.first_child(fragment_10);

																	$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell) => {
																		Table_Cell($$anchor, {
																			class: 'text-sm',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_7 = $.text();

																				$.template_effect(() => $.set_text(text_7, $.get(row).item));
																				$.append($$anchor, text_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_17 = $.sibling(node_16, 2);

																	$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																		Table_Cell_1($$anchor, {
																			class: 'text-right tabular-nums',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_8 = $.text();

																				$.template_effect(() => $.set_text(text_8, $.get(row).qty));
																				$.append($$anchor, text_8);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_18 = $.sibling(node_17, 2);

																	$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																		Table_Cell_2($$anchor, {
																			class: 'text-right tabular-nums',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text();

																				$.template_effect(($0) => $.set_text(text_9, $0), [() => formatCurrency($.get(row).unitPrice)]);
																				$.append($$anchor, text_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_19 = $.sibling(node_18, 2);

																	$.component(node_19, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																		Table_Cell_3($$anchor, {
																			class: 'text-right tabular-nums',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_10 = $.text();

																				$.template_effect(($0) => $.set_text(text_10, $0), [() => formatCurrency($.get(row).qty * $.get(row).unitPrice)]);
																				$.append($$anchor, text_10);
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
													});

													var node_20 = $.sibling(node_14, 2);

													$.component(node_20, () => Table.Row, ($$anchor, Table_Row_2) => {
														Table_Row_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = root_2();
																var node_21 = $.first_child(fragment_15);

																$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																	Table_Cell_4($$anchor, {
																		colspan: 3,
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('Subtotal');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_22 = $.sibling(node_21, 2);

																$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_5) => {
																	Table_Cell_5($$anchor, {
																		class: 'text-right tabular-nums',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text();

																			$.template_effect(($0) => $.set_text(text_12, $0), [() => formatCurrency(subtotal)]);
																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_20, 2);

													$.component(node_23, () => Table.Row, ($$anchor, Table_Row_3) => {
														Table_Row_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root_2();
																var node_24 = $.first_child(fragment_17);

																$.component(node_24, () => Table.Cell, ($$anchor, Table_Cell_6) => {
																	Table_Cell_6($$anchor, {
																		colspan: 3,
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_13 = $.text('Tax');

																			$.append($$anchor, text_13);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_25 = $.sibling(node_24, 2);

																$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_7) => {
																	Table_Cell_7($$anchor, {
																		class: 'text-right tabular-nums',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_14 = $.text('$0.00');

																			$.append($$anchor, text_14);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_23, 2);

													$.component(node_26, () => Table.Row, ($$anchor, Table_Row_4) => {
														Table_Row_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_18 = root_2();
																var node_27 = $.first_child(fragment_18);

																$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_8) => {
																	Table_Cell_8($$anchor, {
																		colspan: 3,
																		class: 'text-right',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_15 = $.text('Total Due');

																			$.append($$anchor, text_15);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_28 = $.sibling(node_27, 2);

																$.component(node_28, () => Table.Cell, ($$anchor, Table_Cell_9) => {
																	Table_Cell_9($$anchor, {
																		class: 'text-right tabular-nums',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_16 = $.text();

																			$.template_effect(($0) => $.set_text(text_16, $0), [() => formatCurrency(totalDue)]);
																			$.append($$anchor, text_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_18);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
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

				var node_29 = $.sibling(node_5, 2);

				$.component(node_29, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = root_2();
							var node_30 = $.first_child(fragment_20);

							Button(node_30, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Download PDF');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_31 = $.sibling(node_30, 2);

							Button(node_31, {
								size: 'sm',
								class: 'ml-auto',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Pay Now');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_20);
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
	$.pop();
}