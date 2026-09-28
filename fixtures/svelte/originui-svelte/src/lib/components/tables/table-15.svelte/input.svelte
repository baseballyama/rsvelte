<script lang="ts">
	import type { User } from '$data/api/data/users.handlers';
	import type { HTMLAttributes } from 'svelte/elements';

	import Button from '$lib/components/ui/button.svelte';

	import ArrowLeftToLineIcon from '@lucide/svelte/icons/arrow-left-to-line';
	import ArrowRightToLineIcon from '@lucide/svelte/icons/arrow-right-to-line';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import PinOffIcon from '@lucide/svelte/icons/pin-off';
	import {
		type Column,
		type ColumnDef,
		type ColumnPinningState,
		type ColumnSizingState,
		getCoreRowModel,
		getSortedRowModel,
		type SortingState
	} from '@tanstack/table-core';
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

	let sorting = $state<SortingState>([
		{
			desc: false,
			id: 'name'
		}
	]);

	// Helper function to compute pinning styles for columns
	function getPinningStyles(column: Column<User>): HTMLAttributes<HTMLTableCellElement>['style'] {
		const isPinned = column.getIsPinned();
		const properties = {
			left: isPinned === 'left' ? `-${column.getStart('left')}px` : undefined,
			position: isPinned ? 'sticky' : 'relative',
			right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
			width: column.getSize() + 'px',
			'z-index': isPinned ? 1 : 0
		};

		return Object.entries(properties)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => `${key}: ${value}`)
			.join(';');
	}

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
			header: 'Name'
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
							<div class="truncate">
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

	let columnSizing = $state<ColumnSizingState>({});
	let columnPinning = $state<ColumnPinningState>({});
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
		enableSortingRemoval: false,

		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnPinningChange: (updater) => {
			if (typeof updater === 'function') {
				columnPinning = updater(columnPinning);
			} else {
				columnPinning = updater;
			}
		},
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
			get columnPinning() {
				return columnPinning;
			},
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
	<Table
		class="[&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
		style="width: {table.getCenterTotalSize()}px"
	>
		<TableHeader>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<TableRow class="bg-muted/50">
					{#each headerGroup.headers as header (header.id)}
						{@const isPinned = header.column.getIsPinned()}
						{@const isLastLeftPinned = isPinned === 'left' && header.column.getIsLastColumn('left')}
						{@const isFirstRightPinned =
							isPinned === 'right' && header.column.getIsFirstColumn('right')}

						<TableHead
							class="data-pinned:bg-muted/90 [&[data-pinned][data-last-col]]:border-border relative h-10 truncate border-t data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l"
							aria-sort={header.column.getIsSorted() === 'asc'
								? 'ascending'
								: header.column.getIsSorted() === 'desc'
									? 'descending'
									: 'none'}
							colspan={header.colSpan}
							data-pinned={isPinned || undefined}
							data-last-col={isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined}
							style={getPinningStyles(header.column)}
						>
							<div class="flex items-center justify-between gap-2">
								{#if !header.isPlaceholder}
									<span class="truncate">
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									</span>
								{/if}
								<!-- Pin/Unpin column controls with enhanced accessibility -->
								{#if !header.isPlaceholder && header.column.getCanPin() && header.column.getIsPinned()}
									<Button
										size="icon"
										variant="ghost"
										class="-mr-1 size-7 shadow-none"
										onclick={() => header.column.pin(false)}
										aria-label="Unpin {header.column.columnDef.header} column"
										title="Unpin {header.column.columnDef.header} column"
									>
										<PinOffIcon class="opacity-60" size={16} aria-hidden="true" />
									</Button>
								{:else}
									<DropdownMenu>
										<DropdownMenuTrigger>
											{#snippet child({ props })}
												<Button
													size="icon"
													variant="ghost"
													class="-mr-1 size-7 shadow-none"
													aria-label="Pin options for {header.column.columnDef.header} column"
													title="Pin options for {header.column.columnDef.header} column"
													{...props}
												>
													<EllipsisIcon class="opacity-60" size={16} aria-hidden="true" />
												</Button>
											{/snippet}
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onclick={() => header.column.pin('left')}>
												<ArrowLeftToLineIcon size={16} class="opacity-60" aria-hidden="true" />
												Stick to left
											</DropdownMenuItem>
											<DropdownMenuItem onclick={() => header.column.pin('right')}>
												<ArrowRightToLineIcon size={16} class="opacity-60" aria-hidden="true" />
												Stick to right
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								{/if}
								{#if header.column.getCanResize()}
									<div
										class="user-select-none before:bg-border absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:-translate-x-px"
										ondblclick={() => header.column.resetSize()}
										onmousedown={header.getResizeHandler()}
										ontouchstart={header.getResizeHandler()}
									/>
								{/if}
							</div>
						</TableHead>
					{/each}
				</TableRow>
			{/each}
		</TableHeader>
		<TableBody>
			{#each table.getRowModel().rows as row (row.id)}
				<TableRow data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						{@const isPinned = cell.column.getIsPinned()}
						{@const isLastLeftPinned = isPinned === 'left' && cell.column.getIsLastColumn('left')}
						{@const isFirstRightPinned =
							isPinned === 'right' && cell.column.getIsFirstColumn('right')}

						<TableCell
							class="data-pinned:bg-background/90 [&[data-pinned][data-last-col]]:border-border truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l"
							style={getPinningStyles(cell.column)}
							data-pinned={isPinned || undefined}
							data-last-col={isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined}
						>
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
		Pinnable columns made with
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
