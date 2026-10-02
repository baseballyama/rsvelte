import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from "svelte/reactivity";
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Checkbox_in_table($$anchor, $$props) {
	$.push($$props, true);

	const tableData = [
		{
			id: "1",
			name: "Sarah Chen",
			email: "sarah.chen@example.com",
			role: "Admin"
		},

		{
			id: "2",
			name: "Marcus Rodriguez",
			email: "marcus.rodriguez@example.com",
			role: "User"
		},

		{
			id: "3",
			name: "Priya Patel",
			email: "priya.patel@example.com",
			role: "User"
		},

		{
			id: "4",
			name: "David Kim",
			email: "david.kim@example.com",
			role: "Editor"
		}
	];

	let selectedRows = new SvelteSet(["1"]);
	const selectAll = $.derived(() => selectedRows.size === tableData.length);

	function handleSelectAll(checked) {
		if (checked === true) {
			for (const row of tableData) {
				selectedRows.add(row.id);
			}
		} else {
			selectedRows.clear();
		}
	}

	function handleSelectRow(id, checked) {
		if (checked === true) {
			selectedRows.add(id);
		} else {
			selectedRows.delete(id);
		}
	}

	Example($$anchor, {
		title: 'In Table',
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
														class: 'w-8',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_4 = $.first_child(fragment_5);

															{
																let $0 = $.derived(() => !$.get(selectAll) && selectedRows.size > 0);

																$.component(node_4, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
																	Checkbox_Root($$anchor, {
																		id: 'select-all',
																		get checked() {
																			return $.get(selectAll);
																		},

																		get indeterminate() {
																			return $.get($0);
																		},
																		onCheckedChange: handleSelectAll
																	});
																});
															}

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_3, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Name');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Email');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, {
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

						var node_8 = $.sibling(node_1, 2);

						$.component(node_8, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_9 = $.first_child(fragment_6);

									$.each(node_9, 17, () => tableData, (row) => row.id, ($$anchor, row) => {
										var fragment_7 = $.comment();
										var node_10 = $.first_child(fragment_7);

										{
											let $0 = $.derived(() => selectedRows.has($.get(row).id) ? "selected" : undefined);

											$.component(node_10, () => Table.Row, ($$anchor, Table_Row_1) => {
												Table_Row_1($$anchor, {
													get 'data-state'() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root();
														var node_11 = $.first_child(fragment_8);

														$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell) => {
															Table_Cell($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = $.comment();
																	var node_12 = $.first_child(fragment_9);

																	{
																		let $0 = $.derived(() => `row-${$.get(row).id}`);
																		let $1 = $.derived(() => selectedRows.has($.get(row).id));

																		$.component(node_12, () => Checkbox.Root, ($$anchor, Checkbox_Root_1) => {
																			Checkbox_Root_1($$anchor, {
																				get id() {
																					return $.get($0);
																				},

																				get checked() {
																					return $.get($1);
																				},
																				onCheckedChange: (checked) => handleSelectRow($.get(row).id, checked)
																			});
																		});
																	}

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
														});

														var node_13 = $.sibling(node_11, 2);

														$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_1) => {
															Table_Cell_1($$anchor, {
																class: 'font-medium',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, $.get(row).name));
																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														var node_14 = $.sibling(node_13, 2);

														$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_2) => {
															Table_Cell_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, $.get(row).email));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														var node_15 = $.sibling(node_14, 2);

														$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell_3) => {
															Table_Cell_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text();

																	$.template_effect(() => $.set_text(text_5, $.get(row).role));
																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_7);
									});

									$.append($$anchor, fragment_6);
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

	$.pop();
}