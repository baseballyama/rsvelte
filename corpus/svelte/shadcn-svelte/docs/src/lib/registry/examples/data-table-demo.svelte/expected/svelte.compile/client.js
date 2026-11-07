import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

import {
	FlexRender,
	columnFilteringFeature,
	columnVisibilityFeature,
	createColumnHelper,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	createTable,
	createTableState,
	filterFn_includesString,
	renderComponent,
	renderSnippet,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_text,
	tableFeatures
} from "@tanstack/svelte-table";

import { createRawSnippet } from "svelte";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import DataTableActions from "./data-table/data-table-actions.svelte";
import DataTableCheckbox from "./data-table/data-table-checkbox.svelte";
import DataTableEmailButton from "./data-table/data-table-email-button.svelte";

var root = $.from_html(`Columns <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="-mb-8 w-full"><div class="flex items-center py-4"><!> <!></div> <div class="rounded-md border"><!></div> <div class="flex items-center justify-end space-x-2 pt-4"><div class="flex-1 text-sm text-muted-foreground"> </div> <div class="space-x-2"><!> <!></div></div></div>`);

export default function Data_table_demo($$anchor, $$props) {
	$.push($$props, true);

	// New in v9: declare the features this table uses — anything you don't
	// register is tree-shaken out of the bundle.
	const features = tableFeatures({
		columnFilteringFeature,
		columnVisibilityFeature,
		rowPaginationFeature,
		rowSelectionFeature,
		rowSortingFeature,
		filteredRowModel: createFilteredRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortedRowModel: createSortedRowModel(),
		filterFns: { includesString: filterFn_includesString },
		sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text }
	});

	const columnHelper = createColumnHelper();

	const data = [
		{
			id: "m5gr84i9",
			amount: 316,
			status: "Success",
			email: "ken99@yahoo.com"
		},

		{
			id: "3u1reuv4",
			amount: 242,
			status: "Success",
			email: "Abe45@gmail.com"
		},

		{
			id: "derv1ws0",
			amount: 837,
			status: "Processing",
			email: "Monserrat44@gmail.com"
		},

		{
			id: "5kma53ae",
			amount: 874,
			status: "Success",
			email: "Silas22@gmail.com"
		},

		{
			id: "bhqecj4p",
			amount: 721,
			status: "Failed",
			email: "carmella@hotmail.com"
		}
	];

	const columns = columnHelper.columns([
		columnHelper.display({
			id: "select",
			header: ({ table }) => renderComponent(DataTableCheckbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				"aria-label": "Select all"
			}),

			cell: ({ row }) => renderComponent(DataTableCheckbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				"aria-label": "Select row"
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
			header: ({ column }) => renderComponent(DataTableEmailButton, { onclick: column.getToggleSortingHandler() }),
			cell: ({ row }) => {
				const emailSnippet = createRawSnippet((getEmail) => {
					const { email } = getEmail();

					return { render: () => `<div class="lowercase">${email}</div>` };
				});

				return renderSnippet(emailSnippet, { email: row.original.email });
			}
		}),

		columnHelper.accessor("amount", {
			header: () => {
				const amountHeaderSnippet = createRawSnippet(() => {
					return { render: () => `<div class="text-end">Amount</div>` };
				});

				return renderSnippet(amountHeaderSnippet);
			},

			cell: ({ row }) => {
				const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

				const amountCellSnippet = createRawSnippet((getAmount) => {
					const { amount } = getAmount();
					const formatted = formatter.format(amount);

					return {
						render: () => `<div class="text-end font-medium">${formatted}</div>`
					};
				});

				return renderSnippet(amountCellSnippet, { amount: row.original.amount });
			}
		}),

		columnHelper.display({
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id })
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

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => table.getColumn("email")?.getFilterValue() ?? "");

		Input(node, {
			placeholder: 'Filter emails...',
			get value() {
				return $.get($0);
			},
			oninput: (e) => table.getColumn("email")?.setFilterValue(e.currentTarget.value),
			onchange: (e) => {
				table.getColumn("email")?.setFilterValue(e.currentTarget.value);
			},
			class: 'max-w-sm'
		});
	}

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_2 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							class: 'ms-auto',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root();
								var node_3 = $.sibling($.first_child(fragment_2));

								ChevronDownIcon(node_3, { class: 'ms-2 size-4' });
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => table.getAllColumns().filter((col) => col.getCanHide()), (column) => column.id, ($$anchor, column) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);
								var bind_get = () => $.get(column).getIsVisible();
								var bind_set = (v) => $.get(column).toggleVisibility(!!v);

								$.component(node_6, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
									DropdownMenu_CheckboxItem($$anchor, {
										class: 'capitalize',
										get checked() {
											return bind_get();
										},

										set checked($$value) {
											bind_set($$value);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(column).id));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_7 = $.child(div_2);

	$.component(node_7, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_1();
				var node_8 = $.first_child(fragment_6);

				$.component(node_8, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							$.each(node_9, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
								var fragment_8 = $.comment();
								var node_10 = $.first_child(fragment_8);

								$.component(node_10, () => Table.Row, ($$anchor, Table_Row) => {
									Table_Row($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = $.comment();
											var node_11 = $.first_child(fragment_9);

											$.each(node_11, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
												var fragment_10 = $.comment();
												var node_12 = $.first_child(fragment_10);

												$.component(node_12, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: '[&:has([role=checkbox])]:ps-3',
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_13 = $.first_child(fragment_11);

															{
																var consequent = ($$anchor) => {
																	FlexRender($$anchor, {
																		get header() {
																			return $.get(header);
																		}
																	});
																};

																$.if(node_13, ($$render) => {
																	if (!$.get(header).isPlaceholder) $$render(consequent);
																});
															}

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_8, 2);

				$.component(node_14, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = $.comment();
							var node_15 = $.first_child(fragment_13);

							$.each(
								node_15,
								17,
								() => table.getRowModel().rows,
								(row) => row.id,
								($$anchor, row) => {
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
																class: '[&:has([role=checkbox])]:ps-3',
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
								},
								($$anchor) => {
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

															var text_1 = $.text('No results.');

															$.append($$anchor, text_1);
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
								}
							);

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var text_2 = $.only_child(div_4);
	var div_5 = $.sibling(div_4, 2);
	var node_21 = $.child(div_5);

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

				var text_3 = $.text('Previous');

				$.append($$anchor, text_3);
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

				var text_4 = $.text('Next');

				$.append($$anchor, text_4);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_5);
	$.reset(div_3);
	$.reset(div);

	$.template_effect(
		($0, $1) => $.set_text(text_2, `${$0 ?? ''} of
			${$1 ?? ''} row(s) selected.`),
		[
			() => table.getFilteredSelectedRowModel().rows.length,
			() => table.getFilteredRowModel().rows.length
		]
	);

	$.append($$anchor, div);
	$.pop();
}