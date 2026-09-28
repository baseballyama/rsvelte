import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import { getCoreRowModel } from '@tanstack/table-core';
import { fetchUsers } from '$data/api/data/users';

import {
	createSvelteTable,
	FlexRender,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

import { cn } from '$lib/utils';
import { createRawSnippet } from 'svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <p class="text-muted-foreground mt-4 text-center text-sm">Basic data table made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_12($$anchor, $$props) {
	$.push($$props, true);

	const columns = [
		{
			cell: ({ row }) => renderComponent(Checkbox, {
				'aria-label': 'Select row',
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value)
			}),

			header: ({ table }) => renderComponent(Checkbox, {
				'aria-label': 'Select all',
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
			}),
			id: 'select'
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

		{
			accessorKey: 'status',
			cell: ({ row }) => renderComponent(Badge, {
				children: createRawSnippet(() => {
					const status = row.getValue('status');

					return { render: () => status };
				}),
				class: cn(row.getValue('status') === 'Inactive' && 'bg-muted-foreground/60 text-primary-foreground')
			}),
			header: 'Status'
		},

		{
			accessorKey: 'balance',
			cell: ({ row }) => {
				return renderSnippet(
					createRawSnippet((getBalance) => {
						const balance = getBalance();
						const formatted = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(parseFloat(balance));

						return { render: () => `<div class="text-right">${formatted}</div>` };
					}),
					row.getValue('balance')
				);
			},

			header: () => {
				const nameSnippet = createRawSnippet(() => {
					return { render: () => `<div class="text-right">Balance</div>` };
				});

				return renderSnippet(nameSnippet, {});
			}
		}
	];

	let rowSelection = $.state($.proxy({}));
	let data = $.state($.proxy([]));

	$.user_effect(() => {
		fetchUsers().then((response) => {
			$.set(data, response.slice(0, 5), true);
		}).catch((err) => {
			console.error(err);
		});
	});

	const table = createSvelteTable({
		columns,
		get data() {
			return $.get(data);
		},
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(rowSelection, updater($.get(rowSelection)), true);
			} else {
				$.set(rowSelection, updater, true);
			}
		},

		state: {
			get rowSelection() {
				return $.get(rowSelection);
			}
		}
	});

	var div = root_2();
	var node = $.child(div);

	Table(node, {
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
									TableHead($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_4 = $.first_child(fragment_5);

											{
												var consequent = ($$anchor) => {
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

												$.if(node_4, ($$render) => {
													if (!$.get(header).isPlaceholder) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
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

			var node_5 = $.sibling(node_1, 2);

			TableBody(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = $.comment();
					var node_6 = $.first_child(fragment_7);

					$.each(
						node_6,
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
										var fragment_9 = $.comment();
										var node_7 = $.first_child(fragment_9);

										$.each(node_7, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
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

										$.append($$anchor, fragment_9);
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

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_5, 2);

			TableFooter(node_8, {
				class: 'bg-transparent',
				children: ($$anchor, $$slotProps) => {
					TableRow($$anchor, {
						class: 'hover:bg-transparent',
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root();
							var node_9 = $.first_child(fragment_15);

							TableCell(node_9, {
								colspan: 5,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Total');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							TableCell(node_10, {
								class: 'text-right',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									$.template_effect(($0) => $.set_text(text_2, $0), [
										() => new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format($.get(data).reduce((total, item) => total + item.balance, 0))
									]);

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}