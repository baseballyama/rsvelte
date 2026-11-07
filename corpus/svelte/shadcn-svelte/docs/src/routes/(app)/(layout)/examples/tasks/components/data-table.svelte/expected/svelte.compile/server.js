import * as $ from 'svelte/internal/server';
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

function Pagination($$renderer, { table }) {
	$$renderer.push(`<div class="flex items-center justify-between px-2"><div class="flex-1 text-sm text-muted-foreground">${$.escape(table.getFilteredSelectedRowModel().rows.length)} of
			${$.escape(table.getFilteredRowModel().rows.length)} row(s) selected.</div> <div class="flex items-center space-x-6 lg:space-x-8"><div class="flex items-center space-x-2"><p class="text-sm font-medium">Rows per page</p> `);

	if (Select.Root) {
		$$renderer.push('<!--[-->');

		Select.Root($$renderer, {
			allowDeselect: false,
			type: 'single',
			value: `${table.atoms.pagination.get().pageSize}`,
			onValueChange: (value) => {
				table.setPageSize(Number(value));
			},

			children: ($$renderer) => {
				if (Select.Trigger) {
					$$renderer.push('<!--[-->');

					Select.Trigger($$renderer, {
						class: 'h-8 w-[70px]',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(String(table.atoms.pagination.get().pageSize))}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Select.Content) {
					$$renderer.push('<!--[-->');

					Select.Content($$renderer, {
						side: 'top',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like([10, 20, 30, 40, 50]);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let pageSize = each_array[$$index];

								if (Select.Item) {
									$$renderer.push('<!--[-->');

									Select.Item($$renderer, {
										value: `${pageSize}`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(pageSize)}`);
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

	$$renderer.push(`</div> <div class="flex w-[100px] items-center justify-center text-sm font-medium">Page ${$.escape(table.atoms.pagination.get().pageIndex + 1)} of
				${$.escape(table.getPageCount())}</div> <div class="flex items-center space-x-2">`);

	Button($$renderer, {
		variant: 'outline',
		class: 'hidden size-8 p-0 lg:flex',
		onclick: () => table.setPageIndex(0),
		disabled: !table.getCanPreviousPage(),
		children: ($$renderer) => {
			$$renderer.push(`<span class="sr-only">Go to first page</span> `);
			ChevronsLeftIcon($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		class: 'size-8 p-0',
		onclick: () => table.previousPage(),
		disabled: !table.getCanPreviousPage(),
		children: ($$renderer) => {
			$$renderer.push(`<span class="sr-only">Go to previous page</span> `);
			ChevronLeftIcon($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		class: 'size-8 p-0',
		onclick: () => table.nextPage(),
		disabled: !table.getCanNextPage(),
		children: ($$renderer) => {
			$$renderer.push(`<span class="sr-only">Go to next page</span> `);
			ChevronRightIcon($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		class: 'hidden size-8 p-0 lg:flex',
		onclick: () => table.setPageIndex(table.getPageCount() - 1),
		disabled: !table.getCanNextPage(),
		children: ($$renderer) => {
			$$renderer.push(`<span class="sr-only">Go to last page</span> `);
			ChevronsRightIcon($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}

export default function Data_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
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

		$$renderer.push(`<div class="space-y-4">`);
		DataTableToolbar($$renderer, { table });
		$$renderer.push(`<!----> <div class="rounded-md border">`);

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
															colspan: header.colSpan,
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

		$$renderer.push(`</div> `);
		Pagination($$renderer, { table });
		$$renderer.push(`<!----></div>`);
	});
}