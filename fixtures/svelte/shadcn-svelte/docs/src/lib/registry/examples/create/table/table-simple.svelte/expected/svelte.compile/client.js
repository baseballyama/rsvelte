import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Table_simple($$anchor) {
	Example($$anchor, {
		title: 'Simple',
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

															var text = $.text('Name');

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

															var text_1 = $.text('Email');

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

															var text_2 = $.text('Role');

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

															var text_3 = $.text('Sarah Chen');

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

															var text_4 = $.text('sarah.chen@acme.com');

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
															$.next();

															var text_5 = $.text('Admin');

															$.append($$anchor, text_5);
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
												var fragment_7 = root();
												var node_12 = $.first_child(fragment_7);

												$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_3) => {
													Table_Cell_3($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Marc Rodriguez');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_4) => {
													Table_Cell_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('marcus.rodriguez@acme.com');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_5) => {
													Table_Cell_5($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('User');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_11, 2);

									$.component(node_15, () => Table.Row, ($$anchor, Table_Row_3) => {
										Table_Row_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_16 = $.first_child(fragment_8);

												$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell_6) => {
													Table_Cell_6($$anchor, {
														class: 'font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Emily Watson');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_7) => {
													Table_Cell_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('emily.watson@acme.com');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_8) => {
													Table_Cell_8($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('User');

															$.append($$anchor, text_11);
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