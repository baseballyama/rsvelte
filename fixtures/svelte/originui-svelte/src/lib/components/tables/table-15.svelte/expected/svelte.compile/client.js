import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="truncate"><!></span>`);
var root_1 = $.from_html(`<!> Stick to left`, 1);
var root_2 = $.from_html(`<!> Stick to right`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="user-select-none before:bg-border absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:-translate-x-px"></div>`);
var root_5 = $.from_html(`<div class="flex items-center justify-between gap-2"><!> <!> <!></div>`);
var root_6 = $.from_html(`<div><!> <p class="text-muted-foreground mt-4 text-center text-sm">Pinnable columns made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_15($$anchor, $$props) {
	$.push($$props, true);

	let sorting = $.state($.proxy([{ desc: false, id: 'name' }]));

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

	let columnSizing = $.state($.proxy({}));
	let columnPinning = $.state($.proxy({}));
	let data = $.state($.proxy([]));

	$.user_effect(() => {
		fetchUsers().then((response) => {
			$.set(data, response.slice(0, 5), true);
		}).catch((err) => {
			console.error(err);
		});
	});

	const table = createSvelteTable({
		columnResizeMode: 'onChange',
		columns,
		get data() {
			return $.get(data);
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnPinningChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(columnPinning, updater($.get(columnPinning)), true);
			} else {
				$.set(columnPinning, updater, true);
			}
		},

		onColumnSizingChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(columnSizing, updater($.get(columnSizing)), true);
			} else {
				$.set(columnSizing, updater, true);
			}
		},

		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(sorting, updater($.get(sorting)), true);
			} else {
				$.set(sorting, updater, true);
			}
		},

		state: {
			get columnPinning() {
				return $.get(columnPinning);
			},

			get columnSizing() {
				return $.get(columnSizing);
			},

			get sorting() {
				return $.get(sorting);
			}
		}
	});

	var div = root_6();
	var node = $.child(div);

	{
		let $0 = $.derived(() => table.getCenterTotalSize());

		Table(node, {
			class: '[&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b',
			get style() {
				return `width: ${$.get($0) ?? ''}px`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				TableHeader(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
							TableRow($$anchor, {
								class: 'bg-muted/50',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.each(node_3, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
										const isPinned = $.derived(() => $.get(header).column.getIsPinned());
										const isLastLeftPinned = $.derived(() => $.get(isPinned) === 'left' && $.get(header).column.getIsLastColumn('left'));
										const isFirstRightPinned = $.derived(() => $.get(isPinned) === 'right' && $.get(header).column.getIsFirstColumn('right'));

										{
											let $0 = $.derived(() => $.get(header).column.getIsSorted() === 'asc'
												? 'ascending'
												: $.get(header).column.getIsSorted() === 'desc' ? 'descending' : 'none');

											let $1 = $.derived(() => $.get(isPinned) || undefined);

											let $2 = $.derived(() => $.get(isLastLeftPinned)
												? 'left'
												: $.get(isFirstRightPinned) ? 'right' : undefined);

											let $3 = $.derived(() => getPinningStyles($.get(header).column));

											TableHead($$anchor, {
												class: 'data-pinned:bg-muted/90 [&[data-pinned][data-last-col]]:border-border relative h-10 truncate border-t data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l',
												get 'aria-sort'() {
													return $.get($0);
												},

												get colspan() {
													return $.get(header).colSpan;
												},

												get 'data-pinned'() {
													return $.get($1);
												},

												get 'data-last-col'() {
													return $.get($2);
												},

												get style() {
													return $.get($3);
												},

												children: ($$anchor, $$slotProps) => {
													var div_1 = root_5();
													var node_4 = $.child(div_1);

													{
														var consequent = ($$anchor) => {
															var span = root();
															var node_5 = $.child(span);

															{
																let $0 = $.derived(() => $.get(header).getContext());

																FlexRender(node_5, {
																	get content() {
																		return $.get(header).column.columnDef.header;
																	},

																	get context() {
																		return $.get($0);
																	}
																});
															}

															$.reset(span);
															$.append($$anchor, span);
														};

														$.if(node_4, ($$render) => {
															if (!$.get(header).isPlaceholder) $$render(consequent);
														});
													}

													var node_6 = $.sibling(node_4, 2);

													{
														var consequent_1 = ($$anchor) => {
															Button($$anchor, {
																size: 'icon',
																variant: 'ghost',
																class: '-mr-1 size-7 shadow-none',
																onclick: () => $.get(header).column.pin(false),
																get 'aria-label'() {
																	return `Unpin ${$.get(header).column.columnDef.header ?? ''} column`;
																},

																get title() {
																	return `Unpin ${$.get(header).column.columnDef.header ?? ''} column`;
																},

																children: ($$anchor, $$slotProps) => {
																	PinOffIcon($$anchor, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
																},
																$$slots: { default: true }
															});
														};

														var d = $.derived(() => !$.get(header).isPlaceholder && $.get(header).column.getCanPin() && $.get(header).column.getIsPinned());

														var alternate = ($$anchor) => {
															DropdownMenu($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = root_3();
																	var node_7 = $.first_child(fragment_8);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;

																			Button($$anchor, $.spread_props(
																				{
																					size: 'icon',
																					variant: 'ghost',
																					class: '-mr-1 size-7 shadow-none',
																					get 'aria-label'() {
																						return `Pin options for ${$.get(header).column.columnDef.header ?? ''} column`;
																					},

																					get title() {
																						return `Pin options for ${$.get(header).column.columnDef.header ?? ''} column`;
																					}
																				},
																				props,
																				{
																					children: ($$anchor, $$slotProps) => {
																						EllipsisIcon($$anchor, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
																					},
																					$$slots: { default: true }
																				}
																			));
																		};

																		DropdownMenuTrigger(node_7, { child, $$slots: { child: true } });
																	}

																	var node_8 = $.sibling(node_7, 2);

																	DropdownMenuContent(node_8, {
																		align: 'end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = root_3();
																			var node_9 = $.first_child(fragment_11);

																			DropdownMenuItem(node_9, {
																				onclick: () => $.get(header).column.pin('left'),
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_1();
																					var node_10 = $.first_child(fragment_12);

																					ArrowLeftToLineIcon(node_10, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
																					$.next();
																					$.append($$anchor, fragment_12);
																				},
																				$$slots: { default: true }
																			});

																			var node_11 = $.sibling(node_9, 2);

																			DropdownMenuItem(node_11, {
																				onclick: () => $.get(header).column.pin('right'),
																				children: ($$anchor, $$slotProps) => {
																					var fragment_13 = root_2();
																					var node_12 = $.first_child(fragment_13);

																					ArrowRightToLineIcon(node_12, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
																					$.next();
																					$.append($$anchor, fragment_13);
																				},
																				$$slots: { default: true }
																			});

																			$.append($$anchor, fragment_11);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														};

														$.if(node_6, ($$render) => {
															if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
														});
													}

													var node_13 = $.sibling(node_6, 2);

													{
														var consequent_2 = ($$anchor) => {
															var div_2 = root_4();
															var event_handler = $.derived(() => $.get(header).getResizeHandler());
															var event_handler_1 = $.derived(() => $.get(header).getResizeHandler());

															$.delegated('dblclick', div_2, () => $.get(header).column.resetSize());

															$.delegated('mousedown', div_2, function (...$$args) {
																$.get(event_handler)?.apply(this, $$args);
															});

															$.delegated(
																'touchstart',
																div_2,
																function (...$$args) {
																	$.get(event_handler_1)?.apply(this, $$args);
																},
																void 0,
																true
															);

															$.append($$anchor, div_2);
														};

														var d_1 = $.derived(() => $.get(header).column.getCanResize());

														$.if(node_13, ($$render) => {
															if ($.get(d_1)) $$render(consequent_2);
														});
													}

													$.reset(div_1);
													$.append($$anchor, div_1);
												},
												$$slots: { default: true }
											});
										}
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_1, 2);

				TableBody(node_14, {
					children: ($$anchor, $$slotProps) => {
						var fragment_14 = $.comment();
						var node_15 = $.first_child(fragment_14);

						$.each(
							node_15,
							17,
							() => table.getRowModel().rows,
							(row) => row.id,
							($$anchor, row) => {
								{
									let $0 = $.derived(() => $.get(row).getIsSelected() && 'selected');

									TableRow($$anchor, {
										get 'data-state'() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_16 = $.comment();
											var node_16 = $.first_child(fragment_16);

											$.each(node_16, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
												const isPinned = $.derived(() => $.get(cell).column.getIsPinned());
												const isLastLeftPinned = $.derived(() => $.get(isPinned) === 'left' && $.get(cell).column.getIsLastColumn('left'));
												const isFirstRightPinned = $.derived(() => $.get(isPinned) === 'right' && $.get(cell).column.getIsFirstColumn('right'));

												{
													let $0 = $.derived(() => getPinningStyles($.get(cell).column));
													let $1 = $.derived(() => $.get(isPinned) || undefined);

													let $2 = $.derived(() => $.get(isLastLeftPinned)
														? 'left'
														: $.get(isFirstRightPinned) ? 'right' : undefined);

													TableCell($$anchor, {
														class: 'data-pinned:bg-background/90 [&[data-pinned][data-last-col]]:border-border truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l',
														get style() {
															return $.get($0);
														},

														get 'data-pinned'() {
															return $.get($1);
														},

														get 'data-last-col'() {
															return $.get($2);
														},

														children: ($$anchor, $$slotProps) => {
															{
																let $0 = $.derived(() => $.get(cell).getContext());

																FlexRender($$anchor, {
																	get content() {
																		return $.get(cell).column.columnDef.cell;
																	},

																	get context() {
																		return $.get($0);
																	}
																});
															}
														},
														$$slots: { default: true }
													});
												}
											});

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								}
							},
							($$anchor) => {
								TableRow($$anchor, {
									children: ($$anchor, $$slotProps) => {
										TableCell($$anchor, {
											get colspan() {
												return columns.length;
											},
											class: 'h-24 text-center',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('No results.');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}
						);

						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['dblclick', 'mousedown', 'touchstart']);