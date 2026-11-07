import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import { usePagination } from '$lib/hooks/use-pagination.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import ChevronUp from '@lucide/svelte/icons/chevron-up';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/table-core';
import { fetchUsers } from '$data/api/data/users';

import {
	createSvelteTable,
	FlexRender,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem
} from '$lib/components/ui/pagination';

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

export default function Table_19($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// SelectValue
		const columns = [
			{
				cell: ({ row }) => renderComponent(Checkbox, {
					'aria-label': 'Select row',
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value)
				}),
				enableSorting: false,
				header: ({ table }) => renderComponent(Checkbox, {
					'aria-label': 'Select all rows',
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
				header: 'Name',
				size: 180
			},
			{ accessorKey: 'email', header: 'Email', size: 200 },
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
				header: 'Status',
				size: 120
			},

			{
				accessorKey: 'balance',
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue('balance'));
					const formatted = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(amount);

					return formatted;
				},
				header: 'Balance',
				size: 120
			}
		];

		let pageSize = 5;
		let pagination = { pageIndex: 0, pageSize };
		let sorting = [{ desc: false, id: 'name' }];
		let rowSelection = {};
		let data = [];

		const table = createSvelteTable({
			columns,
			get data() {
				return data;
			},
			enableSortingRemoval: false,
			getCoreRowModel: getCoreRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			getSortedRowModel: getSortedRowModel(),
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

		const paginated = $.derived(() => usePagination({
			currentPage: table.getState().pagination.pageIndex + 1,
			paginationItemsToDisplay: 5,
			totalPages: table.getPageCount()
		}));

		$$renderer.push(`<div class="space-y-4"><div class="bg-background overflow-hidden rounded-md border">`);

		Table($$renderer, {
			class: 'table-fixed',
			children: ($$renderer) => {
				TableHeader($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(table.getHeaderGroups());

						for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
							let headerGroup = each_array[$$index_1];

							TableRow($$renderer, {
								class: 'hover:bg-transparent',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(headerGroup.headers);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let header = each_array_1[$$index];

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
						const each_array_2 = $.ensure_array_like(table.getRowModel().rows);

						if (each_array_2.length !== 0) {
							$$renderer.push('<!--[-->');

							for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
								let row = each_array_2[$$index_3];

								TableRow($$renderer, {
									'data-state': row.getIsSelected() && 'selected',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_3 = $.ensure_array_like(row.getVisibleCells());

										for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
											let cell = each_array_3[$$index_2];

											TableCell($$renderer, {
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
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex items-center justify-between gap-3 max-sm:flex-col"><p class="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">Page <span class="text-foreground">${$.escape(table.getState().pagination.pageIndex + 1)}</span> of <span class="text-foreground">${$.escape(table.getPageCount())}</span></p> <div class="grow">`);

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

						if (paginated().showLeftEllipsis) {
							$$renderer.push('<!--[0-->');

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationEllipsis($$renderer, {});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						const each_array_4 = $.ensure_array_like(paginated().pages);

						if (each_array_4.length !== 0) {
							$$renderer.push('<!--[-->');

							for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
								let page = each_array_4[$$index_4];
								const isActive = page === table.getState().pagination.pageIndex + 1;

								PaginationItem($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											size: 'icon',
											variant: isActive ? 'outline' : 'ghost',
											onclick: () => table.setPageIndex(page - 1),
											'aria-current': isActive ? 'page' : undefined,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(page)}`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}
						} else {
							$$renderer.push(`<!--[!--><p>empty</p>`);
						}

						$$renderer.push(`<!--]--> `);

						if (paginated().showRightEllipsis) {
							$$renderer.push('<!--[0-->');

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationEllipsis($$renderer, {});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

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

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex flex-1 justify-end">`);

		Select($$renderer, {
			type: 'single',
			value: table.getState().pagination.pageSize.toString(),
			onValueChange: (value) => {
				table.setPageSize(Number(value));
			},

			children: ($$renderer) => {
				SelectTrigger($$renderer, {
					id: 'results-per-page',
					class: 'w-fit whitespace-nowrap',
					placeholder: 'Select number of results',
					'aria-label': 'Results per page',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(table.getState().pagination.pageSize.toString())} / page`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SelectContent($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_5 = $.ensure_array_like([5, 10, 25, 50]);

						for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
							let pageSize = each_array_5[$$index_5];

							SelectItem($$renderer, {
								value: pageSize.toString(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(pageSize)} / page`);
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

		$$renderer.push(`<!----></div></div> <p class="text-muted-foreground mt-4 text-center text-sm">Numeric pagination made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);
	});
}