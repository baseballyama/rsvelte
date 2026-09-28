import * as $ from 'svelte/internal/server';
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

export default function Data_table_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="-mb-8 w-full"><div class="flex items-center py-4">`);

			Input($$renderer, {
				placeholder: 'Filter emails...',
				value: table.getColumn("email")?.getFilterValue() ?? "",
				oninput: (e) => table.getColumn("email")?.setFilterValue(e.currentTarget.value),
				onchange: (e) => {
					table.getColumn("email")?.setFilterValue(e.currentTarget.value);
				},
				class: 'max-w-sm'
			});

			$$renderer.push(`<!----> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										class: 'ms-auto',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Columns `);
											ChevronDownIcon($$renderer, { class: 'ms-2 size-4' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								align: 'end',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(table.getAllColumns().filter((col) => col.getCanHide()));

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let column = each_array[$$index];
										var bind_get = () => column.getIsVisible();
										var bind_set = (v) => column.toggleVisibility(!!v);

										if (DropdownMenu.CheckboxItem) {
											$$renderer.push('<!--[-->');

											DropdownMenu.CheckboxItem($$renderer, {
												class: 'capitalize',
												get checked() {
													return bind_get();
												},

												set checked($$value) {
													bind_set($$value);
												},

												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(column.id)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="rounded-md border">`);

			if (Table.Root) {
				$$renderer.push('<!--[-->');

				Table.Root($$renderer, {
					children: ($$renderer) => {
						if (Table.Header) {
							$$renderer.push('<!--[-->');

							Table.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(table.getHeaderGroups());

									for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
										let headerGroup = each_array_1[$$index_2];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_2 = $.ensure_array_like(headerGroup.headers);

													for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
														let header = each_array_2[$$index_1];

														if (Table.Head) {
															$$renderer.push('<!--[-->');

															Table.Head($$renderer, {
																class: '[&:has([role=checkbox])]:ps-3',
																children: ($$renderer) => {
																	if (!header.isPlaceholder) {
																		$$renderer.push('<!--[0-->');
																		FlexRender($$renderer, { header });
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Table.Body) {
							$$renderer.push('<!--[-->');

							Table.Body($$renderer, {
								children: ($$renderer) => {
									const each_array_3 = $.ensure_array_like(table.getRowModel().rows);

									if (each_array_3.length !== 0) {
										$$renderer.push('<!--[-->');

										for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
											let row = each_array_3[$$index_4];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													'data-state': row.getIsSelected() && "selected",
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_4 = $.ensure_array_like(row.getVisibleCells());

														for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
															let cell = each_array_4[$$index_3];

															if (Table.Cell) {
																$$renderer.push('<!--[-->');

																Table.Cell($$renderer, {
																	class: '[&:has([role=checkbox])]:ps-3',
																	children: ($$renderer) => {
																		FlexRender($$renderer, { cell });
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}
									} else {
										$$renderer.push('<!--[!-->');

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															colspan: columns.length,
															class: 'h-24 text-center',
															children: ($$renderer) => {
																$$renderer.push(`<!---->No results.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="flex items-center justify-end space-x-2 pt-4"><div class="flex-1 text-sm text-muted-foreground">${$.escape(table.getFilteredSelectedRowModel().rows.length)} of
			${$.escape(table.getFilteredRowModel().rows.length)} row(s) selected.</div> <div class="space-x-2">`);

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				onclick: () => table.previousPage(),
				disabled: !table.getCanPreviousPage(),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Previous`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				onclick: () => table.nextPage(),
				disabled: !table.getCanNextPage(),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Next`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}