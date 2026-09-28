import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronFirst from '@lucide/svelte/icons/chevron-first';
import ChevronLast from '@lucide/svelte/icons/chevron-last';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import ChevronUp from '@lucide/svelte/icons/chevron-up';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import CircleX from '@lucide/svelte/icons/circle-x';
import Columns3 from '@lucide/svelte/icons/columns-3';
import Ellipsis from '@lucide/svelte/icons/ellipsis';
import Filter from '@lucide/svelte/icons/filter';
import ListFilter from '@lucide/svelte/icons/list-filter';
import Plus from '@lucide/svelte/icons/plus';
import Trash from '@lucide/svelte/icons/trash';

import {
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel
} from '@tanstack/table-core';

import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogRoot,
	AlertDialogTitle,
	AlertDialogTrigger
} from '$lib/components/ui/alert-dialog';

import {
	createSvelteTable,
	FlexRender,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

import { cn } from '$lib/utils';
import { createRawSnippet } from 'svelte';

function RowActions($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					$$renderer.push(`<div class="flex justify-end">`);

					Button($$renderer, $.spread_props([
						{
							size: 'icon',
							variant: 'ghost',
							class: 'shadow-none',
							'aria-label': 'Edit item'
						},
						props,
						{
							children: ($$renderer) => {
								Ellipsis($$renderer, { size: 16, 'aria-hidden': 'true' });
							},
							$$slots: { default: true }
						}
					]));

					$$renderer.push(`<!----></div>`);
				}

				DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			DropdownMenuContent($$renderer, {
				align: 'end',
				children: ($$renderer) => {
					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>Edit</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘E`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>Duplicate</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘D`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>Archive</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘A`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuSub($$renderer, {
								children: ($$renderer) => {
									DropdownMenuSubTrigger($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->More`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownMenuSubContent($$renderer, {
										children: ($$renderer) => {
											DropdownMenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Move to project`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DropdownMenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Move to folder`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);
											DropdownMenuSeparator($$renderer, {});
											$$renderer.push(`<!----> `);

											DropdownMenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Advanced options`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>Share</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘S`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>Add to favorites</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘F`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						class: 'text-destructive focus:text-destructive',
						children: ($$renderer) => {
							$$renderer.push(`<span>Delete</span> `);

							DropdownMenuShortcut($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘⌫`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}

export default function Table_20($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Custom filter function for multi-column searching
		const multiColumnFilterFn = (row, _, filterValue) => {
			const searchableRowContent = `${row.original.name} ${row.original.email}`.toLowerCase();
			const searchTerm = (filterValue ?? '').toLowerCase();

			return searchableRowContent.includes(searchTerm);
		};

		const statusFilterFn = (row, columnId, filterValue) => {
			if (!filterValue?.length) return true;

			const status = row.getValue(columnId);

			return filterValue.includes(status);
		};

		const columns = [
			{
				cell: ({ row }) => renderComponent(Checkbox, {
					'aria-label': 'Select row',
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value)
				}),
				enableHiding: false,
				enableSorting: false,
				header: ({ table }) => renderComponent(Checkbox, {
					'aria-label': 'Select all',
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
				}),
				id: 'select',
				size: 28
			},

			{
				accessorKey: 'name',
				cell: ({ row }) => {
					const nameSnippet = createRawSnippet((getName) => {
						const name = getName();

						return { render: () => `<div class="font-medium">${name}</div>` };
					});

					return renderSnippet(nameSnippet, row.getValue('name'));
				},
				enableHiding: false,
				filterFn: multiColumnFilterFn,
				header: 'Name',
				size: 180
			},
			{ accessorKey: 'email', header: 'Email', size: 220 },
			{
				accessorKey: 'location',
				cell: ({ row }) => {
					const locationSnippet = createRawSnippet((args) => {
						const { flag, location } = args();

						return {
							render: () => `
							<div>
								<span class="text-lg leading-none">${flag}</span>
								${location}
							</div>`
						};
					});

					return renderSnippet(locationSnippet, { flag: row.original.flag, location: row.getValue('location') });
				},
				header: 'Location',
				size: 180
			},

			{
				accessorKey: 'status',
				cell: ({ row }) => renderComponent(Badge, {
					children: createRawSnippet(() => {
						const status = row.getValue('status');

						return { render: () => status };
					}),
					class: cn(row.getValue('status') === 'Inactive' && 'bg-muted-foreground/60 text-primary-foreground')
				}),
				filterFn: statusFilterFn,
				header: 'Status',
				size: 100
			},
			{ accessorKey: 'performance', header: 'Performance' },
			{
				accessorKey: 'balance',
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue('balance'));
					const formatted = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(amount);

					return formatted;
				},
				header: 'Balance',
				size: 120
			},

			{
				cell: ({ row }) => renderSnippet(RowActions, { row }),
				enableHiding: false,
				header: () => renderSnippet(
					createRawSnippet(() => {
						return { render: () => `<span class="sr-only">Actions</span>` };
					}),
					{}
				),
				id: 'actions',
				size: 60
			}
		];

		let columnFilters = [];
		let columnVisibility = {};
		let pagination = { pageIndex: 0, pageSize: 10 };
		let rowSelection = {};
		let sorting = [{ desc: false, id: 'name' }];
		let data = [];

		function handleDeleteRows() {
			const selectedRows = table.getSelectedRowModel().rows;

			data = data.filter((item) => !selectedRows.some((row) => row.original.id === item.id));
			table.resetRowSelection();
		}

		const table = createSvelteTable({
			columns,
			get data() {
				return data;
			},
			enableSortingRemoval: false,
			getCoreRowModel: getCoreRowModel(),
			getFacetedUniqueValues: getFacetedUniqueValues(),
			getFilteredRowModel: getFilteredRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			getSortedRowModel: getSortedRowModel(),
			onColumnFiltersChange: (updater) => {
				if (typeof updater === 'function') {
					columnFilters = updater(columnFilters);
				} else {
					columnFilters = updater;
				}
			},

			onColumnVisibilityChange: (updater) => {
				if (typeof updater === 'function') {
					columnVisibility = updater(columnVisibility);
				} else {
					columnVisibility = updater;
				}
			},

			onPaginationChange: (updater) => {
				if (typeof updater === 'function') {
					pagination = updater(pagination);
				} else {
					pagination = updater;
				}
			},

			onRowSelectionChange: (updater) => {
				if (typeof updater === 'function') {
					rowSelection = updater(rowSelection);
				} else {
					rowSelection = updater;
				}
			},

			onSortingChange: (updater) => {
				if (typeof updater === 'function') {
					sorting = updater(sorting);
				} else {
					sorting = updater;
				}
			},

			state: {
				get columnFilters() {
					return columnFilters;
				},

				get columnVisibility() {
					return columnVisibility;
				},

				get pagination() {
					return pagination;
				},

				get rowSelection() {
					return rowSelection;
				},

				get sorting() {
					return sorting;
				}
			}
		});

		const uniqueStatusValues = $.derived(() => {
			const statusColumn = table.getColumn('status');

			if (!statusColumn) return [];

			return Array.from(statusColumn.getFacetedUniqueValues().keys()).sort();
		});

		const statusCounts = $.derived(() => {
			const statusColumn = table.getColumn('status');

			if (!statusColumn) return new Map();

			return statusColumn.getFacetedUniqueValues();
		});

		const selectedStatuses = $.derived(() => {
			const filterValue = table.getColumn('status')?.getFilterValue();

			return filterValue ?? [];
		});

		function handleStatusChange(checked, value) {
			const filterValue = table.getColumn('status')?.getFilterValue();
			const newFilterValue = filterValue ? [...filterValue] : [];

			if (checked) {
				newFilterValue.push(value);
			} else {
				const index = newFilterValue.indexOf(value);

				if (index > -1) {
					newFilterValue.splice(index, 1);
				}
			}

			table.getColumn('status')?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
		}

		$$renderer.push(`<div class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="relative">`);

		Input($$renderer, {
			class: cn('peer min-w-60 ps-9', Boolean(table.getColumn('name')?.getFilterValue()) && 'pe-9'),
			value: table.getColumn('name')?.getFilterValue() ?? '',
			oninput: (e) => table.getColumn('name')?.setFilterValue(e.currentTarget.value),
			placeholder: 'Filter by name or email...',
			type: 'text',
			'aria-label': 'Filter by name or email'
		});

		$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">`);
		ListFilter($$renderer, { size: 16, 'aria-hidden': 'true' });
		$$renderer.push(`<!----></div> `);

		if (Boolean(table.getColumn('name')?.getFilterValue())) {
			$$renderer.push(`<!--[0--><button class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-hidden transition-[color,box-shadow] focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Clear filter">`);
			CircleX($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		Popover($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							{ variant: 'outline' },
							props,
							{
								children: ($$renderer) => {
									Filter($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> Status `);

									if (selectedStatuses().length > 0) {
										$$renderer.push(`<!--[0--><span class="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">${$.escape(selectedStatuses().length)}</span>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));
					}

					PopoverTrigger($$renderer, { child, $$slots: { child: true } });
				}

				$$renderer.push(`<!----> `);

				PopoverContent($$renderer, {
					class: 'w-auto min-w-36 p-3',
					align: 'start',
					children: ($$renderer) => {
						$$renderer.push(`<div class="space-y-3"><div class="text-muted-foreground text-xs font-medium">Filters</div> <div class="space-y-3"><!--[-->`);

						const each_array = $.ensure_array_like(uniqueStatusValues());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let value = each_array[$$index];

							$$renderer.push(`<div class="flex items-center gap-2">`);

							Checkbox($$renderer, {
								checked: selectedStatuses().includes(value),
								onCheckedChange: (checked) => handleStatusChange(checked, value)
							});

							$$renderer.push(`<!----> `);

							Label($$renderer, {
								class: 'flex grow justify-between gap-2 font-normal',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(value)} <span class="text-muted-foreground ms-2 text-xs">${$.escape(statusCounts().get(value))}</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DropdownMenu($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							{ variant: 'outline' },
							props,
							{
								children: ($$renderer) => {
									Columns3($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> View`);
								},
								$$slots: { default: true }
							}
						]));
					}

					DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
				}

				$$renderer.push(`<!----> `);

				DropdownMenuContent($$renderer, {
					align: 'end',
					children: ($$renderer) => {
						DropdownMenuLabel($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle columns`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(table.getAllColumns().filter((column) => column.getCanHide()));

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let column = each_array_1[$$index_1];

							DropdownMenuCheckboxItem($$renderer, {
								class: 'capitalize',
								checked: column.getIsVisible(),
								closeOnSelect: false,
								onCheckedChange: (value) => column.toggleVisibility(!!value),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(column.id)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex items-center gap-3">`);

		if (table.getSelectedRowModel().rows.length > 0) {
			$$renderer.push('<!--[0-->');

			AlertDialogRoot($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ class: 'ml-auto', variant: 'outline' },
								props,
								{
									children: ($$renderer) => {
										Trash($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
										$$renderer.push(`<!----> Delete <span class="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">${$.escape(table.getSelectedRowModel().rows.length)}</span>`);
									},
									$$slots: { default: true }
								}
							]));
						}

						AlertDialogTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					AlertDialogContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4"><div class="flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">`);
							CircleAlert($$renderer, { class: 'opacity-80', size: 16 });
							$$renderer.push(`<!----></div> `);

							AlertDialogHeader($$renderer, {
								children: ($$renderer) => {
									AlertDialogTitle($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Are you absolutely sure?`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									AlertDialogDescription($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->This action cannot be undone. This will permanently delete
									${$.escape(table.getSelectedRowModel().rows.length)} selected
									${$.escape(table.getSelectedRowModel().rows.length === 1 ? 'row' : 'rows')}.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> `);

							AlertDialogFooter($$renderer, {
								children: ($$renderer) => {
									AlertDialogCancel($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									AlertDialogAction($$renderer, {
										onclick: handleDeleteRows,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Delete`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Button($$renderer, {
			class: 'ml-auto',
			variant: 'outline',
			children: ($$renderer) => {
				Plus($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
				$$renderer.push(`<!----> Add user`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="bg-background overflow-hidden rounded-md border">`);

		Table($$renderer, {
			class: 'table-fixed',
			children: ($$renderer) => {
				TableHeader($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_2 = $.ensure_array_like(table.getHeaderGroups());

						for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
							let headerGroup = each_array_2[$$index_3];

							TableRow($$renderer, {
								class: 'hover:bg-transparent',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_3 = $.ensure_array_like(headerGroup.headers);

									for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
										let header = each_array_3[$$index_2];

										TableHead($$renderer, {
											style: `width: ${$.stringify(header.getSize())}px`,
											class: 'h-11',
											children: ($$renderer) => {
												if (!header.isPlaceholder && header.column.getCanSort()) {
													$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn(header.column.getCanSort() && 'flex h-full cursor-pointer items-center justify-between gap-2 select-none')))}${$.attr('tabindex', header.column.getCanSort() ? 0 : undefined)}>`);

													FlexRender($$renderer, {
														content: header.column.columnDef.header,
														context: header.getContext()
													});

													$$renderer.push(`<!----> `);

													if (header.column.getIsSorted() === 'asc') {
														$$renderer.push('<!--[0-->');

														ChevronUp($$renderer, {
															class: 'shrink-0 opacity-60',
															size: 16,
															'aria-hidden': 'true'
														});
													} else if (header.column.getIsSorted() === 'desc') {
														$$renderer.push('<!--[1-->');

														ChevronDown($$renderer, {
															class: 'shrink-0 opacity-60',
															size: 16,
															'aria-hidden': 'true'
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--></div>`);
												} else if (!header.isPlaceholder && !header.column.getCanSort()) {
													$$renderer.push('<!--[1-->');

													FlexRender($$renderer, {
														content: header.column.columnDef.header,
														context: header.getContext()
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TableBody($$renderer, {
					children: ($$renderer) => {
						if (table.getRowModel().rows?.length) {
							$$renderer.push('<!--[0-->');

							const each_array_4 = $.ensure_array_like(table.getRowModel().rows);

							if (each_array_4.length !== 0) {
								$$renderer.push('<!--[-->');

								for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
									let row = each_array_4[$$index_5];

									TableRow($$renderer, {
										'data-state': row.getIsSelected() && 'selected',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_5 = $.ensure_array_like(row.getVisibleCells());

											for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
												let cell = each_array_5[$$index_4];

												TableCell($$renderer, {
													class: 'last:py-0',
													children: ($$renderer) => {
														FlexRender($$renderer, {
															content: cell.column.columnDef.cell,
															context: cell.getContext()
														});
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								}
							} else {
								$$renderer.push('<!--[!-->');

								TableRow($$renderer, {
									children: ($$renderer) => {
										TableCell($$renderer, {
											colspan: columns.length,
											class: 'h-24 text-center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->No results.`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex items-center justify-between gap-8"><div class="flex items-center gap-3">`);

		Label($$renderer, {
			class: 'max-sm:sr-only',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Rows per page`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Select($$renderer, {
			type: 'single',
			value: table.getState().pagination.pageSize.toString(),
			onValueChange: (value) => {
				table.setPageSize(Number(value));
			},

			children: ($$renderer) => {
				SelectTrigger($$renderer, {
					class: 'w-fit whitespace-nowrap',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(table.getState().pagination.pageSize.toString() ?? 'Select number of results')}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SelectContent($$renderer, {
					class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_6 = $.ensure_array_like([5, 10, 25, 50]);

						for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
							let pageSize = each_array_6[$$index_6];

							SelectItem($$renderer, {
								value: pageSize.toString(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(pageSize)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap"><p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite"><span class="text-foreground">${$.escape(table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1)}-${$.escape(Math.min(Math.max(table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getState().pagination.pageSize, 0), table.getRowCount()))}</span> of <span class="text-foreground">${$.escape(table.getRowCount().toString())}</span></p></div> <div>`);

		Pagination($$renderer, {
			children: ($$renderer) => {
				PaginationContent($$renderer, {
					children: ($$renderer) => {
						PaginationItem($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.firstPage(),
									disabled: !table.getCanPreviousPage(),
									'aria-label': 'Go to first page',
									children: ($$renderer) => {
										ChevronFirst($$renderer, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.previousPage(),
									disabled: !table.getCanPreviousPage(),
									'aria-label': 'Go to previous page',
									children: ($$renderer) => {
										ChevronLeft($$renderer, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.nextPage(),
									disabled: !table.getCanNextPage(),
									'aria-label': 'Go to next page',
									children: ($$renderer) => {
										ChevronRight($$renderer, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.lastPage(),
									disabled: !table.getCanNextPage(),
									'aria-label': 'Go to last page',
									children: ($$renderer) => {
										ChevronLast($$renderer, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <p class="text-muted-foreground mt-4 text-center text-sm">Example of a more complex table made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);
	});
}