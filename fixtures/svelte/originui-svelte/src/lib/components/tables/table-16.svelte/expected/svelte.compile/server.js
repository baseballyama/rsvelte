import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

import {
	closestCenter,
	DndContext,
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
import { getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
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

export default function Table_16($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // reorder columns after drag & drop
		//this is just a splice util
		id = $.props_id($$renderer);

		const columns = [
			{
				accessorKey: 'name',
				cell: ({ row }) => {
					const nameSnippet = createRawSnippet((getName) => {
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
			{ accessorKey: 'email', header: 'Email', id: 'email' },
			{
				accessorKey: 'location',
				cell: ({ row }) => {
					const locationSnippet = createRawSnippet((args) => {
						const { flag, location } = args();

						return {
							render: () => `
							<div class="truncate">
								<span class="text-lg leading-none">${flag}</span>
								${location}
							</div>`
						};
					});

					return renderSnippet(locationSnippet, { flag: row.original.flag, location: row.getValue('location') });
				},
				header: 'Location',
				id: 'location'
			},
			{ accessorKey: 'status', header: 'Status', id: 'status' },
			{
				accessorKey: 'balance',
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue('balance'));
					const formatted = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(amount);

					return formatted;
				},
				header: 'Balance',
				id: 'balance'
			}
		];

		let data = [];
		let sorting = [{ desc: false, id: 'name' }];
		let columnOrder = columns.map((column) => column.id ?? '');

		const table = createSvelteTable({
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
		function handleDragEnd(event) {
			const { active, over } = event;
			const snapshottedActive = active;
			const snapshottedOver = over;

			if (snapshottedActive && snapshottedOver && snapshottedActive.id !== snapshottedOver.id) {
				table.setColumnOrder((columnOrder) => {
					const oldIndex = columnOrder.indexOf(snapshottedActive.id);
					const newIndex = columnOrder.indexOf(snapshottedOver.id);

					return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
				});
			}
		}

		const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

		function createHeaderDragAttachment(header) {
			const {
				attributes,
				isDragging,
				listeners,
				setNodeRef,
				transform,
				transition
			} = useSortable({ id: header.column.id });

			const style = $.derived(() => styleObjectToString({
				opacity: isDragging.current ? 0.8 : 1,
				position: 'relative',
				transform: CSS.Transform.toString(transform.current),
				transition: transition.current,
				whiteSpace: 'nowrap',
				width: header.column.getSize() + 'px',
				zIndex: isDragging.current ? 1 : undefined
			}));

			const thAttachment = (element) => {
				setNodeRef(element);

				const cleanup = () => {};

				return () => {
					cleanup();
				};
			};

			const buttonAttachment = (element) => {
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

			return { buttonAttachment, thAttachment };
		}

		const dragAlongCellAttachment = (cell) => {
			const { isDragging, isSorting, setNodeRef, transform, transition } = useSortable({ id: cell.column.id });

			const style = $.derived(() => {
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
				setNodeRef(element);

				const cleanup = () => {};

				return () => {
					cleanup();
				};
			};
		};

		function DraggableTableHeader($$renderer, header) {
			const { buttonAttachment, thAttachment } = createHeaderDragAttachment(header);

			TableHead($$renderer, {
				class: 'before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:start-0 before:w-px first:before:bg-transparent',
				'aria-sort': header.column.getIsSorted() === 'asc'
					? 'ascending'
					: header.column.getIsSorted() === 'desc' ? 'descending' : 'none',

				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center justify-start gap-0.5">`);

					Button($$renderer, {
						size: 'icon',
						variant: 'ghost',
						class: '-ml-2 size-7 shadow-none',
						'aria-label': 'Drag to reorder',
						children: ($$renderer) => {
							GripVertical($$renderer, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span class="grow truncate">`);

					if (!header.isPlaceholder) {
						$$renderer.push('<!--[0-->');

						FlexRender($$renderer, {
							content: header.column.columnDef.header,
							context: header.getContext()
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> `);

					Button($$renderer, {
						size: 'icon',
						variant: 'ghost',
						class: 'group -mr-1 size-7 shadow-none',
						onclick: header.column.getToggleSortingHandler(),
						onkeydown: (e) => {
							// Enhanced keyboard handling for sorting
							if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								header.column.getToggleSortingHandler()?.(e);
							}
						},

						children: ($$renderer) => {
							if (header.column.getIsSorted() === 'asc') {
								$$renderer.push('<!--[0-->');

								ChevronUp($$renderer, {
									class: 'shrink-0 opacity-60',
									size: 16,
									'aria-hidden': 'true'
								});
							} else if (header.column.getIsSorted() === 'desc') {
								$$renderer.push('<!--[1-->');

								ChevronDown($$renderer, {
									class: 'shrink-0 opacity-60',
									size: 16,
									'aria-hidden': 'true'
								});
							} else if (header.column.getIsSorted() === false) {
								$$renderer.push('<!--[2-->');

								ChevronUp($$renderer, {
									class: 'shrink-0 opacity-0 group-hover:opacity-60',
									size: 16,
									'aria-hidden': 'true'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		}

		function DragAlongCell($$renderer, cell) {
			TableCell($$renderer, {
				class: 'truncate',
				children: ($$renderer) => {
					FlexRender($$renderer, {
						content: cell.column.columnDef.cell,
						context: cell.getContext()
					});
				},
				$$slots: { default: true }
			});
		}

		DndContext($$renderer, {
			id,
			collisionDetection: closestCenter,
			modifiers: [restrictToHorizontalAxis],
			onDragEnd: handleDragEnd,
			sensors,
			children: ($$renderer) => {
				Table($$renderer, {
					children: ($$renderer) => {
						TableHeader($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(table.getHeaderGroups());

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let headerGroup = each_array[$$index_1];

									TableRow($$renderer, {
										class: 'bg-muted/50',
										children: ($$renderer) => {
											SortableContext($$renderer, {
												items: columnOrder,
												strategy: horizontalListSortingStrategy,
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_1 = $.ensure_array_like(headerGroup.headers);

													for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
														let header = each_array_1[$$index];

														DraggableTableHeader($$renderer, header);
													}

													$$renderer.push(`<!--]-->`);
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

													SortableContext($$renderer, {
														items: columnOrder,
														strategy: horizontalListSortingStrategy,
														children: ($$renderer) => {
															DragAlongCell($$renderer, cell);
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

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center text-sm">Draggable columns made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a> and <a href="https://dnd-kit-svelte.vercel.app/" target="_blank" rel="noopener noreferrer">dnd kit</a></p>`);
			},
			$$slots: { default: true }
		});
	});
}