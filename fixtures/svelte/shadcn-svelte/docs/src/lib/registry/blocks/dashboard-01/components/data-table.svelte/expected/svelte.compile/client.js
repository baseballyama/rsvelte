import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const DraggableRow = ($$anchor, $$arg0) => {
	let row = () => ($$arg0?.()).row;

	const computed_const = $.derived(() => {
		return useSortable({ id: row().original.id, index: () => row().index });
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => row().getIsSelected() && "selected");

		$.component(node, () => Table.Row, ($$anchor, Table_Row) => {
			Table_Row($$anchor, {
				get 'data-state'() {
					return $.get($0);
				},

				get 'data-dragging'() {
					return $.get(computed_const).isDragging.current;
				},
				class: 'relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80',
				[$.attachment()]: ($$node) => ($.get(computed_const).ref || $.noop)($$node),
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 17, () => row().getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Table.Cell, ($$anchor, Table_Cell) => {
							Table_Cell($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											DataTableDragHandle($$anchor, {
												get attach() {
													return $.get(computed_const).handleRef;
												}
											});
										};

										var alternate = ($$anchor) => {
											FlexRender($$anchor, {
												get cell() {
													return $.get(cell);
												}
											});
										};

										$.if(node_3, ($$render) => {
											if ($.get(cell).column.id === "drag") $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <span class="hidden lg:inline">Customize Columns</span> <span class="lg:hidden">Columns</span> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="hidden lg:inline">Add Section</span>`, 1);
var root_4 = $.from_html(`<span class="sr-only">Go to first page</span> <!>`, 1);
var root_5 = $.from_html(`<span class="sr-only">Go to previous page</span> <!>`, 1);
var root_6 = $.from_html(`<span class="sr-only">Go to next page</span> <!>`, 1);
var root_7 = $.from_html(`<span class="sr-only">Go to last page</span> <!>`, 1);
var root_8 = $.from_html(`<div class="overflow-hidden rounded-lg border"><!></div> <div class="flex items-center justify-between px-4"><div class="hidden flex-1 text-sm text-muted-foreground lg:flex"> </div> <div class="flex w-full items-center gap-8 lg:w-fit"><div class="hidden items-center gap-2 lg:flex"><!> <!></div> <div class="flex w-fit items-center justify-center text-sm font-medium"> </div> <div class="ms-auto flex items-center gap-2 lg:ms-0"><!> <!> <!> <!></div></div></div>`, 1);
var root_9 = $.from_html(`<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>`);
var root_10 = $.from_html(`<div class="flex items-center justify-between px-4 lg:px-6"><!> <!> <!> <div class="flex items-center gap-2"><!> <!></div></div> <!> <!> <!> <!>`, 1);

export default function Data_table($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 7);
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
			return data();
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

	let view = $.state("outline");
	let viewLabel = $.derived(() => views.find((v) => $.get(view) === v.id)?.label ?? "Select a view");
	var fragment_6 = $.comment();
	var node_4 = $.first_child(fragment_6);

	$.component(node_4, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			value: 'outline',
			class: 'w-full flex-col justify-start gap-6',
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_10();
				var div = $.first_child(fragment_7);
				var node_5 = $.child(div);

				Label(node_5, {
					for: 'view-selector',
					class: 'sr-only',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('View');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Select.Root, ($$anchor, Select_Root) => {
					Select_Root($$anchor, {
						type: 'single',
						get value() {
							return $.get(view);
						},

						set value($$value) {
							$.set(view, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_7 = $.first_child(fragment_8);

							$.component(node_7, () => Select.Trigger, ($$anchor, Select_Trigger) => {
								Select_Trigger($$anchor, {
									class: 'flex w-fit @4xl/main:hidden',
									size: 'sm',
									id: 'view-selector',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(viewLabel)));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_9 = $.first_child(fragment_10);

										$.each(node_9, 17, () => views, (view) => view.id, ($$anchor, view, $$index, $$array) => {
											var fragment_11 = $.comment();
											var node_10 = $.first_child(fragment_11);

											$.component(node_10, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, {
													get value() {
														return $.get(view).id;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(view).label));
														$.append($$anchor, text_2);
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

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_6, 2);

				$.component(node_11, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = $.comment();
							var node_12 = $.first_child(fragment_13);

							$.each(node_12, 17, () => views, (view) => view.id, ($$anchor, view, $$index_1, $$array_1) => {
								var fragment_14 = $.comment();
								var node_13 = $.first_child(fragment_14);

								$.component(node_13, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
									Tabs_Trigger($$anchor, {
										get value() {
											return $.get(view).id;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_15 = root_1();
											var text_3 = $.first_child(fragment_15);
											var node_14 = $.sibling(text_3);

											{
												var consequent_1 = ($$anchor) => {
													Badge($$anchor, {
														variant: 'secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text();

															$.template_effect(() => $.set_text(text_4, $.get(view).badge));
															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												};

												$.if(node_14, ($$render) => {
													if ($.get(view).badge > 0) $$render(consequent_1);
												});
											}

											$.template_effect(() => $.set_text(text_3, `${$.get(view).label ?? ''} `));
											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_14);
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				var div_1 = $.sibling(node_11, 2);
				var node_15 = $.child(div_1);

				$.component(node_15, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
					DropdownMenu_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_18 = root();
							var node_16 = $.first_child(fragment_18);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ variant: 'outline', size: 'sm' }, props, {
										children: ($$anchor, $$slotProps) => {
											var fragment_20 = root_2();
											var node_17 = $.first_child(fragment_20);

											LayoutColumnsIcon(node_17, {});

											var node_18 = $.sibling(node_17, 6);

											ChevronDownIcon(node_18, {});
											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_16, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
									DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_19 = $.sibling(node_16, 2);

							$.component(node_19, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									align: 'end',
									class: 'w-56',
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = $.comment();
										var node_20 = $.first_child(fragment_21);

										$.each(node_20, 17, () => table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()), (column) => column.id, ($$anchor, column) => {
											var fragment_22 = $.comment();
											var node_21 = $.first_child(fragment_22);

											{
												let $0 = $.derived(() => $.get(column).getIsVisible());

												$.component(node_21, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
													DropdownMenu_CheckboxItem($$anchor, {
														class: 'capitalize',
														get checked() {
															return $.get($0);
														},
														onCheckedChange: (value) => $.get(column).toggleVisibility(!!value),
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text();

															$.template_effect(() => $.set_text(text_5, $.get(column).id));
															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_22);
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					});
				});

				var node_22 = $.sibling(node_15, 2);

				Button(node_22, {
					variant: 'outline',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_24 = root_3();
						var node_23 = $.first_child(fragment_24);

						PlusIcon(node_23, {});
						$.next(2);
						$.append($$anchor, fragment_24);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.reset(div);

				var node_24 = $.sibling(div, 2);

				$.component(node_24, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'outline',
						class: 'relative flex flex-col gap-4 overflow-auto px-4 lg:px-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_25 = root_8();
							var div_2 = $.first_child(fragment_25);
							var node_25 = $.child(div_2);

							{
								let $0 = $.derived(() => [RestrictToVerticalAxis]);

								DragDropProvider(node_25, {
									get modifiers() {
										return $.get($0);
									},
									onDragEnd: (e) => data(move(data(), e)),
									children: ($$anchor, $$slotProps) => {
										var fragment_26 = $.comment();
										var node_26 = $.first_child(fragment_26);

										$.component(node_26, () => Table.Root, ($$anchor, Table_Root) => {
											Table_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_27 = root();
													var node_27 = $.first_child(fragment_27);

													$.component(node_27, () => Table.Header, ($$anchor, Table_Header) => {
														Table_Header($$anchor, {
															class: 'sticky top-0 z-10 bg-muted',
															children: ($$anchor, $$slotProps) => {
																var fragment_28 = $.comment();
																var node_28 = $.first_child(fragment_28);

																$.each(node_28, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
																	var fragment_29 = $.comment();
																	var node_29 = $.first_child(fragment_29);

																	$.component(node_29, () => Table.Row, ($$anchor, Table_Row_1) => {
																		Table_Row_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_30 = $.comment();
																				var node_30 = $.first_child(fragment_30);

																				$.each(node_30, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
																					var fragment_31 = $.comment();
																					var node_31 = $.first_child(fragment_31);

																					$.component(node_31, () => Table.Head, ($$anchor, Table_Head) => {
																						Table_Head($$anchor, {
																							get colspan() {
																								return $.get(header).colSpan;
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_32 = $.comment();
																								var node_32 = $.first_child(fragment_32);

																								{
																									var consequent_2 = ($$anchor) => {
																										FlexRender($$anchor, {
																											get header() {
																												return $.get(header);
																											}
																										});
																									};

																									$.if(node_32, ($$render) => {
																										if (!$.get(header).isPlaceholder) $$render(consequent_2);
																									});
																								}

																								$.append($$anchor, fragment_32);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_31);
																				});

																				$.append($$anchor, fragment_30);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_29);
																});

																$.append($$anchor, fragment_28);
															},
															$$slots: { default: true }
														});
													});

													var node_33 = $.sibling(node_27, 2);

													$.component(node_33, () => Table.Body, ($$anchor, Table_Body) => {
														Table_Body($$anchor, {
															class: '**:data-[slot=table-cell]:first:w-8',
															children: ($$anchor, $$slotProps) => {
																var fragment_34 = $.comment();
																var node_34 = $.first_child(fragment_34);

																{
																	var consequent_3 = ($$anchor) => {
																		var fragment_35 = $.comment();
																		var node_35 = $.first_child(fragment_35);

																		$.each(node_35, 17, () => table.getRowModel().rows, (row) => row.id, ($$anchor, row) => {
																			DraggableRow($$anchor, () => ({ row: $.get(row) }));
																		});

																		$.append($$anchor, fragment_35);
																	};

																	var d = $.derived(() => table.getRowModel().rows?.length);

																	var alternate_1 = ($$anchor) => {
																		var fragment_37 = $.comment();
																		var node_36 = $.first_child(fragment_37);

																		$.component(node_36, () => Table.Row, ($$anchor, Table_Row_2) => {
																			Table_Row_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_38 = $.comment();
																					var node_37 = $.first_child(fragment_38);

																					$.component(node_37, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																						Table_Cell_1($$anchor, {
																							get colspan() {
																								return columns.length;
																							},
																							class: 'h-24 text-center',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('No results.');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_38);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_37);
																	};

																	$.if(node_34, ($$render) => {
																		if ($.get(d)) $$render(consequent_3); else $$render(alternate_1, -1);
																	});
																}

																$.append($$anchor, fragment_34);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_27);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_26);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var div_4 = $.child(div_3);
							var text_7 = $.only_child(div_4);
							var div_5 = $.sibling(div_4, 2);
							var div_6 = $.child(div_5);
							var node_38 = $.child(div_6);

							Label(node_38, {
								for: 'rows-per-page',
								class: 'text-sm font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Rows per page');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_39 = $.sibling(node_38, 2);
							var bind_get = () => `${$.get(pagination).pageSize}`;
							var bind_set = (v) => table.setPageSize(Number(v));

							$.component(node_39, () => Select.Root, ($$anchor, Select_Root_1) => {
								Select_Root_1($$anchor, {
									type: 'single',
									get value() {
										return bind_get();
									},

									set value($$value) {
										bind_set($$value);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_39 = root();
										var node_40 = $.first_child(fragment_39);

										$.component(node_40, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
											Select_Trigger_1($$anchor, {
												size: 'sm',
												class: 'w-20',
												id: 'rows-per-page',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text();

													$.template_effect(() => $.set_text(text_9, $.get(pagination).pageSize));
													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_41 = $.sibling(node_40, 2);

										$.component(node_41, () => Select.Content, ($$anchor, Select_Content_1) => {
											Select_Content_1($$anchor, {
												side: 'top',
												children: ($$anchor, $$slotProps) => {
													var fragment_41 = $.comment();
													var node_42 = $.first_child(fragment_41);

													$.each(node_42, 16, () => [10, 20, 30, 40, 50], (pageSize) => pageSize, ($$anchor, pageSize) => {
														var fragment_42 = $.comment();
														var node_43 = $.first_child(fragment_42);

														{
															let $0 = $.derived(() => pageSize.toString());

															$.component(node_43, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	get value() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text();

																		$.template_effect(() => $.set_text(text_10, pageSize));
																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_42);
													});

													$.append($$anchor, fragment_41);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_39);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_6);

							var div_7 = $.sibling(div_6, 2);
							var text_11 = $.only_child(div_7);
							var div_8 = $.sibling(div_7, 2);
							var node_44 = $.child(div_8);

							{
								let $0 = $.derived(() => !table.getCanPreviousPage());

								Button(node_44, {
									variant: 'outline',
									class: 'hidden h-8 w-8 p-0 lg:flex',
									onclick: () => table.setPageIndex(0),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_44 = root_4();
										var node_45 = $.sibling($.first_child(fragment_44), 2);

										ChevronsLeftIcon(node_45, {});
										$.append($$anchor, fragment_44);
									},
									$$slots: { default: true }
								});
							}

							var node_46 = $.sibling(node_44, 2);

							{
								let $0 = $.derived(() => !table.getCanPreviousPage());

								Button(node_46, {
									variant: 'outline',
									class: 'size-8',
									size: 'icon',
									onclick: () => table.previousPage(),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_45 = root_5();
										var node_47 = $.sibling($.first_child(fragment_45), 2);

										ChevronLeftIcon(node_47, {});
										$.append($$anchor, fragment_45);
									},
									$$slots: { default: true }
								});
							}

							var node_48 = $.sibling(node_46, 2);

							{
								let $0 = $.derived(() => !table.getCanNextPage());

								Button(node_48, {
									variant: 'outline',
									class: 'size-8',
									size: 'icon',
									onclick: () => table.nextPage(),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_46 = root_6();
										var node_49 = $.sibling($.first_child(fragment_46), 2);

										ChevronRightIcon(node_49, {});
										$.append($$anchor, fragment_46);
									},
									$$slots: { default: true }
								});
							}

							var node_50 = $.sibling(node_48, 2);

							{
								let $0 = $.derived(() => !table.getCanNextPage());

								Button(node_50, {
									variant: 'outline',
									class: 'hidden size-8 lg:flex',
									size: 'icon',
									onclick: () => table.setPageIndex(table.getPageCount() - 1),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_47 = root_7();
										var node_51 = $.sibling($.first_child(fragment_47), 2);

										ChevronsRightIcon(node_51, {});
										$.append($$anchor, fragment_47);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_8);
							$.reset(div_5);
							$.reset(div_3);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_7, `${$0 ?? ''} of
				${$1 ?? ''} row(s) selected.`);

									$.set_text(text_11, `Page ${$.get(pagination).pageIndex + 1} of
					${$2 ?? ''}`);
								},
								[
									() => table.getFilteredSelectedRowModel().rows.length,
									() => table.getFilteredRowModel().rows.length,
									() => table.getPageCount()
								]
							);

							$.append($$anchor, fragment_25);
						},
						$$slots: { default: true }
					});
				});

				var node_52 = $.sibling(node_24, 2);

				$.component(node_52, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'past-performance',
						class: 'flex flex-col px-4 lg:px-6',
						children: ($$anchor, $$slotProps) => {
							var div_9 = root_9();

							$.append($$anchor, div_9);
						},
						$$slots: { default: true }
					});
				});

				var node_53 = $.sibling(node_52, 2);

				$.component(node_53, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
					Tabs_Content_2($$anchor, {
						value: 'key-personnel',
						class: 'flex flex-col px-4 lg:px-6',
						children: ($$anchor, $$slotProps) => {
							var div_10 = root_9();

							$.append($$anchor, div_10);
						},
						$$slots: { default: true }
					});
				});

				var node_54 = $.sibling(node_53, 2);

				$.component(node_54, () => Tabs.Content, ($$anchor, Tabs_Content_3) => {
					Tabs_Content_3($$anchor, {
						value: 'focus-documents',
						class: 'flex flex-col px-4 lg:px-6',
						children: ($$anchor, $$slotProps) => {
							var div_11 = root_9();

							$.append($$anchor, div_11);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_6);
	$.pop();
}