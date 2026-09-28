<script lang="ts">
	import type { User } from '$data/api/data/users.handlers';

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
		type ColumnDef,
		type ColumnFiltersState,
		type FilterFn,
		getCoreRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState
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

	// Custom filter function for multi-column searching
	const multiColumnFilterFn: FilterFn<User> = (row, _, filterValue) => {
		const searchableRowContent = `${row.original.name} ${row.original.email}`.toLowerCase();
		const searchTerm = (filterValue ?? '').toLowerCase();
		return searchableRowContent.includes(searchTerm);
	};

	const statusFilterFn: FilterFn<User> = (row, columnId, filterValue: string[]) => {
		if (!filterValue?.length) return true;
		const status = row.getValue(columnId) as string;
		return filterValue.includes(status);
	};

	const columns: ColumnDef<User>[] = [
		{
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					'aria-label': 'Select row',
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value)
				}),
			enableHiding: false,
			enableSorting: false,
			header: ({ table }) =>
				renderComponent(Checkbox, {
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
				const nameSnippet = createRawSnippet<[string]>((getName) => {
					const name = getName();
					return {
						render: () => `<div class="font-medium">${name}</div>`
					};
				});
				return renderSnippet(nameSnippet, row.getValue('name'));
			},
			enableHiding: false,
			filterFn: multiColumnFilterFn,
			header: 'Name',
			size: 180
		},
		{
			accessorKey: 'email',
			header: 'Email',
			size: 220
		},
		{
			accessorKey: 'location',
			cell: ({ row }) => {
				const locationSnippet = createRawSnippet<[{ flag: string; location: string }]>((args) => {
					const { flag, location } = args();
					return {
						render: () => `
							<div>
								<span class="text-lg leading-none">${flag}</span>
								${location}
							</div>`
					};
				});
				return renderSnippet(locationSnippet, {
					flag: row.original.flag,
					location: row.getValue('location') as string
				});
			},
			header: 'Location',
			size: 180
		},
		{
			accessorKey: 'status',
			cell: ({ row }) =>
				renderComponent(Badge, {
					children: createRawSnippet(() => {
						const status = row.getValue('status') as string;
						return {
							render: () => status
						};
					}),
					class: cn(
						row.getValue('status') === 'Inactive' &&
							'bg-muted-foreground/60 text-primary-foreground'
					)
				}),
			filterFn: statusFilterFn,
			header: 'Status',
			size: 100
		},
		{
			accessorKey: 'performance',
			header: 'Performance'
		},
		{
			accessorKey: 'balance',
			cell: ({ row }) => {
				const amount = parseFloat(row.getValue('balance'));
				const formatted = new Intl.NumberFormat('en-US', {
					currency: 'USD',
					style: 'currency'
				}).format(amount);
				return formatted;
			},
			header: 'Balance',
			size: 120
		},
		{
			cell: ({ row }) => renderSnippet(RowActions, { row }),
			enableHiding: false,
			header: () =>
				renderSnippet(
					createRawSnippet(() => {
						return {
							render: () => `<span class="sr-only">Actions</span>`
						};
					}),
					{}
				),
			id: 'actions',
			size: 60
		}
	];

	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});
	let rowSelection = $state<RowSelectionState>({});
	let sorting = $state<SortingState>([
		{
			desc: false,
			id: 'name'
		}
	]);
	let data = $state<User[]>([]);

	$effect(() => {
		fetch('https://res.cloudinary.com/dlzlfasou/raw/upload/users-01_fertyx.json')
			.then((res) => res.json())
			.then((response) => {
				data = response;
			})
			.catch((err) => {
				console.error(err);
			});
	});

	function handleDeleteRows() {
		const selectedRows = table.getSelectedRowModel().rows;
		data = data.filter((item) => !selectedRows.some((row) => row.original.id === item.id));
		table.resetRowSelection();
	}

	const table = createSvelteTable<User>({
		columns,
		get data() {
			return data;
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
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
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
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

	const uniqueStatusValues = $derived.by(() => {
		const statusColumn = table.getColumn('status');
		if (!statusColumn) return [];
		return Array.from(statusColumn.getFacetedUniqueValues().keys()).sort();
	});

	const statusCounts = $derived.by(() => {
		const statusColumn = table.getColumn('status');
		if (!statusColumn) return new Map();
		return statusColumn.getFacetedUniqueValues();
	});

	const selectedStatuses = $derived.by(() => {
		const filterValue = table.getColumn('status')?.getFilterValue() as string[];
		return filterValue ?? [];
	});

	function handleStatusChange(checked: boolean, value: string) {
		const filterValue = table.getColumn('status')?.getFilterValue() as string[];
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
</script>

<div class="space-y-4">
	<!-- Filters -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<!-- Filter by name or email -->
			<div class="relative">
				<Input
					class={cn(
						'peer min-w-60 ps-9',
						Boolean(table.getColumn('name')?.getFilterValue()) && 'pe-9'
					)}
					value={(table.getColumn('name')?.getFilterValue() ?? '') as string}
					oninput={(e) => table.getColumn('name')?.setFilterValue(e.currentTarget.value)}
					placeholder="Filter by name or email..."
					type="text"
					aria-label="Filter by name or email"
				/>
				<div
					class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"
				>
					<ListFilter size={16} aria-hidden="true" />
				</div>
				{#if Boolean(table.getColumn('name')?.getFilterValue())}
					<button
						class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-hidden transition-[color,box-shadow] focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Clear filter"
						onclick={() => {
							table.getColumn('name')?.setFilterValue('');
						}}
					>
						<CircleX size={16} aria-hidden="true" />
					</button>
				{/if}
			</div>
			<!-- Filter by status -->
			<Popover>
				<PopoverTrigger>
					{#snippet child({ props })}
						<Button variant="outline" {...props}>
							<Filter class="-ms-1 opacity-60" size={16} aria-hidden="true" />
							Status
							{#if selectedStatuses.length > 0}
								<span
									class="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
								>
									{selectedStatuses.length}
								</span>
							{/if}
						</Button>
					{/snippet}
				</PopoverTrigger>
				<PopoverContent class="w-auto min-w-36 p-3" align="start">
					<div class="space-y-3">
						<div class="text-muted-foreground text-xs font-medium">Filters</div>
						<div class="space-y-3">
							{#each uniqueStatusValues as value (value)}
								<div class="flex items-center gap-2">
									<Checkbox
										checked={selectedStatuses.includes(value)}
										onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
									/>
									<Label class="flex grow justify-between gap-2 font-normal">
										{value}
										<span class="text-muted-foreground ms-2 text-xs">
											{statusCounts.get(value)}
										</span>
									</Label>
								</div>
							{/each}
						</div>
					</div>
				</PopoverContent>
			</Popover>
			<!-- Toggle columns visibility -->
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<Button variant="outline" {...props}>
							<Columns3 class="-ms-1 opacity-60" size={16} aria-hidden="true" />
							View
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
					{#each table
						.getAllColumns()
						.filter((column) => column.getCanHide()) as column (column.id)}
						<DropdownMenuCheckboxItem
							class="capitalize"
							checked={column.getIsVisible()}
							closeOnSelect={false}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{column.id}
						</DropdownMenuCheckboxItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
		<div class="flex items-center gap-3">
			<!-- Delete button -->
			{#if table.getSelectedRowModel().rows.length > 0}
				<AlertDialogRoot>
					<AlertDialogTrigger>
						{#snippet child({ props })}
							<Button class="ml-auto" variant="outline" {...props}>
								<Trash class="-ms-1 opacity-60" size={16} aria-hidden="true" />
								Delete
								<span
									class="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
								>
									{table.getSelectedRowModel().rows.length}
								</span>
							</Button>
						{/snippet}
					</AlertDialogTrigger>
					<AlertDialogContent>
						<div class="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-full border"
								aria-hidden="true"
							>
								<CircleAlert class="opacity-80" size={16} />
							</div>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete
									{table.getSelectedRowModel().rows.length} selected
									{table.getSelectedRowModel().rows.length === 1 ? 'row' : 'rows'}.
								</AlertDialogDescription>
							</AlertDialogHeader>
						</div>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onclick={handleDeleteRows}>Delete</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogRoot>
			{/if}
			<!-- Add user button -->
			<Button class="ml-auto" variant="outline">
				<Plus class="-ms-1 opacity-60" size={16} aria-hidden="true" />
				Add user
			</Button>
		</div>
	</div>

	<!-- Table -->
	<div class="bg-background overflow-hidden rounded-md border">
		<Table class="table-fixed">
			<TableHeader>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<TableRow class="hover:bg-transparent">
						{#each headerGroup.headers as header (header.id)}
							<TableHead style="width: {header.getSize()}px" class="h-11">
								{#if !header.isPlaceholder && header.column.getCanSort()}
									<div
										class={cn(
											header.column.getCanSort() &&
												'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
										)}
										onclick={header.column.getToggleSortingHandler()}
										onkeydown={(e) => {
											if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
												e.preventDefault();
												header.column.getToggleSortingHandler()?.(e);
											}
										}}
										tabindex={header.column.getCanSort() ? 0 : undefined}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
										{#if header.column.getIsSorted() === 'asc'}
											<ChevronUp class="shrink-0 opacity-60" size={16} aria-hidden="true" />
										{:else if header.column.getIsSorted() === 'desc'}
											<ChevronDown class="shrink-0 opacity-60" size={16} aria-hidden="true" />
										{/if}
									</div>
								{:else if !header.isPlaceholder && !header.column.getCanSort()}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</TableHead>
						{/each}
					</TableRow>
				{/each}
			</TableHeader>
			<TableBody>
				{#if table.getRowModel().rows?.length}
					{#each table.getRowModel().rows as row (row.id)}
						<TableRow data-state={row.getIsSelected() && 'selected'}>
							{#each row.getVisibleCells() as cell (cell.id)}
								<TableCell class="last:py-0">
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</TableCell>
							{/each}
						</TableRow>
					{:else}
						<TableRow>
							<TableCell colspan={columns.length} class="h-24 text-center">No results.</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between gap-8">
		<!-- Results per page -->
		<div class="flex items-center gap-3">
			<Label class="max-sm:sr-only">Rows per page</Label>
			<Select
				type="single"
				value={table.getState().pagination.pageSize.toString()}
				onValueChange={(value) => {
					table.setPageSize(Number(value));
				}}
			>
				<SelectTrigger class="w-fit whitespace-nowrap">
					{table.getState().pagination.pageSize.toString() ?? 'Select number of results'}
				</SelectTrigger>
				<SelectContent
					class="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
				>
					{#each [5, 10, 25, 50] as pageSize (pageSize)}
						<SelectItem value={pageSize.toString()}>
							{pageSize}
						</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>
		<!-- Page number information -->
		<div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
			<p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
				<span class="text-foreground">
					{table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
						1}-{Math.min(
						Math.max(
							table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
								table.getState().pagination.pageSize,
							0
						),
						table.getRowCount()
					)}
				</span>
				of
				<span class="text-foreground">
					{table.getRowCount().toString()}
				</span>
			</p>
		</div>

		<!-- Pagination buttons -->
		<div>
			<Pagination>
				<PaginationContent>
					<!-- First page button -->
					<PaginationItem>
						<Button
							size="icon"
							variant="outline"
							class="disabled:pointer-events-none disabled:opacity-50"
							onclick={() => table.firstPage()}
							disabled={!table.getCanPreviousPage()}
							aria-label="Go to first page"
						>
							<ChevronFirst size={16} aria-hidden="true" />
						</Button>
					</PaginationItem>
					<!-- Previous page button -->
					<PaginationItem>
						<Button
							size="icon"
							variant="outline"
							class="disabled:pointer-events-none disabled:opacity-50"
							onclick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							aria-label="Go to previous page"
						>
							<ChevronLeft size={16} aria-hidden="true" />
						</Button>
					</PaginationItem>
					<!-- Next page button -->
					<PaginationItem>
						<Button
							size="icon"
							variant="outline"
							class="disabled:pointer-events-none disabled:opacity-50"
							onclick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							aria-label="Go to next page"
						>
							<ChevronRight size={16} aria-hidden="true" />
						</Button>
					</PaginationItem>
					<!-- Last page button -->
					<PaginationItem>
						<Button
							size="icon"
							variant="outline"
							class="disabled:pointer-events-none disabled:opacity-50"
							onclick={() => table.lastPage()}
							disabled={!table.getCanNextPage()}
							aria-label="Go to last page"
						>
							<ChevronLast size={16} aria-hidden="true" />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	</div>
	<p class="text-muted-foreground mt-4 text-center text-sm">
		Example of a more complex table made with
		<a
			class="hover:text-foreground underline"
			href="https://tanstack.com/table"
			target="_blank"
			rel="noopener noreferrer"
		>
			TanStack Table
		</a>
	</p>
</div>

{#snippet RowActions()}
	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<div class="flex justify-end">
					<Button size="icon" variant="ghost" class="shadow-none" aria-label="Edit item" {...props}>
						<Ellipsis size={16} aria-hidden="true" />
					</Button>
				</div>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<span>Edit</span>
					<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<span>Duplicate</span>
					<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<span>Archive</span>
					<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Move to project</DropdownMenuItem>
						<DropdownMenuItem>Move to folder</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Advanced options</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<span>Share</span>
					<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<span>Add to favorites</span>
					<DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem class="text-destructive focus:text-destructive">
				<span>Delete</span>
				<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
{/snippet}
