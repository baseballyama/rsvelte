import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<span class="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">Completed</span>`);
var root_2 = $.from_html(`<span class="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">High</span>`);
var root_3 = $.from_html(`<span class="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">In Progress</span>`);
var root_4 = $.from_html(`<span class="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-400">Medium</span>`);
var root_5 = $.from_html(`<span class="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-400">Pending</span>`);
var root_6 = $.from_html(`<span class="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-400">Low</span>`);
var root_7 = $.from_html(`<!> <!>`, 1);

export default function Table_with_badges($$anchor) {
	Example($$anchor, {
		title: 'With Badges',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_7();
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

															var text = $.text('Task');

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

															var text_1 = $.text('Status');

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

															var text_2 = $.text('Priority');

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

															var text_3 = $.text('Design homepage');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell_1) => {
													Table_Cell_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var span = root_1();

															$.append($$anchor, span);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_2) => {
													Table_Cell_2($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															var span_1 = root_2();

															$.append($$anchor, span_1);
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

															var text_4 = $.text('Implement API');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_4) => {
													Table_Cell_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var span_2 = root_3();

															$.append($$anchor, span_2);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_5) => {
													Table_Cell_5($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															var span_3 = root_4();

															$.append($$anchor, span_3);
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

															var text_5 = $.text('Write tests');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_7) => {
													Table_Cell_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var span_4 = root_5();

															$.append($$anchor, span_4);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_8) => {
													Table_Cell_8($$anchor, {
														class: 'text-right',
														children: ($$anchor, $$slotProps) => {
															var span_5 = root_6();

															$.append($$anchor, span_5);
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