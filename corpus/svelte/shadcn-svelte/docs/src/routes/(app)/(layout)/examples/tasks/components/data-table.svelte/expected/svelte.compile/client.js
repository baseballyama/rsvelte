import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ChevronsLeftIcon from "@lucide/svelte/icons/chevrons-left";
import ChevronsRightIcon from "@lucide/svelte/icons/chevrons-right";

import {
	FlexRender,
	createColumnHelper,
	createTable,
	createTableState,
	renderComponent,
	renderSnippet
} from "@tanstack/svelte-table";

import { createRawSnippet } from "svelte";
import * as Select from "$lib/registry/ui/select/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import Checkbox from "$lib/registry/ui/checkbox/checkbox.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import ColumnHeader from "./data-table-column-header.svelte";
import PriorityCell from "./data-table-priority-cell.svelte";
import RowActions from "./data-table-row-actions.svelte";
import StatusCell from "./data-table-status-cell.svelte";
import TitleCell from "./data-table-title-cell.svelte";
import DataTableToolbar from "./data-table-toolbar.svelte";
import { features } from "./data-table-features.js";

const Pagination = ($$anchor, $$arg0) => {
	let table = () => ($$arg0?.()).table;
	var div = root_5();
	var div_1 = $.child(div);
	var text = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node = $.sibling($.child(div_3), 2);

	{
		let $0 = $.derived(() => `${table().atoms.pagination.get().pageSize}`);

		$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
			Select_Root($$anchor, {
				allowDeselect: false,
				type: 'single',
				get value() {
					return $.get($0);
				},

				onValueChange: (value) => {
					table().setPageSize(Number(value));
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = root();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
						Select_Trigger($$anchor, {
							class: 'h-8 w-[70px]',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(($0) => $.set_text(text_1, $0), [() => String(table().atoms.pagination.get().pageSize)]);
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
						Select_Content($$anchor, {
							side: 'top',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.each(node_3, 16, () => [10, 20, 30, 40, 50], (pageSize) => pageSize, ($$anchor, pageSize) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => `${pageSize}`);

										$.component(node_4, () => Select.Item, ($$anchor, Select_Item) => {
											Select_Item($$anchor, {
												get value() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, pageSize));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_3);
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var text_3 = $.only_child(div_4);
	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	{
		let $0 = $.derived(() => !table().getCanPreviousPage());

		Button(node_5, {
			variant: 'outline',
			class: 'hidden size-8 p-0 lg:flex',
			onclick: () => table().setPageIndex(0),
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_6 = $.sibling($.first_child(fragment_5), 2);

				ChevronsLeftIcon(node_6, {});
				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => !table().getCanPreviousPage());

		Button(node_7, {
			variant: 'outline',
			class: 'size-8 p-0',
			onclick: () => table().previousPage(),
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_2();
				var node_8 = $.sibling($.first_child(fragment_6), 2);

				ChevronLeftIcon(node_8, {});
				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	}

	var node_9 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => !table().getCanNextPage());

		Button(node_9, {
			variant: 'outline',
			class: 'size-8 p-0',
			onclick: () => table().nextPage(),
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_3();
				var node_10 = $.sibling($.first_child(fragment_7), 2);

				ChevronRightIcon(node_10, {});
				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		let $0 = $.derived(() => !table().getCanNextPage());

		Button(node_11, {
			variant: 'outline',
			class: 'hidden size-8 p-0 lg:flex',
			onclick: () => table().setPageIndex(table().getPageCount() - 1),
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_4();
				var node_12 = $.sibling($.first_child(fragment_8), 2);

				ChevronsRightIcon(node_12, {});
				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_5);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_text(text, `${$0 ?? ''} of
			${$1 ?? ''} row(s) selected.`);

			$.set_text(text_3, `Page ${$2 ?? ''} of
				${$3 ?? ''}`);
		},
		[
			() => table().getFilteredSelectedRowModel().rows.length,
			() => table().getFilteredRowModel().rows.length,
			() => table().atoms.pagination.get().pageIndex + 1,
			() => table().getPageCount()
		]
	);

	$.append($$anchor, div);
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="sr-only">Go to first page</span> <!>`, 1);
var root_2 = $.from_html(`<span class="sr-only">Go to previous page</span> <!>`, 1);
var root_3 = $.from_html(`<span class="sr-only">Go to next page</span> <!>`, 1);
var root_4 = $.from_html(`<span class="sr-only">Go to last page</span> <!>`, 1);
var root_5 = $.from_html(`<div class="flex items-center justify-between px-2"><div class="flex-1 text-sm text-muted-foreground"> </div> <div class="flex items-center space-x-6 lg:space-x-8"><div class="flex items-center space-x-2"><p class="text-sm font-medium">Rows per page</p> <!></div> <div class="flex w-[100px] items-center justify-center text-sm font-medium"> </div> <div class="flex items-center space-x-2"><!> <!> <!> <!></div></div></div>`);
var root_6 = $.from_html(`<div class="space-y-4"><!> <div class="rounded-md border"><!></div> <!></div>`);

export default function Data_table($$anchor, $$props) {
	$.push($$props, true);

	const columnHelper = createColumnHelper();

	const columns = columnHelper.columns([
		columnHelper.display({
			id: "select",
			header: ({ table }) => renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(value),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				"aria-label": "Select all"
			}),

			cell: ({ row }) => renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(value),
				"aria-label": "Select row"
			}),
			enableSorting: false,
			enableHiding: false
		}),

		columnHelper.accessor("id", {
			header: ({ column }) => {
				return renderComponent(ColumnHeader, { column, title: "Task" });
			},

			cell: ({ row }) => {
				const idSnippet = createRawSnippet((getId) => {
					const { id } = getId();

					return { render: () => `<div class="w-[80px]">${id}</div>` };
				});

				return renderSnippet(idSnippet, { id: row.original.id });
			},
			enableSorting: false,
			enableHiding: false
		}),

		columnHelper.accessor("title", {
			header: ({ column }) => renderComponent(ColumnHeader, { column, title: "Title" }),
			cell: ({ row }) => {
				return renderComponent(TitleCell, { labelValue: row.original.label, value: row.original.title });
			}
		}),

		columnHelper.accessor("status", {
			header: ({ column }) => renderComponent(ColumnHeader, { column, title: "Status" }),
			cell: ({ row }) => {
				return renderComponent(StatusCell, { value: row.original.status });
			},

			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		}),

		columnHelper.accessor("priority", {
			header: ({ column }) => {
				return renderComponent(ColumnHeader, { title: "Priority", column });
			},

			cell: ({ row }) => {
				return renderComponent(PriorityCell, { value: row.original.priority });
			},

			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		}),

		columnHelper.display({
			id: "actions",
			cell: ({ row }) => renderComponent(RowActions, { row })
		})
	]);

	// Keep row selection outside the table so the rest of the app can read or update it.
	const [rowSelection, setRowSelection] = createTableState({});

	// v9 manages the rest of its state internally — reads like
	// `table.getRowModel()` are rune-reactive, so no `$state` mirrors are needed.
	const table = createTable({
		features,
		get data() {
			return $$props.data;
		},
		columns,
		state: {
			get rowSelection() {
				return rowSelection();
			}
		},
		onRowSelectionChange: setRowSelection
	});

	var div_6 = root_6();
	var node_13 = $.child(div_6);

	DataTableToolbar(node_13, {
		get table() {
			return table;
		}
	});

	var div_7 = $.sibling(node_13, 2);
	var node_14 = $.child(div_7);

	$.component(node_14, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root();
				var node_15 = $.first_child(fragment_9);

				$.component(node_15, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = $.comment();
							var node_16 = $.first_child(fragment_10);

							$.each(node_16, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
								var fragment_11 = $.comment();
								var node_17 = $.first_child(fragment_11);

								$.component(node_17, () => Table.Row, ($$anchor, Table_Row) => {
									Table_Row($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_12 = $.comment();
											var node_18 = $.first_child(fragment_12);

											$.each(node_18, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
												var fragment_13 = $.comment();
												var node_19 = $.first_child(fragment_13);

												$.component(node_19, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														get colspan() {
															return $.get(header).colSpan;
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_14 = $.comment();
															var node_20 = $.first_child(fragment_14);

															{
																var consequent = ($$anchor) => {
																	FlexRender($$anchor, {
																		get header() {
																			return $.get(header);
																		}
																	});
																};

																$.if(node_20, ($$render) => {
																	if (!$.get(header).isPlaceholder) $$render(consequent);
																});
															}

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_13);
											});

											$.append($$anchor, fragment_12);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_11);
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_15, 2);

				$.component(node_21, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = $.comment();
							var node_22 = $.first_child(fragment_16);

							$.each(
								node_22,
								17,
								() => table.getRowModel().rows,
								(row) => row.id,
								($$anchor, row) => {
									var fragment_17 = $.comment();
									var node_23 = $.first_child(fragment_17);

									{
										let $0 = $.derived(() => $.get(row).getIsSelected() && "selected");

										$.component(node_23, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												get 'data-state'() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_18 = $.comment();
													var node_24 = $.first_child(fragment_18);

													$.each(node_24, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
														var fragment_19 = $.comment();
														var node_25 = $.first_child(fragment_19);

														$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell) => {
															Table_Cell($$anchor, {
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

														$.append($$anchor, fragment_19);
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_17);
								},
								($$anchor) => {
									var fragment_21 = $.comment();
									var node_26 = $.first_child(fragment_21);

									$.component(node_26, () => Table.Row, ($$anchor, Table_Row_2) => {
										Table_Row_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = $.comment();
												var node_27 = $.first_child(fragment_22);

												$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_1) => {
													Table_Cell_1($$anchor, {
														get colspan() {
															return columns.length;
														},
														class: 'h-24 text-center',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('No results.');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_21);
								}
							);

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_7);

	var node_28 = $.sibling(div_7, 2);

	Pagination(node_28, () => ({ table }));
	$.reset(div_6);
	$.append($$anchor, div_6);
	$.pop();
}