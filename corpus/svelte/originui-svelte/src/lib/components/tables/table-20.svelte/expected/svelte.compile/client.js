import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const RowActions = ($$anchor) => {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					var div = root();
					var node_1 = $.child(div);

					Button(node_1, $.spread_props(
						{
							size: 'icon',
							variant: 'ghost',
							class: 'shadow-none',
							'aria-label': 'Edit item'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								Ellipsis($$anchor, { size: 16, 'aria-hidden': 'true' });
							},
							$$slots: { default: true }
						}
					));

					$.reset(div);
					$.append($$anchor, div);
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node, 2);

			DropdownMenuContent(node_2, {
				align: 'end',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_9();
					var node_3 = $.first_child(fragment_3);

					DropdownMenuGroup(node_3, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_3();
							var node_4 = $.first_child(fragment_4);

							DropdownMenuItem(node_4, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_5 = $.sibling($.first_child(fragment_5), 2);

									DropdownMenuShortcut(node_5, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('⌘E');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_4, 2);

							DropdownMenuItem(node_6, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_7 = $.sibling($.first_child(fragment_6), 2);

									DropdownMenuShortcut(node_7, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('⌘D');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_3, 2);

					DropdownMenuSeparator(node_8, {});

					var node_9 = $.sibling(node_8, 2);

					DropdownMenuGroup(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_10 = $.first_child(fragment_7);

							DropdownMenuItem(node_10, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_11 = $.sibling($.first_child(fragment_8), 2);

									DropdownMenuShortcut(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('⌘A');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_10, 2);

							DropdownMenuSub(node_12, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_3();
									var node_13 = $.first_child(fragment_9);

									DropdownMenuSubTrigger(node_13, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('More');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									DropdownMenuSubContent(node_14, {
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_5();
											var node_15 = $.first_child(fragment_10);

											DropdownMenuItem(node_15, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Move to project');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											var node_16 = $.sibling(node_15, 2);

											DropdownMenuItem(node_16, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Move to folder');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_17 = $.sibling(node_16, 2);

											DropdownMenuSeparator(node_17, {});

											var node_18 = $.sibling(node_17, 2);

											DropdownMenuItem(node_18, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Advanced options');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_9, 2);

					DropdownMenuSeparator(node_19, {});

					var node_20 = $.sibling(node_19, 2);

					DropdownMenuGroup(node_20, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_3();
							var node_21 = $.first_child(fragment_11);

							DropdownMenuItem(node_21, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_6();
									var node_22 = $.sibling($.first_child(fragment_12), 2);

									DropdownMenuShortcut(node_22, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('⌘S');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_21, 2);

							DropdownMenuItem(node_23, {
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_7();
									var node_24 = $.sibling($.first_child(fragment_13), 2);

									DropdownMenuShortcut(node_24, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('⌘F');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_20, 2);

					DropdownMenuSeparator(node_25, {});

					var node_26 = $.sibling(node_25, 2);

					DropdownMenuItem(node_26, {
						class: 'text-destructive focus:text-destructive',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_8();
							var node_27 = $.sibling($.first_child(fragment_14), 2);

							DropdownMenuShortcut(node_27, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('⌘⌫');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

var root = $.from_html(`<div class="flex justify-end"><!></div>`);
var root_1 = $.from_html(`<span>Edit</span> <!>`, 1);
var root_2 = $.from_html(`<span>Duplicate</span> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<span>Archive</span> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<span>Share</span> <!>`, 1);
var root_7 = $.from_html(`<span>Add to favorites</span> <!>`, 1);
var root_8 = $.from_html(`<span>Delete</span> <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_10 = $.from_html(`<button class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-hidden transition-[color,box-shadow] focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Clear filter"><!></button>`);
var root_11 = $.from_html(`<span class="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"> </span>`);
var root_12 = $.from_html(`<!> Status <!>`, 1);
var root_13 = $.from_html(` <span class="text-muted-foreground ms-2 text-xs"> </span>`, 1);
var root_14 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);
var root_15 = $.from_html(`<div class="space-y-3"><div class="text-muted-foreground text-xs font-medium">Filters</div> <div class="space-y-3"></div></div>`);
var root_16 = $.from_html(`<!> View`, 1);
var root_17 = $.from_html(`<!> Delete <span class="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"> </span>`, 1);
var root_18 = $.from_html(`<div class="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4"><div class="flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><!></div> <!></div> <!>`, 1);
var root_19 = $.from_html(`<!> Add user`, 1);
var root_20 = $.from_html(`<div><!> <!></div>`);
var root_21 = $.from_html(`<div class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"><!></div> <!></div> <!> <!></div> <div class="flex items-center gap-3"><!> <!></div></div> <div class="bg-background overflow-hidden rounded-md border"><!></div> <div class="flex items-center justify-between gap-8"><div class="flex items-center gap-3"><!> <!></div> <div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap"><p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite"><span class="text-foreground"> </span> of <span class="text-foreground"> </span></p></div> <div><!></div></div> <p class="text-muted-foreground mt-4 text-center text-sm">Example of a more complex table made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_20($$anchor, $$props) {
	$.push($$props, true);

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

	let columnFilters = $.state($.proxy([]));
	let columnVisibility = $.state($.proxy({}));
	let pagination = $.state($.proxy({ pageIndex: 0, pageSize: 10 }));
	let rowSelection = $.state($.proxy({}));
	let sorting = $.state($.proxy([{ desc: false, id: 'name' }]));
	let data = $.state($.proxy([]));

	$.user_effect(() => {
		fetch('https://res.cloudinary.com/dlzlfasou/raw/upload/users-01_fertyx.json').then((res) => res.json()).then((response) => {
			$.set(data, response, true);
		}).catch((err) => {
			console.error(err);
		});
	});

	function handleDeleteRows() {
		const selectedRows = table.getSelectedRowModel().rows;

		$.set(data, $.get(data).filter((item) => !selectedRows.some((row) => row.original.id === item.id)), true);
		table.resetRowSelection();
	}

	const table = createSvelteTable({
		columns,
		get data() {
			return $.get(data);
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(columnFilters, updater($.get(columnFilters)), true);
			} else {
				$.set(columnFilters, updater, true);
			}
		},

		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(columnVisibility, updater($.get(columnVisibility)), true);
			} else {
				$.set(columnVisibility, updater, true);
			}
		},

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
			get columnFilters() {
				return $.get(columnFilters);
			},

			get columnVisibility() {
				return $.get(columnVisibility);
			},

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

	var div_1 = root_21();
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var node_28 = $.child(div_4);

	{
		let $0 = $.derived(() => cn('peer min-w-60 ps-9', Boolean(table.getColumn('name')?.getFilterValue()) && 'pe-9'));
		let $1 = $.derived(() => table.getColumn('name')?.getFilterValue() ?? '');

		Input(node_28, {
			get class() {
				return $.get($0);
			},

			get value() {
				return $.get($1);
			},
			oninput: (e) => table.getColumn('name')?.setFilterValue(e.currentTarget.value),
			placeholder: 'Filter by name or email...',
			type: 'text',
			'aria-label': 'Filter by name or email'
		});
	}

	var div_5 = $.sibling(node_28, 2);
	var node_29 = $.child(div_5);

	ListFilter(node_29, { size: 16, 'aria-hidden': 'true' });
	$.reset(div_5);

	var node_30 = $.sibling(div_5, 2);

	{
		var consequent = ($$anchor) => {
			var button = root_10();
			var node_31 = $.child(button);

			CircleX(node_31, { size: 16, 'aria-hidden': 'true' });
			$.reset(button);

			$.delegated('click', button, () => {
				table.getColumn('name')?.setFilterValue('');
			});

			$.append($$anchor, button);
		};

		var d = $.derived(() => Boolean(table.getColumn('name')?.getFilterValue()));

		$.if(node_30, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(div_4);

	var node_32 = $.sibling(div_4, 2);

	Popover(node_32, {
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_3();
			var node_33 = $.first_child(fragment_15);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root_12();
							var node_34 = $.first_child(fragment_17);

							Filter(node_34, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });

							var node_35 = $.sibling(node_34, 2);

							{
								var consequent_1 = ($$anchor) => {
									var span = root_11();
									var text_10 = $.only_child(span, true);

									$.template_effect(() => $.set_text(text_10, $.get(selectedStatuses).length));
									$.append($$anchor, span);
								};

								$.if(node_35, ($$render) => {
									if ($.get(selectedStatuses).length > 0) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node_33, { child, $$slots: { child: true } });
			}

			var node_36 = $.sibling(node_33, 2);

			PopoverContent(node_36, {
				class: 'w-auto min-w-36 p-3',
				align: 'start',
				children: ($$anchor, $$slotProps) => {
					var div_6 = root_15();
					var div_7 = $.sibling($.child(div_6), 2);

					$.each(div_7, 20, () => $.get(uniqueStatusValues), (value) => value, ($$anchor, value) => {
						var div_8 = root_14();
						var node_37 = $.child(div_8);

						{
							let $0 = $.derived(() => $.get(selectedStatuses).includes(value));

							Checkbox(node_37, {
								get checked() {
									return $.get($0);
								},
								onCheckedChange: (checked) => handleStatusChange(checked, value)
							});
						}

						var node_38 = $.sibling(node_37, 2);

						Label(node_38, {
							class: 'flex grow justify-between gap-2 font-normal',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_18 = root_13();
								var text_11 = $.first_child(fragment_18);
								var span_1 = $.sibling(text_11);
								var text_12 = $.only_child(span_1, true);

								$.template_effect(
									($0) => {
										$.set_text(text_11, `${value ?? ''} `);
										$.set_text(text_12, $0);
									},
									[() => $.get(statusCounts).get(value)]
								);

								$.append($$anchor, fragment_18);
							},
							$$slots: { default: true }
						});

						$.reset(div_8);
						$.append($$anchor, div_8);
					});

					$.reset(div_7);
					$.reset(div_6);
					$.append($$anchor, div_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	var node_39 = $.sibling(node_32, 2);

	DropdownMenu(node_39, {
		children: ($$anchor, $$slotProps) => {
			var fragment_19 = root_3();
			var node_40 = $.first_child(fragment_19);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_16();
							var node_41 = $.first_child(fragment_21);

							Columns3(node_41, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					}));
				};

				DropdownMenuTrigger(node_40, { child, $$slots: { child: true } });
			}

			var node_42 = $.sibling(node_40, 2);

			DropdownMenuContent(node_42, {
				align: 'end',
				children: ($$anchor, $$slotProps) => {
					var fragment_22 = root_3();
					var node_43 = $.first_child(fragment_22);

					DropdownMenuLabel(node_43, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Toggle columns');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					$.each(node_44, 17, () => table.getAllColumns().filter((column) => column.getCanHide()), (column) => column.id, ($$anchor, column) => {
						{
							let $0 = $.derived(() => $.get(column).getIsVisible());

							DropdownMenuCheckboxItem($$anchor, {
								class: 'capitalize',
								get checked() {
									return $.get($0);
								},
								closeOnSelect: false,
								onCheckedChange: (value) => $.get(column).toggleVisibility(!!value),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text();

									$.template_effect(() => $.set_text(text_14, $.get(column).id));
									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_22);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_19);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_9 = $.sibling(div_3, 2);
	var node_45 = $.child(div_9);

	{
		var consequent_2 = ($$anchor) => {
			AlertDialogRoot($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_26 = root_3();
					var node_46 = $.first_child(fragment_26);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props({ class: 'ml-auto', variant: 'outline' }, props, {
								children: ($$anchor, $$slotProps) => {
									var fragment_28 = root_17();
									var node_47 = $.first_child(fragment_28);

									Trash(node_47, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });

									var span_2 = $.sibling(node_47, 2);
									var text_15 = $.only_child(span_2, true);

									$.template_effect(($0) => $.set_text(text_15, $0), [() => table.getSelectedRowModel().rows.length]);
									$.append($$anchor, fragment_28);
								},
								$$slots: { default: true }
							}));
						};

						AlertDialogTrigger(node_46, { child, $$slots: { child: true } });
					}

					var node_48 = $.sibling(node_46, 2);

					AlertDialogContent(node_48, {
						children: ($$anchor, $$slotProps) => {
							var fragment_29 = root_18();
							var div_10 = $.first_child(fragment_29);
							var div_11 = $.child(div_10);
							var node_49 = $.child(div_11);

							CircleAlert(node_49, { class: 'opacity-80', size: 16 });
							$.reset(div_11);

							var node_50 = $.sibling(div_11, 2);

							AlertDialogHeader(node_50, {
								children: ($$anchor, $$slotProps) => {
									var fragment_30 = root_3();
									var node_51 = $.first_child(fragment_30);

									AlertDialogTitle(node_51, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Are you absolutely sure?');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									var node_52 = $.sibling(node_51, 2);

									AlertDialogDescription(node_52, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text();

											$.template_effect(
												($0, $1) => $.set_text(text_17, `This action cannot be undone. This will permanently delete
									${$0 ?? ''} selected
									${$1 ?? ''}.`),
												[
													() => table.getSelectedRowModel().rows.length,
													() => table.getSelectedRowModel().rows.length === 1 ? 'row' : 'rows'
												]
											);

											$.append($$anchor, text_17);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_30);
								},
								$$slots: { default: true }
							});

							$.reset(div_10);

							var node_53 = $.sibling(div_10, 2);

							AlertDialogFooter(node_53, {
								children: ($$anchor, $$slotProps) => {
									var fragment_32 = root_3();
									var node_54 = $.first_child(fragment_32);

									AlertDialogCancel(node_54, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('Cancel');

											$.append($$anchor, text_18);
										},
										$$slots: { default: true }
									});

									var node_55 = $.sibling(node_54, 2);

									AlertDialogAction(node_55, {
										onclick: handleDeleteRows,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Delete');

											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_32);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_29);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_26);
				},
				$$slots: { default: true }
			});
		};

		var d_1 = $.derived(() => table.getSelectedRowModel().rows.length > 0);

		$.if(node_45, ($$render) => {
			if ($.get(d_1)) $$render(consequent_2);
		});
	}

	var node_56 = $.sibling(node_45, 2);

	Button(node_56, {
		class: 'ml-auto',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_33 = root_19();
			var node_57 = $.first_child(fragment_33);

			Plus(node_57, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_33);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);
	$.reset(div_2);

	var div_12 = $.sibling(div_2, 2);
	var node_58 = $.child(div_12);

	Table(node_58, {
		class: 'table-fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_34 = root_3();
			var node_59 = $.first_child(fragment_34);

			TableHeader(node_59, {
				children: ($$anchor, $$slotProps) => {
					var fragment_35 = $.comment();
					var node_60 = $.first_child(fragment_35);

					$.each(node_60, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
						TableRow($$anchor, {
							class: 'hover:bg-transparent',
							children: ($$anchor, $$slotProps) => {
								var fragment_37 = $.comment();
								var node_61 = $.first_child(fragment_37);

								$.each(node_61, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
									{
										let $0 = $.derived(() => $.get(header).getSize());

										TableHead($$anchor, {
											get style() {
												return `width: ${$.get($0) ?? ''}px`;
											},
											class: 'h-11',
											children: ($$anchor, $$slotProps) => {
												var fragment_39 = $.comment();
												var node_62 = $.first_child(fragment_39);

												{
													var consequent_5 = ($$anchor) => {
														var div_13 = root_20();
														var event_handler = $.derived(() => $.get(header).column.getToggleSortingHandler());
														var node_63 = $.child(div_13);

														{
															let $0 = $.derived(() => $.get(header).getContext());

															FlexRender(node_63, {
																get content() {
																	return $.get(header).column.columnDef.header;
																},

																get context() {
																	return $.get($0);
																}
															});
														}

														var node_64 = $.sibling(node_63, 2);

														{
															var consequent_3 = ($$anchor) => {
																ChevronUp($$anchor, {
																	class: 'shrink-0 opacity-60',
																	size: 16,
																	'aria-hidden': 'true'
																});
															};

															var d_2 = $.derived(() => $.get(header).column.getIsSorted() === 'asc');

															var consequent_4 = ($$anchor) => {
																ChevronDown($$anchor, {
																	class: 'shrink-0 opacity-60',
																	size: 16,
																	'aria-hidden': 'true'
																});
															};

															var d_3 = $.derived(() => $.get(header).column.getIsSorted() === 'desc');

															$.if(node_64, ($$render) => {
																if ($.get(d_2)) $$render(consequent_3); else if ($.get(d_3)) $$render(consequent_4, 1);
															});
														}

														$.reset(div_13);

														$.template_effect(
															($0, $1) => {
																$.set_class(div_13, 1, $0);
																$.set_attribute(div_13, 'tabindex', $1);
															},
															[
																() => $.clsx(cn($.get(header).column.getCanSort() && 'flex h-full cursor-pointer items-center justify-between gap-2 select-none')),
																() => $.get(header).column.getCanSort() ? 0 : undefined
															]
														);

														$.delegated('click', div_13, function (...$$args) {
															$.get(event_handler)?.apply(this, $$args);
														});

														$.delegated('keydown', div_13, (e) => {
															if ($.get(header).column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
																e.preventDefault();
																$.get(header).column.getToggleSortingHandler()?.(e);
															}
														});

														$.append($$anchor, div_13);
													};

													var d_4 = $.derived(() => !$.get(header).isPlaceholder && $.get(header).column.getCanSort());

													var consequent_6 = ($$anchor) => {
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

													var d_5 = $.derived(() => !$.get(header).isPlaceholder && !$.get(header).column.getCanSort());

													$.if(node_62, ($$render) => {
														if ($.get(d_4)) $$render(consequent_5); else if ($.get(d_5)) $$render(consequent_6, 1);
													});
												}

												$.append($$anchor, fragment_39);
											},
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_37);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_35);
				},
				$$slots: { default: true }
			});

			var node_65 = $.sibling(node_59, 2);

			TableBody(node_65, {
				children: ($$anchor, $$slotProps) => {
					var fragment_43 = $.comment();
					var node_66 = $.first_child(fragment_43);

					{
						var consequent_7 = ($$anchor) => {
							var fragment_44 = $.comment();
							var node_67 = $.first_child(fragment_44);

							$.each(
								node_67,
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
												var fragment_46 = $.comment();
												var node_68 = $.first_child(fragment_46);

												$.each(node_68, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
													TableCell($$anchor, {
														class: 'last:py-0',
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

												$.append($$anchor, fragment_46);
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

													var text_20 = $.text('No results.');

													$.append($$anchor, text_20);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								}
							);

							$.append($$anchor, fragment_44);
						};

						var d_6 = $.derived(() => table.getRowModel().rows?.length);

						$.if(node_66, ($$render) => {
							if ($.get(d_6)) $$render(consequent_7);
						});
					}

					$.append($$anchor, fragment_43);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_34);
		},
		$$slots: { default: true }
	});

	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var div_15 = $.child(div_14);
	var node_69 = $.child(div_15);

	Label(node_69, {
		class: 'max-sm:sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_21 = $.text('Rows per page');

			$.append($$anchor, text_21);
		},
		$$slots: { default: true }
	});

	var node_70 = $.sibling(node_69, 2);

	{
		let $0 = $.derived(() => table.getState().pagination.pageSize.toString());

		Select(node_70, {
			type: 'single',
			get value() {
				return $.get($0);
			},

			onValueChange: (value) => {
				table.setPageSize(Number(value));
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_51 = root_3();
				var node_71 = $.first_child(fragment_51);

				SelectTrigger(node_71, {
					class: 'w-fit whitespace-nowrap',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_22 = $.text();

						$.template_effect(($0) => $.set_text(text_22, $0), [
							() => table.getState().pagination.pageSize.toString() ?? 'Select number of results'
						]);

						$.append($$anchor, text_22);
					},
					$$slots: { default: true }
				});

				var node_72 = $.sibling(node_71, 2);

				SelectContent(node_72, {
					class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_53 = $.comment();
						var node_73 = $.first_child(fragment_53);

						$.each(node_73, 16, () => [5, 10, 25, 50], (pageSize) => pageSize, ($$anchor, pageSize) => {
							{
								let $0 = $.derived(() => pageSize.toString());

								SelectItem($$anchor, {
									get value() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_23 = $.text();

										$.template_effect(() => $.set_text(text_23, pageSize));
										$.append($$anchor, text_23);
									},
									$$slots: { default: true }
								});
							}
						});

						$.append($$anchor, fragment_53);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_51);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var p = $.child(div_16);
	var span_3 = $.child(p);
	var text_24 = $.only_child(span_3);
	var span_4 = $.sibling(span_3, 2);
	var text_25 = $.only_child(span_4, true);

	$.reset(p);
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var node_74 = $.child(div_17);

	Pagination(node_74, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_57 = root_5();
					var node_75 = $.first_child(fragment_57);

					PaginationItem(node_75, {
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

					var node_76 = $.sibling(node_75, 2);

					PaginationItem(node_76, {
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

					var node_77 = $.sibling(node_76, 2);

					PaginationItem(node_77, {
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

					var node_78 = $.sibling(node_77, 2);

					PaginationItem(node_78, {
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

					$.append($$anchor, fragment_57);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_17);
	$.reset(div_14);
	$.next(2);
	$.reset(div_1);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text_24, `${$0 ?? ''}-${$1 ?? ''}`);
			$.set_text(text_25, $2);
		},
		[
			() => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
			() => Math.min(Math.max(table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getState().pagination.pageSize, 0), table.getRowCount()),
			() => table.getRowCount().toString()
		]
	);

	$.append($$anchor, div_1);
	$.pop();
}

$.delegate(['click', 'keydown']);