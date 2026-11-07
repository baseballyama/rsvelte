import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	FlexRender,
	createColumnHelper,
	createTable,
	createTableState,
	renderComponent,
	renderSnippet
} from "@tanstack/svelte-table";

import { createRawSnippet } from "svelte";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import ActionsCell from "./payments-actions-cell.svelte";
import EmailHeader from "./payments-email-header.svelte";
import { features } from "./payments-features.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="rounded-md border"><!></div> <div class="flex items-center justify-end gap-2"><div class="flex-1 text-sm text-muted-foreground"> </div> <div class="flex gap-2"><!> <!></div></div>`, 1);

export default function Payments($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			id: "m5gr84i9",
			amount: 316,
			status: "success",
			email: "ken99@example.com"
		},

		{
			id: "3u1reuv4",
			amount: 242,
			status: "success",
			email: "Abe45@example.com"
		},

		{
			id: "derv1ws0",
			amount: 837,
			status: "processing",
			email: "Monserrat44@example.com"
		},

		{
			id: "bhqecj4p",
			amount: 721,
			status: "failed",
			email: "carmella@example.com"
		},

		{
			id: "k9f2m3n4",
			amount: 450,
			status: "pending",
			email: "jason78@example.com"
		},

		{
			id: "p5q6r7s8",
			amount: 1280,
			status: "success",
			email: "sarah23@example.com"
		}
	];

	const columnHelper = createColumnHelper();

	const columns = columnHelper.columns([
		columnHelper.display({
			id: "select",
			header: ({ table }) => renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected(),
				onCheckedChange: (v) => table.toggleAllPageRowsSelected(!!v),
				"aria-label": "Select all"
			}),

			cell: ({ row }) => renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (v) => row.toggleSelected(!!v)
			}),
			enableSorting: false,
			enableHiding: false
		}),

		columnHelper.accessor("status", {
			header: "Status",
			cell: ({ row }) => {
				const statusSnippet = createRawSnippet((getStatus) => {
					const { status } = getStatus();

					return { render: () => `<div class="capitalize">${status}</div>` };
				});

				return renderSnippet(statusSnippet, { status: row.original.status });
			}
		}),

		columnHelper.accessor("email", {
			header: ({ column }) => renderComponent(EmailHeader, { column }),
			cell: ({ row }) => {
				const emailSnippet = createRawSnippet((getEmail) => {
					const { email } = getEmail();

					return { render: () => `<div class="lowercase">${email}</div>` };
				});

				return renderSnippet(emailSnippet, { email: row.original.email });
			}
		}),

		columnHelper.accessor("amount", {
			header: () => renderSnippet(createRawSnippet(() => ({ render: () => `<div class="text-end">Amount</div>` }))),
			cell: ({ row }) => {
				const amountSnippet = createRawSnippet((getAmount) => {
					const { amount } = getAmount();
					const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

					return {
						render: () => `<div class="text-end font-medium">${formatted}</div>`
					};
				});

				return renderSnippet(amountSnippet, { amount: row.original.amount });
			}
		}),

		columnHelper.display({
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => renderComponent(ActionsCell, { row })
		})
	]);

	// Keep row selection outside the table so the rest of the app can read or update it.
	const [rowSelection, setRowSelection] = createTableState({});

	// v9 manages the rest of its state internally — reads like
	// `table.getRowModel()` are rune-reactive, so no `$state` mirrors are needed.
	const table = createTable({
		features,
		get data() {
			return data;
		},
		columns,
		state: {
			get rowSelection() {
				return rowSelection();
			}
		},
		onRowSelectionChange: setRowSelection
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Payments');

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

										var text_1 = $.text('Manage your payments.');

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
											variant: 'secondary',
											size: 'sm',
											class: 'shadow-none',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Add Payment');

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
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var div = $.first_child(fragment_4);
							var node_6 = $.child(div);

							$.component(node_6, () => Table.Root, ($$anchor, Table_Root) => {
								Table_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Table.Header, ($$anchor, Table_Header) => {
											Table_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.each(node_8, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => Table.Row, ($$anchor, Table_Row) => {
															Table_Row($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	$.each(node_10, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
																		var fragment_9 = $.comment();
																		var node_11 = $.first_child(fragment_9);

																		$.component(node_11, () => Table.Head, ($$anchor, Table_Head) => {
																			Table_Head($$anchor, {
																				class: 'data-[name=actions]:w-10 data-[name=amount]:w-24 data-[name=select]:w-10 data-[name=status]:w-24 [&:has([role=checkbox])]:ps-3',
																				get 'data-name'() {
																					return $.get(header).id;
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = $.comment();
																					var node_12 = $.first_child(fragment_10);

																					{
																						var consequent = ($$anchor) => {
																							FlexRender($$anchor, {
																								get header() {
																									return $.get(header);
																								}
																							});
																						};

																						$.if(node_12, ($$render) => {
																							if (!$.get(header).isPlaceholder) $$render(consequent);
																						});
																					}

																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_9);
																	});

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
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
													var fragment_12 = $.comment();
													var node_14 = $.first_child(fragment_12);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_13 = $.comment();
															var node_15 = $.first_child(fragment_13);

															$.each(node_15, 17, () => table.getRowModel().rows, (row) => row.id, ($$anchor, row) => {
																var fragment_14 = $.comment();
																var node_16 = $.first_child(fragment_14);

																{
																	let $0 = $.derived(() => $.get(row).getIsSelected() && "selected");

																	$.component(node_16, () => Table.Row, ($$anchor, Table_Row_1) => {
																		Table_Row_1($$anchor, {
																			get 'data-state'() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = $.comment();
																				var node_17 = $.first_child(fragment_15);

																				$.each(node_17, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
																					var fragment_16 = $.comment();
																					var node_18 = $.first_child(fragment_16);

																					$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell) => {
																						Table_Cell($$anchor, {
																							class: 'data-[name=actions]:w-10 data-[name=amount]:w-24 data-[name=select]:w-10 data-[name=status]:w-24 [&:has([role=checkbox])]:ps-3',
																							get 'data-name'() {
																								return $.get(cell).column.id;
																							},

																							children: ($$anchor, $$slotProps) => {
																								FlexRender($$anchor, {
																									get cell() {
																										return $.get(cell);
																									}
																								});
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_16);
																				});

																				$.append($$anchor, fragment_15);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_14);
															});

															$.append($$anchor, fragment_13);
														};

														var d = $.derived(() => table.getRowModel().rows?.length);

														var alternate = ($$anchor) => {
															var fragment_18 = $.comment();
															var node_19 = $.first_child(fragment_18);

															$.component(node_19, () => Table.Row, ($$anchor, Table_Row_2) => {
																Table_Row_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = $.comment();
																		var node_20 = $.first_child(fragment_19);

																		$.component(node_20, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																			Table_Cell_1($$anchor, {
																				get colspan() {
																					return columns.length;
																				},
																				class: 'h-24 text-center',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('No results.');

																					$.append($$anchor, text_3);
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
														};

														$.if(node_14, ($$render) => {
															if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var div_2 = $.child(div_1);
							var text_4 = $.only_child(div_2);
							var div_3 = $.sibling(div_2, 2);
							var node_21 = $.child(div_3);

							{
								let $0 = $.derived(() => !table.getCanPreviousPage());

								Button(node_21, {
									variant: 'outline',
									size: 'sm',
									onclick: () => table.previousPage(),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Previous');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							}

							var node_22 = $.sibling(node_21, 2);

							{
								let $0 = $.derived(() => !table.getCanNextPage());

								Button(node_22, {
									variant: 'outline',
									size: 'sm',
									onclick: () => table.nextPage(),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Next');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_3);
							$.reset(div_1);

							$.template_effect(
								($0, $1) => $.set_text(text_4, `${$0 ?? ''} of
				${$1 ?? ''} row(s) selected.`),
								[
									() => table.getFilteredSelectedRowModel().rows.length,
									() => table.getFilteredRowModel().rows.length
								]
							);

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
	$.pop();
}