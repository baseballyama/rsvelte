<script lang="ts">
	import type { User } from '$data/api/data/users.handlers';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import {
		type ColumnDef,
		type ColumnSizingState,
		getCoreRowModel,
		getSortedRowModel,
		type SortingState
	} from '@tanstack/table-core';
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

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: 'name',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<[string]>((getName) => {
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
		{
			accessorKey: 'email',
			header: 'Email'
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
			header: 'Location'
		},
		{
			accessorKey: 'status',
			header: 'Status'
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
			header: 'Balance'
		},
		{
			accessorKey: 'department',
			header: 'Department'
		},
		{
			accessorKey: 'role',
			header: 'Role'
		},
		{
			accessorKey: 'joinDate',
			header: 'Join Date'
		},
		{
			accessorKey: 'lastActive',
			header: 'Last Active'
		},
		{
			accessorKey: 'performance',
			header: 'Performance'
		}
	];

	let sorting = $state<SortingState>([
		{
			desc: false,
			id: 'name'
		}
	]);
	let columnSizing = $state<ColumnSizingState>({});
	let data = $state<User[]>([]);

	$effect(() => {
		fetchUsers()
			.then((response) => {
				data = response.slice(0, 5);
			})
			.catch((err) => {
				console.error(err);
			});
	});

	const table = createSvelteTable<User>({
		columnResizeMode: 'onChange',
		columns,
		get data() {
			return data;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
			get columnSizing() {
				return columnSizing;
			},
			get sorting() {
				return sorting;
			}
		}
	});
</script>

<div>
	<Table class="table-fixed" style="width: {table.getCenterTotalSize()}px">
		<TableHeader>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<TableRow class="bg-muted/50">
					{#each headerGroup.headers as header (header.id)}
						<TableHead
							class="relative h-10 border-t select-none [&:last-child>.cursor-col-resize]:opacity-0"
							aria-sort={header.column.getIsSorted() === 'asc'
								? 'ascending'
								: header.column.getIsSorted() === 'desc'
									? 'descending'
									: 'none'}
							colspan={header.colSpan}
							style="width: {header.getSize()}px"
						>
							{#if !header.isPlaceholder}
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
									tabindex={header.column.getCanSort() ? 0 : undefined}
								>
									<span class="truncate">
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									</span>
									{#if header.column.getIsSorted() === 'asc'}
										<ChevronUp class="shrink-0 opacity-60" size={16} aria-hidden="true" />
									{:else if header.column.getIsSorted() === 'desc'}
										<ChevronDown class="shrink-0 opacity-60" size={16} aria-hidden="true" />
									{/if}
								</div>
							{/if}
							{#if header.column.getCanResize()}
								<div
									class="user-select-none before:bg-border absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:translate-x-px"
									ondblclick={() => header.column.resetSize()}
									onmousedown={header.getResizeHandler()}
									ontouchstart={header.getResizeHandler()}
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
						<TableCell class="truncate">
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
	<p class="text-muted-foreground mt-4 text-center text-sm">
		Resizable and sortable columns made with
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
