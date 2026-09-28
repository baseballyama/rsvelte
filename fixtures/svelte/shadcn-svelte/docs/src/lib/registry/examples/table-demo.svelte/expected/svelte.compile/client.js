import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Table from "$lib/registry/ui/table/index.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Table_demo($$anchor) {
	const invoices = [
		{
			invoice: "INV001",
			paymentStatus: "Paid",
			totalAmount: "$250.00",
			paymentMethod: "Credit Card"
		},

		{
			invoice: "INV002",
			paymentStatus: "Pending",
			totalAmount: "$150.00",
			paymentMethod: "PayPal"
		},

		{
			invoice: "INV003",
			paymentStatus: "Unpaid",
			totalAmount: "$350.00",
			paymentMethod: "Bank Transfer"
		},

		{
			invoice: "INV004",
			paymentStatus: "Paid",
			totalAmount: "$450.00",
			paymentMethod: "Credit Card"
		},

		{
			invoice: "INV005",
			paymentStatus: "Paid",
			totalAmount: "$550.00",
			paymentMethod: "PayPal"
		},

		{
			invoice: "INV006",
			paymentStatus: "Pending",
			totalAmount: "$200.00",
			paymentMethod: "Bank Transfer"
		},

		{
			invoice: "INV007",
			paymentStatus: "Unpaid",
			totalAmount: "$300.00",
			paymentMethod: "Credit Card"
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Table.Caption, ($$anchor, Table_Caption) => {
					Table_Caption($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('A list of your recent invoices.');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Table.Row, ($$anchor, Table_Row) => {
								Table_Row($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Table.Head, ($$anchor, Table_Head) => {
											Table_Head($$anchor, {
												class: 'w-[100px]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Invoice');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Table.Head, ($$anchor, Table_Head_1) => {
											Table_Head_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Status');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Table.Head, ($$anchor, Table_Head_2) => {
											Table_Head_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Method');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Table.Head, ($$anchor, Table_Head_3) => {
											Table_Head_3($$anchor, {
												class: 'text-end',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Amount');

													$.append($$anchor, text_4);
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

				var node_8 = $.sibling(node_2, 2);

				$.component(node_8, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_9 = $.first_child(fragment_4);

							$.each(node_9, 16, () => invoices, (invoice) => invoice, ($$anchor, invoice) => {
								var fragment_5 = $.comment();
								var node_10 = $.first_child(fragment_5);

								$.component(node_10, () => Table.Row, ($$anchor, Table_Row_1) => {
									Table_Row_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_11 = $.first_child(fragment_6);

											$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell) => {
												Table_Cell($$anchor, {
													class: 'font-medium',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text();

														$.template_effect(() => $.set_text(text_5, invoice.invoice));
														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_1) => {
												Table_Cell_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text();

														$.template_effect(() => $.set_text(text_6, invoice.paymentStatus));
														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_12, 2);

											$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_2) => {
												Table_Cell_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_7 = $.text();

														$.template_effect(() => $.set_text(text_7, invoice.paymentMethod));
														$.append($$anchor, text_7);
													},
													$$slots: { default: true }
												});
											});

											var node_14 = $.sibling(node_13, 2);

											$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_3) => {
												Table_Cell_3($$anchor, {
													class: 'text-end',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text();

														$.template_effect(() => $.set_text(text_8, invoice.totalAmount));
														$.append($$anchor, text_8);
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
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_15 = $.sibling(node_8, 2);

				$.component(node_15, () => Table.Footer, ($$anchor, Table_Footer) => {
					Table_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = $.comment();
							var node_16 = $.first_child(fragment_11);

							$.component(node_16, () => Table.Row, ($$anchor, Table_Row_2) => {
								Table_Row_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_1();
										var node_17 = $.first_child(fragment_12);

										$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_4) => {
											Table_Cell_4($$anchor, {
												colspan: 3,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Total');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_5) => {
											Table_Cell_5($$anchor, {
												class: 'text-end',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('$2,500.00');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_11);
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