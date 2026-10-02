<script context="module" lang="ts">
	declare module '@tanstack/table-core' {
		//allows us to define custom properties for our columns
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface ColumnMeta<TData extends RowData, TValue> {
			filterVariant?: 'range' | 'select' | 'text';
		}
	}
</script>

<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import {
		type Column,
		type ColumnDef,
		type ColumnFiltersState,
		getCoreRowModel,
		getFacetedMinMaxValues,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getSortedRowModel,
		type RowData,
		type RowSelectionState,
		type SortingState
	} from '@tanstack/table-core';
	import {
		createSvelteTable,
		FlexRender,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table';
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
	import { createRawSnippet, mount, unmount } from 'svelte';
	import { render } from 'svelte/server';

	type Item = {
		cpc: number;
		id: string;
		intents: Array<'Commercial' | 'Informational' | 'Navigational' | 'Transactional'>;
		keyword: string;
		link: string;
		traffic: number;
		volume: number;
	};

	const columns: ColumnDef<Item>[] = [
		{
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					'aria-label': 'Select row',
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value)
				}),
			header: ({ table }) =>
				renderComponent(Checkbox, {
					'aria-label': 'Select all',
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
				}),
			id: 'select'
		},
		{
			accessorKey: 'keyword',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<[string]>((getKeyword) => {
					const keyword = getKeyword();
					return {
						render: () => `<div class="font-medium">${keyword}</div>`
					};
				});
				return renderSnippet(nameSnippet, row.getValue('keyword'));
			},
			header: 'Keyword'
		},
		{
			accessorKey: 'intents',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<[Array<string>]>((getIntents) => {
					const intents = getIntents();
					const styles = {
						Commercial: 'bg-amber-400/20 text-amber-500',
						Informational: 'bg-indigo-400/20 text-indigo-500',
						Navigational: 'bg-emerald-400/20 text-emerald-500',
						Transactional: 'bg-rose-400/20 text-rose-500'
					} as const;
					return {
						render: () => {
							const inner = intents.map((intent) => {
								const className = cn(
									'flex size-5 items-center justify-center rounded text-xs font-medium',
									styles[intent as keyof typeof styles]
								);
								return `<div class="${className}" title="${intent}">${intent.charAt(0)}</div>`;
							});
							return `<div class="flex gap-1">${inner.join('')}</div>`;
						}
					};
				});
				return renderSnippet(nameSnippet, row.getValue('intents'));
			},
			enableSorting: false,
			filterFn: (row, id, filterValue) => {
				const rowValue = row.getValue(id);
				return Array.isArray(rowValue) && rowValue.includes(filterValue);
			},
			header: 'Intents',
			meta: {
				filterVariant: 'select'
			}
		},
		{
			accessorKey: 'volume',
			cell: ({ row }) => {
				const volume = parseInt(row.getValue('volume'));
				return new Intl.NumberFormat('en-US', {
					maximumFractionDigits: 1,
					notation: 'compact'
				}).format(volume);
			},
			header: 'Volume',
			meta: {
				filterVariant: 'range'
			}
		},
		{
			accessorKey: 'cpc',
			cell: ({ row }) => {
				const cpcSnippet = createRawSnippet<[number]>((getCpc) => {
					const cpc = getCpc();
					return {
						render: () => `<div>${cpc}</div>`
					};
				});
				return renderSnippet(cpcSnippet, row.getValue('cpc'));
			},
			header: 'CPC',
			meta: {
				filterVariant: 'range'
			}
		},
		{
			accessorKey: 'traffic',
			cell: ({ row }) => {
				const traffic = parseInt(row.getValue('traffic'));
				return new Intl.NumberFormat('en-US', {
					maximumFractionDigits: 1,
					notation: 'compact'
				}).format(traffic);
			},
			header: 'Traffic',
			meta: {
				filterVariant: 'range'
			}
		},
		{
			accessorKey: 'link',
			cell: ({ row }) => {
				const linkSnippet = createRawSnippet<
					[{ component: typeof ExternalLinkIcon; link: string }]
				>((args) => {
					const { component, link } = args();

					// For server-side rendering, use render
					if (typeof window === 'undefined') {
						const { body } = render(component, {
							props: {
								'aria-hidden': 'true',
								size: 16
							}
						});

						return {
							render: () => `
								<a 
									href="${link}" 
									target="_blank" 
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 hover:underline"
									aria-label="Open ${link} in new tab"
								>
									${link}
									${body}
								</a>
							`
						};
					}

					// For client-side rendering, use mount
					const target = document.createElement('span');
					const icon = mount(component, {
						props: {
							'aria-hidden': 'true',
							size: 16
						},
						target
					});

					return {
						destroy: () => {
							unmount(icon);
						},
						render: () => `
							<a 
								href="${link}" 
								target="_blank" 
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 hover:underline"
								aria-label="Open ${link} in new tab"
							>
								${link}
								${target.outerHTML}
							</a>
						`
					};
				});
				return renderSnippet(linkSnippet, {
					component: ExternalLinkIcon,
					link: row.getValue('link') as string
				});
			},
			enableSorting: false,
			header: 'Link'
		}
	];

	const items: Item[] = [
		{
			cpc: 2.5,
			id: '1',
			intents: ['Informational', 'Navigational'],
			keyword: 'svelte components',
			link: 'https://originui-svelte.pages.dev/radios',
			traffic: 88,
			volume: 2507
		},
		{
			cpc: 4.75,
			id: '2',
			intents: ['Commercial', 'Transactional'],
			keyword: 'buy svelte templates',
			link: 'https://originui-svelte.pages.dev/switches',
			traffic: 65,
			volume: 1850
		},
		{
			cpc: 3.25,
			id: '3',
			intents: ['Informational', 'Commercial'],
			keyword: 'svelte ui library',
			link: 'https://originui-svelte.pages.dev/checkboxes',
			traffic: 112,
			volume: 3200
		},
		{
			cpc: 1.95,
			id: '4',
			intents: ['Transactional'],
			keyword: 'tailwind components download',
			link: 'https://originui-svelte.pages.dev/alerts',
			traffic: 45,
			volume: 890
		},
		{
			cpc: 5.5,
			id: '5',
			intents: ['Commercial', 'Transactional'],
			keyword: 'svelte dashboard template free',
			link: 'https://originui-svelte.pages.dev/inputs',
			traffic: 156,
			volume: 4100
		},
		{
			cpc: 1.25,
			id: '6',
			intents: ['Informational'],
			keyword: 'how to use svelte components',
			link: 'https://originui-svelte.pages.dev/tables',
			traffic: 42,
			volume: 1200
		},
		{
			cpc: 6.8,
			id: '7',
			intents: ['Commercial', 'Transactional'],
			keyword: 'svelte ui kit premium',
			link: 'https://originui-svelte.pages.dev/avatars',
			traffic: 28,
			volume: 760
		},
		{
			cpc: 1.8,
			id: '8',
			intents: ['Informational', 'Navigational'],
			keyword: 'svelte component documentation',
			link: 'https://originui-svelte.pages.dev/badges',
			traffic: 35,
			volume: 950
		}
	];

	let columnFilters = $state<ColumnFiltersState>([]);

	let rowSelection = $state<RowSelectionState>({});
	let sorting = $state<SortingState>([]);

	const table = createSvelteTable<Item>({
		columns,
		get data() {
			return items;
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
		getFacetedRowModel: getFacetedRowModel(), // client-side faceting
		getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
		getFilteredRowModel: getFilteredRowModel(), //client-side filtering
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
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
			get rowSelection() {
				return rowSelection;
			},
			get sorting() {
				return sorting;
			}
		}
	});

	const getSortedUniqueValues = (column: Column<Item>, filterVariant: string) => {
		if (filterVariant === 'range') return [];

		// Get all unique values from the column
		const values = Array.from(column.getFacetedUniqueValues().keys());

		// If the values are arrays, flatten them and get unique items
		const flattenedValues = values.reduce((acc: string[], curr) => {
			if (Array.isArray(curr)) {
				return [...acc, ...curr];
			}
			return [...acc, curr];
		}, []);

		// Get unique values and sort them
		return Array.from(new Set(flattenedValues)).sort();
	};
</script>

<div class="space-y-6">
	<!-- Filters  -->
	<div class="flex flex-wrap gap-3">
		<!-- Search input  -->
		<div class="w-44">
			{@render Filter({ column: table.getColumn('keyword')! })}
		</div>
		<!-- Intents select -->
		<div class="w-36">
			{@render Filter({ column: table.getColumn('intents')! })}
		</div>
		<!-- Volume inputs -->
		<div class="w-36">
			{@render Filter({ column: table.getColumn('volume')! })}
		</div>
		<!-- CPC inputs -->
		<div class="w-36">
			{@render Filter({ column: table.getColumn('cpc')! })}
		</div>
		<!-- Traffic inputs -->
		<div class="w-36">
			{@render Filter({ column: table.getColumn('traffic')! })}
		</div>
	</div>

	<Table>
		<TableHeader>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<TableRow>
					{#each headerGroup.headers as header (header.id)}
						<TableHead
							class="relative h-10 border-t select-none"
							aria-sort={header.column.getIsSorted() === 'asc'
								? 'ascending'
								: header.column.getIsSorted() === 'desc'
									? 'descending'
									: 'none'}
						>
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
									tabindex={header.column.getCanSort() ? 0 : undefined}
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
									{#if header.column.getIsSorted() === 'asc'}
										<ChevronUpIcon class="shrink-0 opacity-60" size={16} aria-hidden="true" />
									{:else if header.column.getIsSorted() === 'desc'}
										<ChevronDownIcon class="shrink-0 opacity-60" size={16} aria-hidden="true" />
									{:else}
										<span class="size-4" aria-hidden="true" />
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
	<p class="text-muted-foreground mt-4 text-center text-sm">
		Data table with filters made with
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

{#snippet Filter({ column }: { column: Column<Item> })}
	{@const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''}
	{@const columnFilterValue = column.getFilterValue()}
	{@const filterVariant = column.columnDef.meta?.filterVariant ?? ''}
	{@const sortedUniqueValues = getSortedUniqueValues(column, filterVariant)}

	{#if filterVariant === 'range'}
		<div class="[&>*:not(:first-child)]:mt-2">
			<Label for="{column.id}-range-1">{columnHeader}</Label>
			<div class="flex">
				<Input
					id="{column.id}-range-1"
					class="flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
					value={(columnFilterValue as [number, number])?.[0] ?? ''}
					onchange={(e) =>
						column.setFilterValue((old: [number, number]) => [
							e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
							old?.[1]
						])}
					placeholder="Min"
					type="number"
					aria-label="{columnHeader} min"
				/>
				<Input
					id="{column.id}-range-2"
					class="-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
					value={(columnFilterValue as [number, number])?.[1] ?? ''}
					onchange={(e) =>
						column.setFilterValue((old: [number, number]) => [
							old?.[0],
							e.currentTarget.value ? Number(e.currentTarget.value) : undefined
						])}
					placeholder="Max"
					type="number"
					aria-label="{columnHeader} max"
				/>
			</div>
		</div>
	{:else if filterVariant === 'select'}
		<div class="[&>*:not(:first-child)]:mt-2">
			<Label for="{column.id}-select">{columnHeader}</Label>
			<Select
				type="single"
				value={columnFilterValue?.toString() ?? 'all'}
				onValueChange={(value) => {
					column.setFilterValue(value === 'all' ? undefined : value);
				}}
			>
				<SelectTrigger id="{column.id}-select">
					{columnFilterValue?.toString() ?? 'All'}
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					{#each sortedUniqueValues as value (value)}
						<SelectItem value={String(value)}>{String(value)}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>
	{:else}
		<div class="[&>*:not(:first-child)]:mt-2">
			<Label for="{column.id}-input">{columnHeader}</Label>
			<div class="relative">
				<Input
					id="{column.id}-input"
					class="peer ps-9"
					value={(columnFilterValue ?? '') as string}
					onchange={(e) => column.setFilterValue(e.currentTarget.value)}
					placeholder={`Search ${columnHeader.toLowerCase()}`}
					type="text"
				/>
				<div
					class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"
				>
					<SearchIcon size={16} />
				</div>
			</div>
		</div>
	{/if}
{/snippet}
