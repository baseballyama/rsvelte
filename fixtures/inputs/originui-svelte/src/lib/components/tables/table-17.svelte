<script lang="ts">
	import type { User } from '$data/api/data/users.handlers';

	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Info from '@lucide/svelte/icons/info';
	import {
		type ColumnDef,
		type ExpandedState,
		getCoreRowModel,
		getExpandedRowModel,
		type RowSelectionState
	} from '@tanstack/table-core';
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

	const columns: ColumnDef<User>[] = [
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
									target: target.parentElement as Element
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
			header: 'Status'
		},
		{
			accessorKey: 'balance',
			cell: ({ row }) => {
				return renderSnippet(
					createRawSnippet((getBalance) => {
						const balance = getBalance() as string;
						const formatted = new Intl.NumberFormat('en-US', {
							currency: 'USD',
							style: 'currency'
						}).format(parseFloat(balance));
						return {
							render: () => `<div class="text-right">${formatted}</div>`
						};
					}),
					row.getValue('balance')
				);
			},
			header: () => {
				const nameSnippet = createRawSnippet(() => {
					return {
						render: () => `<div class="text-right">Balance</div>`
					};
				});
				return renderSnippet(nameSnippet, {});
			}
		}
	];

	let rowSelection = $state<RowSelectionState>({});
	let expanded = $state<ExpandedState>({});
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
		columns,
		get data() {
			return data;
		},
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: (row) => Boolean(row.original.note),
		onExpandedChange: (updater) => {
			if (typeof updater === 'function') {
				expanded = updater(expanded);
			} else {
				expanded = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get expanded() {
				return expanded;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});
</script>

<div>
	<Table>
		<TableHeader>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<TableRow class="hover:bg-transparent">
					{#each headerGroup.headers as header (header.id)}
						<TableHead>
							{#if !header.isPlaceholder}
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
						<TableCell
							class="whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0"
						>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</TableCell>
					{/each}
				</TableRow>
				{#if row.getIsExpanded()}
					<TableRow>
						<TableCell colspan={row.getVisibleCells().length}>
							<div class="text-primary/80 flex items-start py-2">
								<span class="me-3 mt-0.5 flex w-7 shrink-0 justify-center" aria-hidden="true">
									<Info class="opacity-60" size={16} />
								</span>
								<p class="text-sm">{row.original.note}</p>
							</div>
						</TableCell>
					</TableRow>
				{/if}
			{:else}
				<TableRow>
					<TableCell colspan={columns.length} class="h-24 text-center">No results.</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
	<p class="text-muted-foreground mt-4 text-center text-sm">
		Expanding sub-row made with
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
