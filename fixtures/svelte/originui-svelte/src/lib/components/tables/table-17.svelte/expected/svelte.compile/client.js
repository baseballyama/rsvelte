import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronUp from '@lucide/svelte/icons/chevron-up';
import Info from '@lucide/svelte/icons/info';
import { getCoreRowModel, getExpandedRowModel } from '@tanstack/table-core';
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
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

import { cn } from '$lib/utils';
import { createRawSnippet, mount, unmount } from 'svelte';

var root = $.from_html(`<div class="text-primary/80 flex items-start py-2"><span class="me-3 mt-0.5 flex w-7 shrink-0 justify-center" aria-hidden="true"><!></span> <p class="text-sm"> </p></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <p class="text-muted-foreground mt-4 text-center text-sm">Expanding sub-row made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_17($$anchor, $$props) {
	$.push($$props, true);

	const columns = [
		{
			cell: ({ row }) => {
				if (!row.getCanExpand()) return;

				return renderComponent(Button, {
					'aria-expanded': row.getIsExpanded(),
					'aria-label': row.getIsExpanded()
						? `Collapse details for ${row.original.name}`
						: `Expand details for ${row.original.name}`,

					children: createRawSnippet(() => {
						return {
							render: () => '<!---->',
							setup: (target) => {
								const icon = mount(row.getIsExpanded() ? ChevronUp : ChevronDown, {
									props: { 'aria-hidden': true, class: 'opacity-60', size: 16 },
									target: target.parentElement
								});

								return () => unmount(icon);
							}
						};
					}),
					class: 'size-7 shadow-none text-muted-foreground',
					onclick: row.getToggleExpandedHandler(),
					size: 'icon',
					variant: 'ghost'
				});
			},
			header: () => null,
			id: 'expander'
		},

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
	let expanded = $.state($.proxy({}));
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
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: (row) => Boolean(row.original.note),
		onExpandedChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(expanded, updater($.get(expanded)), true);
			} else {
				$.set(expanded, updater, true);
			}
		},

		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(rowSelection, updater($.get(rowSelection)), true);
			} else {
				$.set(rowSelection, updater, true);
			}
		},

		state: {
			get expanded() {
				return $.get(expanded);
			},

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
							var fragment_8 = root_1();
							var node_7 = $.first_child(fragment_8);

							{
								let $0 = $.derived(() => $.get(row).getIsSelected() && 'selected');

								TableRow(node_7, {
									get 'data-state'() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_9 = $.comment();
										var node_8 = $.first_child(fragment_9);

										$.each(node_8, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
											TableCell($$anchor, {
												class: 'whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0',
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

							var node_9 = $.sibling(node_7, 2);

							{
								var consequent_1 = ($$anchor) => {
									TableRow($$anchor, {
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => $.get(row).getVisibleCells().length);

												TableCell($$anchor, {
													get colspan() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var div_1 = root();
														var span = $.child(div_1);
														var node_10 = $.child(span);

														Info(node_10, { class: 'opacity-60', size: 16 });
														$.reset(span);

														var p = $.sibling(span, 2);
														var text = $.only_child(p, true);

														$.reset(div_1);
														$.template_effect(() => $.set_text(text, $.get(row).original.note));
														$.append($$anchor, div_1);
													},
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								};

								var d = $.derived(() => $.get(row).getIsExpanded());

								$.if(node_9, ($$render) => {
									if ($.get(d)) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_8);
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

											var text_1 = $.text('No results.');

											$.append($$anchor, text_1);
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}