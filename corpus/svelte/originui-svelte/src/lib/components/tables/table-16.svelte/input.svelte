<script lang="ts">
	import type { User } from '$data/api/data/users.handlers';
	import type { Attachment } from 'svelte/attachments';

	import Button from '$lib/components/ui/button.svelte';

	import {
		closestCenter,
		DndContext,
		type DragEndEvent,
		KeyboardSensor,
		MouseSensor,
		TouchSensor,
		useSensor,
		useSensors
	} from '@dnd-kit-svelte/core';
	import { restrictToHorizontalAxis } from '@dnd-kit-svelte/modifiers';
	import {
		arrayMove,
		horizontalListSortingStrategy,
		SortableContext,
		useSortable
	} from '@dnd-kit-svelte/sortable';
	import { CSS, styleObjectToString } from '@dnd-kit-svelte/utilities';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import {
		type Cell,
		type ColumnDef,
		getCoreRowModel,
		getSortedRowModel,
		type Header,
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
	import { createRawSnippet } from 'svelte';
	import { on } from 'svelte/events';

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
			id: 'name',
			sortDescFirst: false,
			sortUndefined: 'last'
		},
		{
			accessorKey: 'email',
			header: 'Email',
			id: 'email'
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
			header: 'Location',
			id: 'location'
		},
		{
			accessorKey: 'status',
			header: 'Status',
			id: 'status'
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
			id: 'balance'
		}
	];

	let data = $state<User[]>([]);
	let sorting = $state<SortingState>([
		{
			desc: false,
			id: 'name'
		}
	]);
	let columnOrder = $state<string[]>(columns.map((column) => column.id ?? ''));

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
		onColumnOrderChange: (updater) => {
			if (typeof updater === 'function') {
				columnOrder = updater(columnOrder);
			} else {
				columnOrder = updater;
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
			get columnOrder() {
				return columnOrder;
			},
			get sorting() {
				return sorting;
			}
		}
	});

	// reorder columns after drag & drop
	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		const snapshottedActive = $state.snapshot(active);
		const snapshottedOver = $state.snapshot(over);

		if (snapshottedActive && snapshottedOver && snapshottedActive.id !== snapshottedOver.id) {
			table.setColumnOrder((columnOrder) => {
				const oldIndex = columnOrder.indexOf(snapshottedActive.id as string);
				const newIndex = columnOrder.indexOf(snapshottedOver.id as string);
				return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
			});
		}
	}

	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	);

	function createHeaderDragAttachment(header: Header<User, unknown>): {
		buttonAttachment: Attachment;
		thAttachment: Attachment;
	} {
		const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
			id: header.column.id
		});

		const style = $derived(
			styleObjectToString({
				opacity: isDragging.current ? 0.8 : 1,
				position: 'relative',
				transform: CSS.Transform.toString(transform.current),
				transition: transition.current,
				whiteSpace: 'nowrap',
				width: header.column.getSize() + 'px',
				zIndex: isDragging.current ? 1 : undefined
			})
		);
		const thAttachment: Attachment = (element) => {
			setNodeRef(element as HTMLElement);
			const cleanup = $effect.root(() => {
				$effect(() => {
					element.setAttribute('style', style);
				});
				return () => {
					element.removeAttribute('style');
				};
			});
			return () => {
				cleanup();
			};
		};

		const buttonAttachment: Attachment = (element) => {
			Object.entries(attributes.current).forEach(([key, value]) => {
				element.setAttribute(key, value);
			});
			const mouseDownCleanup = on(element, 'mousedown', listeners.current.onmousedown);
			const touchStartCleanup = on(element, 'touchstart', listeners.current.ontouchstart);
			const keyDownCleanup = on(element, 'keydown', listeners.current.onkeydown);

			return () => {
				mouseDownCleanup();
				touchStartCleanup();
				keyDownCleanup();
			};
		};

		return {
			buttonAttachment,
			thAttachment
		};
	}

	const dragAlongCellAttachment = (cell: Cell<User, unknown>): Attachment => {
		const { isDragging, isSorting, setNodeRef, transform, transition } = useSortable({
			id: cell.column.id
		});

		const style = $derived.by(() => {
			return styleObjectToString({
				opacity: isDragging.current ? 0.8 : 1,
				position: 'relative',
				transform: CSS.Transform.toString(transform.current),
				transition: isSorting.current ? transition.current : undefined,
				width: cell.column.getSize(),
				zIndex: isDragging ? 1 : 0
			});
		});

		return (element) => {
			setNodeRef(element as HTMLElement);
			const cleanup = $effect.root(() => {
				$effect(() => {
					element.setAttribute('style', style);
				});
				return () => {
					element.removeAttribute('style');
				};
			});
			return () => {
				cleanup();
			};
		};
	};

	const id = $props.id();
</script>

<DndContext
	{id}
	collisionDetection={closestCenter}
	modifiers={[restrictToHorizontalAxis]}
	onDragEnd={handleDragEnd}
	{sensors}
>
	<Table>
		<TableHeader>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<TableRow class="bg-muted/50">
					<SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
						{#each headerGroup.headers as header (header.id)}
							{@render DraggableTableHeader(header)}
						{/each}
					</SortableContext>
				</TableRow>
			{/each}
		</TableHeader>
		<TableBody>
			{#each table.getRowModel().rows as row (row.id)}
				<TableRow data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
							{@render DragAlongCell(cell)}
						</SortableContext>
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
		Draggable columns made with
		<a
			class="hover:text-foreground underline"
			href="https://tanstack.com/table"
			target="_blank"
			rel="noopener noreferrer"
		>
			TanStack Table
		</a>
		and
		<a href="https://dnd-kit-svelte.vercel.app/" target="_blank" rel="noopener noreferrer">
			dnd kit
		</a>
	</p>
</DndContext>

{#snippet DraggableTableHeader(header: Header<User, unknown>)}
	{@const { buttonAttachment, thAttachment } = createHeaderDragAttachment(header)}
	<TableHead
		class="before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:start-0 before:w-px first:before:bg-transparent"
		aria-sort={header.column.getIsSorted() === 'asc'
			? 'ascending'
			: header.column.getIsSorted() === 'desc'
				? 'descending'
				: 'none'}
		{@attach thAttachment}
	>
		<div class="flex items-center justify-start gap-0.5">
			<Button
				size="icon"
				variant="ghost"
				class="-ml-2 size-7 shadow-none"
				{@attach buttonAttachment}
				aria-label="Drag to reorder"
			>
				<GripVertical class="opacity-60" size={16} aria-hidden="true" />
			</Button>

			<span class="grow truncate">
				{#if !header.isPlaceholder}
					<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
				{/if}
			</span>
			<Button
				size="icon"
				variant="ghost"
				class="group -mr-1 size-7 shadow-none"
				onclick={header.column.getToggleSortingHandler()}
				onkeydown={(e: KeyboardEvent) => {
					// Enhanced keyboard handling for sorting
					if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
						e.preventDefault();
						header.column.getToggleSortingHandler()?.(e);
					}
				}}
			>
				{#if header.column.getIsSorted() === 'asc'}
					<ChevronUp class="shrink-0 opacity-60" size={16} aria-hidden="true" />
				{:else if header.column.getIsSorted() === 'desc'}
					<ChevronDown class="shrink-0 opacity-60" size={16} aria-hidden="true" />
				{:else if header.column.getIsSorted() === false}
					<ChevronUp
						class="shrink-0 opacity-0 group-hover:opacity-60"
						size={16}
						aria-hidden="true"
					/>
				{/if}
			</Button>
		</div>
	</TableHead>
{/snippet}

{#snippet DragAlongCell(cell: Cell<User, unknown>)}
	<TableCell class="truncate" {@attach dragAlongCellAttachment(cell)}>
		<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
	</TableCell>
{/snippet}
