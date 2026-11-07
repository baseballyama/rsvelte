import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronFirst from '@lucide/svelte/icons/chevron-first';
import ChevronLast from '@lucide/svelte/icons/chevron-last';
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

import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';
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

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-4"><div class="bg-background overflow-hidden rounded-md border"><!></div> <div class="flex items-center justify-between gap-8"><div class="flex items-center gap-3"><!> <!></div> <div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap"><p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite"><span class="text-foreground"> </span> of <span class="text-foreground"> </span></p></div> <div><!></div></div> <p class="text-muted-foreground mt-4 text-center text-sm">Paginated table made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_18($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const columns = [
		{
			cell: ({ row }) => renderComponent(Checkbox, {
				'aria-label': 'Select row',
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value)
			}),
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

	let pagination = $.state($.proxy({ pageIndex: 0, pageSize: 5 }));
	let sorting = $.state($.proxy([{ desc: false, id: 'name' }]));
	let rowSelection = $.state($.proxy({}));
	let data = $.state($.proxy([]));

	$.user_effect(() => {
		fetchUsers().then((response) => {
			$.set(data, [...response], true);
		}).catch((err) => {
			console.error(err);
		});
	});

	const table = createSvelteTable({
		columns,
		get data() {
			return $.get(data);
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(pagination, updater($.get(pagination)), true);
			} else {
				$.set(pagination, updater, true);
			}
		},

		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(rowSelection, updater($.get(rowSelection)), true);
			} else {
				$.set(rowSelection, updater, true);
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
			get pagination() {
				return $.get(pagination);
			},

			get rowSelection() {
				return $.get(rowSelection);
			},

			get sorting() {
				return $.get(sorting);
			}
		}
	});

	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Table(node, {
		class: 'table-fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			TableHeader(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.each(node_2, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
						TableRow($$anchor, {
							class: 'hover:bg-transparent',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.each(node_3, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
									{
										let $0 = $.derived(() => $.get(header).getSize());

										TableHead($$anchor, {
											get style() {
												return `width: ${$.get($0) ?? ''}px`;
											},
											class: 'h-11',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_4 = $.first_child(fragment_5);

												{
													var consequent_2 = ($$anchor) => {
														var div_2 = root();
														var event_handler = $.derived(() => $.get(header).column.getToggleSortingHandler());
														var node_5 = $.child(div_2);

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

														var node_6 = $.sibling(node_5, 2);

														{
															var consequent = ($$anchor) => {
																ChevronUp($$anchor, {
																	class: 'shrink-0 opacity-60',
																	size: 16,
																	'aria-hidden': 'true'
																});
															};

															var d = $.derived(() => $.get(header).column.getIsSorted() === 'asc');

															var consequent_1 = ($$anchor) => {
																ChevronDown($$anchor, {
																	class: 'shrink-0 opacity-60',
																	size: 16,
																	'aria-hidden': 'true'
																});
															};

															var d_1 = $.derived(() => $.get(header).column.getIsSorted() === 'desc');

															$.if(node_6, ($$render) => {
																if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1);
															});
														}

														$.reset(div_2);

														$.template_effect(
															($0, $1) => {
																$.set_class(div_2, 1, $0);
																$.set_attribute(div_2, 'tabindex', $1);
															},
															[
																() => $.clsx(cn($.get(header).column.getCanSort() && 'flex h-full cursor-pointer items-center justify-between gap-2 select-none')),
																() => $.get(header).column.getCanSort() ? 0 : undefined
															]
														);

														$.delegated('click', div_2, function (...$$args) {
															$.get(event_handler)?.apply(this, $$args);
														});

														$.delegated('keydown', div_2, (e) => {
															// Enhanced keyboard handling for sorting
															if ($.get(header).column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
																e.preventDefault();
																$.get(header).column.getToggleSortingHandler()?.(e);
															}
														});

														$.append($$anchor, div_2);
													};

													var d_2 = $.derived(() => !$.get(header).isPlaceholder && $.get(header).column.getCanSort());

													var consequent_3 = ($$anchor) => {
														{
															let $0 = $.derived(() => $.get(header).getContext());

															FlexRender($$anchor, {
																get content() {
																	return $.get(header).column.columnDef.header;
																},

																get context() {
																	return $.get($0);
																}
															});
														}
													};

													var d_3 = $.derived(() => !$.get(header).isPlaceholder && !$.get(header).column.getCanSort());

													$.if(node_4, ($$render) => {
														if ($.get(d_2)) $$render(consequent_2); else if ($.get(d_3)) $$render(consequent_3, 1);
													});
												}

												$.append($$anchor, fragment_5);
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

			var node_7 = $.sibling(node_1, 2);

			TableBody(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = $.comment();
					var node_8 = $.first_child(fragment_9);

					$.each(
						node_8,
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
										var fragment_11 = $.comment();
										var node_9 = $.first_child(fragment_11);

										$.each(node_9, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
											TableCell($$anchor, {
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
										});

										$.append($$anchor, fragment_11);
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

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node_10 = $.child(div_4);

	Label(node_10, {
		get for() {
			return id;
		},
		class: 'max-sm:sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Rows per page');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	{
		let $0 = $.derived(() => table.getState().pagination.pageSize.toString());

		Select(node_11, {
			type: 'single',
			get value() {
				return $.get($0);
			},

			onValueChange: (value) => {
				table.setPageSize(Number(value));
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_16 = root_1();
				var node_12 = $.first_child(fragment_16);

				SelectTrigger(node_12, {
					placeholder: 'Select number of results',
					get id() {
						return id;
					},
					class: 'w-fit whitespace-nowrap',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(($0) => $.set_text(text_2, $0), [() => table.getState().pagination.pageSize.toString()]);
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				SelectContent(node_13, {
					class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_18 = $.comment();
						var node_14 = $.first_child(fragment_18);

						$.each(node_14, 16, () => [5, 10, 25, 50], (pageSize) => pageSize, ($$anchor, pageSize) => {
							{
								let $0 = $.derived(() => pageSize.toString());

								SelectItem($$anchor, {
									get value() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, pageSize));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							}
						});

						$.append($$anchor, fragment_18);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_16);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var p = $.child(div_5);
	var span = $.child(p);
	var text_4 = $.only_child(span);
	var span_1 = $.sibling(span, 2);
	var text_5 = $.only_child(span_1, true);

	$.reset(p);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_15 = $.child(div_6);

	Pagination(node_15, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_22 = root_2();
					var node_16 = $.first_child(fragment_22);

					PaginationItem(node_16, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => !table.getCanPreviousPage());

								Button($$anchor, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.firstPage(),
									get disabled() {
										return $.get($0);
									},
									'aria-label': 'Go to first page',
									children: ($$anchor, $$slotProps) => {
										ChevronFirst($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					PaginationItem(node_17, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => !table.getCanPreviousPage());

								Button($$anchor, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.previousPage(),
									get disabled() {
										return $.get($0);
									},
									'aria-label': 'Go to previous page',
									children: ($$anchor, $$slotProps) => {
										ChevronLeft($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					PaginationItem(node_18, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => !table.getCanNextPage());

								Button($$anchor, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.nextPage(),
									get disabled() {
										return $.get($0);
									},
									'aria-label': 'Go to next page',
									children: ($$anchor, $$slotProps) => {
										ChevronRight($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					PaginationItem(node_19, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => !table.getCanNextPage());

								Button($$anchor, {
									size: 'icon',
									variant: 'outline',
									class: 'disabled:pointer-events-none disabled:opacity-50',
									onclick: () => table.lastPage(),
									get disabled() {
										return $.get($0);
									},
									'aria-label': 'Go to last page',
									children: ($$anchor, $$slotProps) => {
										ChevronLast($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_22);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_3);
	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text_4, `${$0 ?? ''}
					-
					${$1 ?? ''}`);

			$.set_text(text_5, $2);
		},
		[
			() => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
			() => Math.min(Math.max(table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getState().pagination.pageSize, 0), table.getRowCount()),
			() => table.getRowCount().toString()
		]
	);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);