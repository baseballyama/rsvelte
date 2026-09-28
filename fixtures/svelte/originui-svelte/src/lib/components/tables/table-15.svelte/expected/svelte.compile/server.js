import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ArrowLeftToLineIcon from '@lucide/svelte/icons/arrow-left-to-line';
import ArrowRightToLineIcon from '@lucide/svelte/icons/arrow-right-to-line';
import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
import PinOffIcon from '@lucide/svelte/icons/pin-off';
import { getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
import { fetchUsers } from '$data/api/data/users';
import { createSvelteTable, FlexRender, renderSnippet } from '$lib/components/ui/data-table';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

import { createRawSnippet } from 'svelte';

export default function Table_15($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let sorting = [{ desc: false, id: 'name' }];

		// Helper function to compute pinning styles for columns
		function getPinningStyles(column) {
			const isPinned = column.getIsPinned();

			const properties = {
				left: isPinned === 'left' ? `-${column.getStart('left')}px` : undefined,
				position: isPinned ? 'sticky' : 'relative',
				right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
				width: column.getSize() + 'px',
				'z-index': isPinned ? 1 : 0
			};

			return Object.entries(properties).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${value}`).join(';');
		}

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
				header: 'Name'
			},
			{ accessorKey: 'email', header: 'Email' },
			{
				accessorKey: 'location',
				cell: ({ row }) => {
					const locationSnippet = createRawSnippet((args) => {
						const { flag, location } = args();

						return {
							render: () => `
							<div class="truncate">
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

		let columnSizing = {};
		let columnPinning = {};
		let data = [];

		const table = createSvelteTable({
			columnResizeMode: 'onChange',
			columns,
			get data() {
				return data;
			},
			enableSortingRemoval: false,
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel(),
			onColumnPinningChange: (updater) => {
				if (typeof updater === 'function') {
					columnPinning = updater(columnPinning);
				} else {
					columnPinning = updater;
				}
			},

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
				get columnPinning() {
					return columnPinning;
				},

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
			class: '[&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b',
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
										const isPinned = header.column.getIsPinned();
										const isLastLeftPinned = isPinned === 'left' && header.column.getIsLastColumn('left');
										const isFirstRightPinned = isPinned === 'right' && header.column.getIsFirstColumn('right');

										TableHead($$renderer, {
											class: 'data-pinned:bg-muted/90 [&[data-pinned][data-last-col]]:border-border relative h-10 truncate border-t data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l',
											'aria-sort': header.column.getIsSorted() === 'asc'
												? 'ascending'
												: header.column.getIsSorted() === 'desc' ? 'descending' : 'none',
											colspan: header.colSpan,
											'data-pinned': isPinned || undefined,
											'data-last-col': isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined,
											style: getPinningStyles(header.column),
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex items-center justify-between gap-2">`);

												if (!header.isPlaceholder) {
													$$renderer.push(`<!--[0--><span class="truncate">`);

													FlexRender($$renderer, {
														content: header.column.columnDef.header,
														context: header.getContext()
													});

													$$renderer.push(`<!----></span>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (!header.isPlaceholder && header.column.getCanPin() && header.column.getIsPinned()) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														size: 'icon',
														variant: 'ghost',
														class: '-mr-1 size-7 shadow-none',
														onclick: () => header.column.pin(false),
														'aria-label': `Unpin ${$.stringify(header.column.columnDef.header)} column`,
														title: `Unpin ${$.stringify(header.column.columnDef.header)} column`,
														children: ($$renderer) => {
															PinOffIcon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');

													DropdownMenu($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	Button($$renderer, $.spread_props([
																		{
																			size: 'icon',
																			variant: 'ghost',
																			class: '-mr-1 size-7 shadow-none',
																			'aria-label': `Pin options for ${$.stringify(header.column.columnDef.header)} column`,
																			title: `Pin options for ${$.stringify(header.column.columnDef.header)} column`
																		},
																		props,
																		{
																			children: ($$renderer) => {
																				EllipsisIcon($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
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
																	DropdownMenuItem($$renderer, {
																		onclick: () => header.column.pin('left'),
																		children: ($$renderer) => {
																			ArrowLeftToLineIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
																			$$renderer.push(`<!----> Stick to left`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	DropdownMenuItem($$renderer, {
																		onclick: () => header.column.pin('right'),
																		children: ($$renderer) => {
																			ArrowRightToLineIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
																			$$renderer.push(`<!----> Stick to right`);
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

												$$renderer.push(`<!--]--> `);

												if (header.column.getCanResize()) {
													$$renderer.push(`<!--[0--><div class="user-select-none before:bg-border absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:-translate-x-px"></div>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></div>`);
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
											const isPinned = cell.column.getIsPinned();
											const isLastLeftPinned = isPinned === 'left' && cell.column.getIsLastColumn('left');
											const isFirstRightPinned = isPinned === 'right' && cell.column.getIsFirstColumn('right');

											TableCell($$renderer, {
												class: 'data-pinned:bg-background/90 [&[data-pinned][data-last-col]]:border-border truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l',
												style: getPinningStyles(cell.column),
												'data-pinned': isPinned || undefined,
												'data-last-col': isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined,
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

		$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center text-sm">Pinnable columns made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);
	});
}