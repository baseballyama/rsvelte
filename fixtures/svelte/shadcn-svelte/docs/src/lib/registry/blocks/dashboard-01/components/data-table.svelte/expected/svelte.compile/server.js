import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
import ChevronLeftIcon from "@tabler/icons-svelte/icons/chevron-left";
import ChevronRightIcon from "@tabler/icons-svelte/icons/chevron-right";
import ChevronsLeftIcon from "@tabler/icons-svelte/icons/chevrons-left";
import ChevronsRightIcon from "@tabler/icons-svelte/icons/chevrons-right";
import LayoutColumnsIcon from "@tabler/icons-svelte/icons/layout-columns";
import PlusIcon from "@tabler/icons-svelte/icons/plus";
import { DragDropProvider } from "@dnd-kit-svelte/svelte";
import { useSortable } from "@dnd-kit-svelte/svelte/sortable";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { move } from "@dnd-kit/helpers";

import {
	FlexRender,
	createColumnHelper,
	createTable,
	createTableState,
	renderComponent
} from "@tanstack/svelte-table";

import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import DataTableActions from "./data-table-actions.svelte";
import DataTableCellViewer from "./data-table-cell-viewer.svelte";
import DataTableCheckbox from "./data-table-checkbox.svelte";
import DataTableDragHandle from "./data-table-drag-handle.svelte";
import DataTableHeaderLimit from "./data-table-header-limit.svelte";
import DataTableHeaderTarget from "./data-table-header-target.svelte";
import DataTableLimit from "./data-table-limit.svelte";
import DataTableReviewer from "./data-table-reviewer.svelte";
import DataTableStatus from "./data-table-status.svelte";
import DataTableTarget from "./data-table-target.svelte";
import DataTableType from "./data-table-type.svelte";
import { features } from "./data-table-features.js";

function DraggableRow($$renderer, { row }) {
	const { ref, isDragging, handleRef } = useSortable({ id: row.original.id, index: () => row.index });

	if (Table.Row) {
		$$renderer.push('<!--[-->');

		Table.Row($$renderer, {
			'data-state': row.getIsSelected() && "selected",
			'data-dragging': isDragging.current,
			class: 'relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(row.getVisibleCells());

				for (let $$index_7 = 0, $$length = each_array.length; $$index_7 < $$length; $$index_7++) {
					let cell = each_array[$$index_7];

					if (Table.Cell) {
						$$renderer.push('<!--[-->');

						Table.Cell($$renderer, {
							children: ($$renderer) => {
								if (cell.column.id === "drag") {
									$$renderer.push('<!--[0-->');
									DataTableDragHandle($$renderer, { attach: handleRef });
								} else {
									$$renderer.push('<!--[-1-->');
									FlexRender($$renderer, { cell });
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

export default function Data_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const columnHelper = createColumnHelper();

		const columns = columnHelper.columns([
			columnHelper.display({ id: "drag", header: () => null }),
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

			columnHelper.accessor("header", {
				header: "Header",
				cell: ({ row }) => renderComponent(DataTableCellViewer, { item: row.original }),
				enableHiding: false
			}),

			columnHelper.accessor("type", {
				header: "Section Type",
				cell: ({ row }) => renderComponent(DataTableType, { row })
			}),

			columnHelper.accessor("status", {
				header: "Status",
				cell: ({ row }) => renderComponent(DataTableStatus, { row })
			}),

			columnHelper.accessor("target", {
				header: () => renderComponent(DataTableHeaderTarget, {}),
				cell: ({ row }) => renderComponent(DataTableTarget, { row })
			}),

			columnHelper.accessor("limit", {
				header: () => renderComponent(DataTableHeaderLimit, {}),
				cell: ({ row }) => renderComponent(DataTableLimit, { row })
			}),

			columnHelper.accessor("reviewer", {
				header: "Reviewer",
				cell: ({ row }) => renderComponent(DataTableReviewer, { row })
			}),

			columnHelper.display({
				id: "actions",
				cell: () => renderComponent(DataTableActions, {})
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
			getRowId: (row) => row.id.toString(),
			enableRowSelection: true,
			autoResetPageIndex: false,
			state: {
				get rowSelection() {
					return rowSelection();
				}
			},
			onRowSelectionChange: setRowSelection
		});

		const pagination = $.derived(() => table.atoms.pagination.get());

		let views = [
			{ id: "outline", label: "Outline", badge: 0 },
			{ id: "past-performance", label: "Past Performance", badge: 3 },
			{ id: "key-personnel", label: "Key Personnel", badge: 2 },
			{ id: "focus-documents", label: "Focus Documents", badge: 0 }
		];

		let view = "outline";
		let viewLabel = $.derived(() => views.find((v) => view === v.id)?.label ?? "Select a view");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: 'outline',
					class: 'w-full flex-col justify-start gap-6',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-center justify-between px-4 lg:px-6">`);

						Label($$renderer, {
							for: 'view-selector',
							class: 'sr-only',
							children: ($$renderer) => {
								$$renderer.push(`<!---->View`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (Select.Root) {
							$$renderer.push('<!--[-->');

							Select.Root($$renderer, {
								type: 'single',
								get value() {
									return view;
								},

								set value($$value) {
									view = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Select.Trigger) {
										$$renderer.push('<!--[-->');

										Select.Trigger($$renderer, {
											class: 'flex w-fit @4xl/main:hidden',
											size: 'sm',
											id: 'view-selector',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(viewLabel())}`);
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
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_1 = $.ensure_array_like(views);

												for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
													let view = each_array_1[$$index];

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: view.id,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(view.label)}`);
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

						$$renderer.push(` `);

						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_2 = $.ensure_array_like(views);

									for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
										let view = each_array_2[$$index_1];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: view.id,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(view.label)} `);

													if (view.badge > 0) {
														$$renderer.push('<!--[0-->');

														Badge($$renderer, {
															variant: 'secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(view.badge)}`);
															},
															$$slots: { default: true }
														});
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

						$$renderer.push(` <div class="flex items-center gap-2">`);

						if (DropdownMenu.Root) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Root($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											Button($$renderer, $.spread_props([
												{ variant: 'outline', size: 'sm' },
												props,
												{
													children: ($$renderer) => {
														LayoutColumnsIcon($$renderer, {});
														$$renderer.push(`<!----> <span class="hidden lg:inline">Customize Columns</span> <span class="lg:hidden">Columns</span> `);
														ChevronDownIcon($$renderer, {});
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
											class: 'w-56',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_3 = $.ensure_array_like(table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()));

												for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
													let column = each_array_3[$$index_2];

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															class: 'capitalize',
															checked: column.getIsVisible(),
															onCheckedChange: (value) => column.toggleVisibility(!!value),
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

						$$renderer.push(` `);

						Button($$renderer, {
							variant: 'outline',
							size: 'sm',
							children: ($$renderer) => {
								PlusIcon($$renderer, {});
								$$renderer.push(`<!----> <span class="hidden lg:inline">Add Section</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'outline',
								class: 'relative flex flex-col gap-4 overflow-auto px-4 lg:px-6',
								children: ($$renderer) => {
									var bind_get = () => `${pagination().pageSize}`;
									var bind_set = (v) => table.setPageSize(Number(v));

									$$renderer.push(`<div class="overflow-hidden rounded-lg border">`);

									DragDropProvider($$renderer, {
										modifiers: [RestrictToVerticalAxis],
										onDragEnd: (e) => data = move(data, e),
										children: ($$renderer) => {
											if (Table.Root) {
												$$renderer.push('<!--[-->');

												Table.Root($$renderer, {
													children: ($$renderer) => {
														if (Table.Header) {
															$$renderer.push('<!--[-->');

															Table.Header($$renderer, {
																class: 'sticky top-0 z-10 bg-muted',
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_4 = $.ensure_array_like(table.getHeaderGroups());

																	for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																		let headerGroup = each_array_4[$$index_4];

																		if (Table.Row) {
																			$$renderer.push('<!--[-->');

																			Table.Row($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_5 = $.ensure_array_like(headerGroup.headers);

																					for (let $$index_3 = 0, $$length = each_array_5.length; $$index_3 < $$length; $$index_3++) {
																						let header = each_array_5[$$index_3];

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
																class: '**:data-[slot=table-cell]:first:w-8',
																children: ($$renderer) => {
																	if (table.getRowModel().rows?.length) {
																		$$renderer.push(`<!--[0--><!--[-->`);

																		const each_array_6 = $.ensure_array_like(table.getRowModel().rows);

																		for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
																			let row = each_array_6[$$index_5];

																			DraggableRow($$renderer, { row });
																		}

																		$$renderer.push(`<!--]-->`);
																	} else {
																		$$renderer.push('<!--[-1-->');

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
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> <div class="flex items-center justify-between px-4"><div class="hidden flex-1 text-sm text-muted-foreground lg:flex">${$.escape(table.getFilteredSelectedRowModel().rows.length)} of
				${$.escape(table.getFilteredRowModel().rows.length)} row(s) selected.</div> <div class="flex w-full items-center gap-8 lg:w-fit"><div class="hidden items-center gap-2 lg:flex">`);

									Label($$renderer, {
										for: 'rows-per-page',
										class: 'text-sm font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Rows per page`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											get value() {
												return bind_get();
											},

											set value($$value) {
												bind_set($$value);
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														size: 'sm',
														class: 'w-20',
														id: 'rows-per-page',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(pagination().pageSize)}`);
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

															const each_array_7 = $.ensure_array_like([10, 20, 30, 40, 50]);

															for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
																let pageSize = each_array_7[$$index_6];

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: pageSize.toString(),
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

									$$renderer.push(`</div> <div class="flex w-fit items-center justify-center text-sm font-medium">Page ${$.escape(pagination().pageIndex + 1)} of
					${$.escape(table.getPageCount())}</div> <div class="ms-auto flex items-center gap-2 lg:ms-0">`);

									Button($$renderer, {
										variant: 'outline',
										class: 'hidden h-8 w-8 p-0 lg:flex',
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
										class: 'size-8',
										size: 'icon',
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
										class: 'size-8',
										size: 'icon',
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
										class: 'hidden size-8 lg:flex',
										size: 'icon',
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
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'past-performance',
								class: 'flex flex-col px-4 lg:px-6',
								children: ($$renderer) => {
									$$renderer.push(`<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'key-personnel',
								class: 'flex flex-col px-4 lg:px-6',
								children: ($$renderer) => {
									$$renderer.push(`<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'focus-documents',
								class: 'flex flex-col px-4 lg:px-6',
								children: ($$renderer) => {
									$$renderer.push(`<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}