<script lang="ts">
	import type { User } from '$data/api/data/users.handlers';

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
	import {
		type ColumnDef,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type RowSelectionState,
		type SortingState
	} from '@tanstack/table-core';
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

	const columns: ColumnDef<User>[] = [
		{
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					'aria-label': 'Select row',
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value)
				}),
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
			header: 'Name',
			size: 180
		},
		{
			accessorKey: 'email',
			header: 'Email',
			size: 200
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
			header: 'Status',
			size: 120
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
		}
	];

	const id = $props.id();

	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 5
	});
	let sorting = $state<SortingState>([
		{
			desc: false,
			id: 'name'
		}
	]);
	let rowSelection = $state<RowSelectionState>({});
	let data = $state<User[]>([]);

	$effect(() => {
		fetchUsers()
			.then((response) => {
				data = [...response];
			})
			.catch((err) => {
				console.error(err);
			});
	});

	const table = createSvelteTable<User>({
		columns,
		get data() {
			return data;
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
</script>

<div class="space-y-4">
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
											// Enhanced keyboard handling for sorting
											if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
												e.preventDefault();
												header.column.getToggleSortingHandler()?.(e);
											}
										}}
										tabIndex={header.column.getCanSort() ? 0 : undefined}
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
				{#each table.getRowModel().rows as row (row.id)}
					<TableRow data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<TableCell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</TableCell>
						{/each}
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={columns.length} class="h-24 text-center">No results.</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between gap-8">
		<!-- Results per page -->
		<div class="flex items-center gap-3">
			<Label for={id} class="max-sm:sr-only">Rows per page</Label>
			<Select
				type="single"
				value={table.getState().pagination.pageSize.toString()}
				onValueChange={(value) => {
					table.setPageSize(Number(value));
				}}
			>
				<SelectTrigger placeholder="Select number of results" {id} class="w-fit whitespace-nowrap">
					{table.getState().pagination.pageSize.toString()}
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
					{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
					-
					{Math.min(
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
		Paginated table made with
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
