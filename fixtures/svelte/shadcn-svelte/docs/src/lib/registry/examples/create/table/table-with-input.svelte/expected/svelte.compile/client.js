import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Table from "$lib/registry/ui/table/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Table_with_input($$anchor) {
	Example($$anchor, {
		title: 'With Input',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
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

															var text_1 = $.text('Quantity');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Price');

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
															Input($$anchor, { type: 'number', value: '1', class: 'h-8 w-20', min: '0' });
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_2) => {
													Table_Cell_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('$29.99');

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

									var node_11 = $.sibling(node_7, 2);

									$.component(node_11, () => Table.Row, ($$anchor, Table_Row_2) => {
										Table_Row_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_3) => {
													Table_Cell_3($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Mechanical Keyboard');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_4) => {
													Table_Cell_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Input($$anchor, { type: 'number', value: '2', class: 'h-8 w-20', min: '0' });
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_5) => {
													Table_Cell_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('$129.99');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_11, 2);

									$.component(node_15, () => Table.Row, ($$anchor, Table_Row_3) => {
										Table_Row_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_16 = $.first_child(fragment_10);

												$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell_6) => {
													Table_Cell_6($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('USB-C Hub');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_7) => {
													Table_Cell_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Input($$anchor, { type: 'number', value: '1', class: 'h-8 w-20', min: '0' });
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_8) => {
													Table_Cell_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('$49.99');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
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