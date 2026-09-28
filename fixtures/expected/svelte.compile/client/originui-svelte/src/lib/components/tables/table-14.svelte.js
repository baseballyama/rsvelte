import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><span class="truncate"><!></span> <!></div>`);
var root_1 = $.from_html(`<div class="user-select-none before:bg-border absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:translate-x-px"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <p class="text-muted-foreground mt-4 text-center text-sm">Resizable and sortable columns made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_14($$anchor, $$props) {
	$.push($$props, true);

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

	let sorting = $.state($.proxy([{ desc: false, id: 'name' }]));
	let columnSizing = $.state($.proxy({}));
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
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
			get columnSizing() {
				return $.get(columnSizing);
			},

			get sorting() {
				return $.get(sorting);
			}
		}
	});

	var div = root_3();
	var node = $.child(div);

	{
		let $0 = $.derived(() => table.getCenterTotalSize());

		Table(node, {
			class: 'table-fixed',
			get style() {
				return `width: ${$.get($0) ?? ''}px`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
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
										{
											let $0 = $.derived(() => $.get(header).column.getIsSorted() === 'asc'
												? 'ascending'
												: $.get(header).column.getIsSorted() === 'desc' ? 'descending' : 'none');

											let $1 = $.derived(() => $.get(header).getSize());

											TableHead($$anchor, {
												class: 'relative h-10 border-t select-none [&:last-child>.cursor-col-resize]:opacity-0',
												get 'aria-sort'() {
													return $.get($0);
												},

												get colspan() {
													return $.get(header).colSpan;
												},

												get style() {
													return `width: ${$.get($1) ?? ''}px`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_4 = $.first_child(fragment_5);

													{
														var consequent_2 = ($$anchor) => {
															var div_1 = root();
															var event_handler = $.derived(() => $.get(header).column.getToggleSortingHandler());
															var span = $.child(div_1);
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

															var node_6 = $.sibling(span, 2);

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

															$.reset(div_1);

															$.template_effect(
																($0, $1) => {
																	$.set_class(div_1, 1, $0);
																	$.set_attribute(div_1, 'tabindex', $1);
																},
																[
																	() => $.clsx(cn($.get(header).column.getCanSort() && 'flex h-full cursor-pointer items-center justify-between gap-2 select-none')),
																	() => $.get(header).column.getCanSort() ? 0 : undefined
																]
															);

															$.delegated('click', div_1, function (...$$args) {
																$.get(event_handler)?.apply(this, $$args);
															});

															$.delegated('keydown', div_1, (e) => {
																// Enhanced keyboard handling for sorting
																if ($.get(header).column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
																	e.preventDefault();
																	$.get(header).column.getToggleSortingHandler()?.(e);
																}
															});

															$.append($$anchor, div_1);
														};

														$.if(node_4, ($$render) => {
															if (!$.get(header).isPlaceholder) $$render(consequent_2);
														});
													}

													var node_7 = $.sibling(node_4, 2);

													{
														var consequent_3 = ($$anchor) => {
															var div_2 = root_1();
															var event_handler_1 = $.derived(() => $.get(header).getResizeHandler());
															var event_handler_2 = $.derived(() => $.get(header).getResizeHandler());

															$.delegated('dblclick', div_2, () => $.get(header).column.resetSize());

															$.delegated('mousedown', div_2, function (...$$args) {
																$.get(event_handler_1)?.apply(this, $$args);
															});

															$.delegated(
																'touchstart',
																div_2,
																function (...$$args) {
																	$.get(event_handler_2)?.apply(this, $$args);
																},
																void 0,
																true
															);

															$.append($$anchor, div_2);
														};

														var d_2 = $.derived(() => $.get(header).column.getCanResize());

														$.if(node_7, ($$render) => {
															if ($.get(d_2)) $$render(consequent_3);
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

				var node_8 = $.sibling(node_1, 2);

				TableBody(node_8, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_9 = $.first_child(fragment_8);

						$.each(
							node_9,
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
											var fragment_10 = $.comment();
											var node_10 = $.first_child(fragment_10);

											$.each(node_10, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
												TableCell($$anchor, {
													class: 'truncate',
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

											$.append($$anchor, fragment_10);
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

						$.append($$anchor, fragment_8);
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

$.delegate(['click', 'keydown', 'dblclick', 'mousedown', 'touchstart']);