import * as $ from 'svelte/internal/server';
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

export default function Table_12($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let rowSelection = {};
		let data = [];

		const table = createSvelteTable({
			columns,
			get data() {
				return data;
			},
			getCoreRowModel: getCoreRowModel(),
			onRowSelectionChange: (updater) => {
				if (typeof updater === 'function') {
					rowSelection = updater(rowSelection);
				} else {
					rowSelection = updater;
				}
			},

			state: {
				get rowSelection() {
					return rowSelection;
				}
			}
		});

		$$renderer.push(`<div>`);

		Table($$renderer, {
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
											children: ($$renderer) => {
												if (!header.isPlaceholder) {
													$$renderer.push('<!--[0-->');

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

				$$renderer.push(`<!----> `);

				TableFooter($$renderer, {
					class: 'bg-transparent',
					children: ($$renderer) => {
						TableRow($$renderer, {
							class: 'hover:bg-transparent',
							children: ($$renderer) => {
								TableCell($$renderer, {
									colspan: 5,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Total`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'text-right',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(data.reduce((total, item) => total + item.balance, 0)))}`);
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center text-sm">Basic data table made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);
	});
}