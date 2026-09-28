import * as $ from 'svelte/internal/server';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronUp from '@lucide/svelte/icons/chevron-up';
import { getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
import { fetchUsers } from '$data/api/data/users';
import { createSvelteTable, FlexRender, renderSnippet } from '$lib/components/ui/data-table';

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

export default function Table_14($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const columns = [
			{
				accessorKey: 'name',
				cell: ({ row }) => {
					const nameSnippet = createRawSnippet((getName) => {
						const name = getName();

						return {
							render: () => `<div class="truncate font-medium">${name}</div>`
						};
					});

					return renderSnippet(nameSnippet, row.getValue('name'));
				},
				header: 'Name',
				sortDescFirst: false,
				sortUndefined: 'last'
			},
			{ accessorKey: 'email', header: 'Email' },
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
				header: 'Location'
			},
			{ accessorKey: 'status', header: 'Status' },
			{
				accessorKey: 'balance',
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue('balance'));
					const formatted = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(amount);

					return formatted;
				},
				header: 'Balance'
			},
			{ accessorKey: 'department', header: 'Department' },
			{ accessorKey: 'role', header: 'Role' },
			{ accessorKey: 'joinDate', header: 'Join Date' },
			{ accessorKey: 'lastActive', header: 'Last Active' },
			{ accessorKey: 'performance', header: 'Performance' }
		];

		let sorting = [{ desc: false, id: 'name' }];
		let columnSizing = {};
		let data = [];

		const table = createSvelteTable({
			columnResizeMode: 'onChange',
			columns,
			get data() {
				return data;
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel(),
			onColumnSizingChange: (updater) => {
				if (typeof updater === 'function') {
					columnSizing = updater(columnSizing);
				} else {
					columnSizing = updater;
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
				get columnSizing() {
					return columnSizing;
				},

				get sorting() {
					return sorting;
				}
			}
		});

		$$renderer.push(`<div>`);

		Table($$renderer, {
			class: 'table-fixed',
			style: `width: ${$.stringify(table.getCenterTotalSize())}px`,
			children: ($$renderer) => {
				TableHeader($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(table.getHeaderGroups());

						for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
							let headerGroup = each_array[$$index_1];

							TableRow($$renderer, {
								class: 'bg-muted/50',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(headerGroup.headers);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let header = each_array_1[$$index];

										TableHead($$renderer, {
											class: 'relative h-10 border-t select-none [&:last-child>.cursor-col-resize]:opacity-0',
											'aria-sort': header.column.getIsSorted() === 'asc'
												? 'ascending'
												: header.column.getIsSorted() === 'desc' ? 'descending' : 'none',
											colspan: header.colSpan,
											style: `width: ${$.stringify(header.getSize())}px`,
											children: ($$renderer) => {
												if (!header.isPlaceholder) {
													$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn(header.column.getCanSort() && 'flex h-full cursor-pointer items-center justify-between gap-2 select-none')))}${$.attr('tabindex', header.column.getCanSort() ? 0 : undefined)}><span class="truncate">`);

													FlexRender($$renderer, {
														content: header.column.columnDef.header,
														context: header.getContext()
													});

													$$renderer.push(`<!----></span> `);

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
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (header.column.getCanResize()) {
													$$renderer.push(`<!--[0--><div class="user-select-none before:bg-border absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:translate-x-px"></div>`);
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
												class: 'truncate',
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

		$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center text-sm">Resizable and sortable columns made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);
	});
}