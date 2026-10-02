import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center justify-start gap-0.5"><!> <span class="grow truncate"><!></span> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <p class="text-muted-foreground mt-4 text-center text-sm">Draggable columns made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a> and <a href="https://dnd-kit-svelte.vercel.app/" target="_blank" rel="noopener noreferrer">dnd kit</a></p>`, 1);

export default function Table_16($$anchor, $$props) {
	const // reorder columns after drag & drop
	//this is just a splice util
	id = $.props_id();

	$.push($$props, true);

	const DraggableTableHeader = ($$anchor, header = $.noop) => {
		const computed_const = $.derived(() => {
			return createHeaderDragAttachment(header());
		});

		{
			let $0 = $.derived(() => header().column.getIsSorted() === 'asc'
				? 'ascending'
				: header().column.getIsSorted() === 'desc' ? 'descending' : 'none');

			TableHead($$anchor, {
				class: 'before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:start-0 before:w-px first:before:bg-transparent',
				get 'aria-sort'() {
					return $.get($0);
				},
				[$.attachment()]: ($$node) => ($.get(computed_const).thAttachment || $.noop)($$node),
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Button(node, {
						size: 'icon',
						variant: 'ghost',
						class: '-ml-2 size-7 shadow-none',
						[$.attachment()]: ($$node) => ($.get(computed_const).buttonAttachment || $.noop)($$node),
						'aria-label': 'Drag to reorder',
						children: ($$anchor, $$slotProps) => {
							GripVertical($$anchor, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					var span = $.sibling(node, 2);
					var node_1 = $.child(span);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => header().getContext());

								FlexRender($$anchor, {
									get content() {
										return header().column.columnDef.header;
									},

									get context() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_1, ($$render) => {
							if (!header().isPlaceholder) $$render(consequent);
						});
					}

					$.reset(span);

					var node_2 = $.sibling(span, 2);

					{
						let $0 = $.derived(() => header().column.getToggleSortingHandler());

						Button(node_2, {
							size: 'icon',
							variant: 'ghost',
							class: 'group -mr-1 size-7 shadow-none',
							get onclick() {
								return $.get($0);
							},

							onkeydown: (e) => {
								// Enhanced keyboard handling for sorting
								if (header().column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
									e.preventDefault();
									header().column.getToggleSortingHandler()?.(e);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								{
									var consequent_1 = ($$anchor) => {
										ChevronUp($$anchor, {
											class: 'shrink-0 opacity-60',
											size: 16,
											'aria-hidden': 'true'
										});
									};

									var d = $.derived(() => header().column.getIsSorted() === 'asc');

									var consequent_2 = ($$anchor) => {
										ChevronDown($$anchor, {
											class: 'shrink-0 opacity-60',
											size: 16,
											'aria-hidden': 'true'
										});
									};

									var d_1 = $.derived(() => header().column.getIsSorted() === 'desc');

									var consequent_3 = ($$anchor) => {
										ChevronUp($$anchor, {
											class: 'shrink-0 opacity-0 group-hover:opacity-60',
											size: 16,
											'aria-hidden': 'true'
										});
									};

									var d_2 = $.derived(() => header().column.getIsSorted() === false);

									$.if(node_3, ($$render) => {
										if ($.get(d)) $$render(consequent_1); else if ($.get(d_1)) $$render(consequent_2, 1); else if ($.get(d_2)) $$render(consequent_3, 2);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		}
	};

	const DragAlongCell = ($$anchor, cell = $.noop) => {
		TableCell($$anchor, {
			class: 'truncate',
			[$.attachment()]: ($$node) => (dragAlongCellAttachment(cell()) || $.noop)($$node),
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => cell().getContext());

					FlexRender($$anchor, {
						get content() {
							return cell().column.columnDef.cell;
						},

						get context() {
							return $.get($0);
						}
					});
				}
			},
			$$slots: { default: true }
		});
	};

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

	let data = $.state($.proxy([]));
	let sorting = $.state($.proxy([{ desc: false, id: 'name' }]));
	let columnOrder = $.state($.proxy(columns.map((column) => column.id ?? '')));

	$.user_effect(() => {
		fetchUsers().then((response) => {
			$.set(data, response.slice(0, 5), true);
		}).catch((err) => {
			console.error(err);
		});
	});

	const table = createSvelteTable({
		columnResizeMode: 'onChange',
		columns,
		get data() {
			return $.get(data);
		},
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnOrderChange: (updater) => {
			if (typeof updater === 'function') {
				$.set(columnOrder, updater($.get(columnOrder)), true);
			} else {
				$.set(columnOrder, updater, true);
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
			get columnOrder() {
				return $.get(columnOrder);
			},

			get sorting() {
				return $.get(sorting);
			}
		}
	});

	// reorder columns after drag & drop
	function handleDragEnd(event) {
		const { active, over } = event;
		const snapshottedActive = $.snapshot(active);
		const snapshottedOver = $.snapshot(over);

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

			const cleanup = $.effect_root(() => {
				$.user_effect(() => {
					element.setAttribute('style', $.get(style));
				});

				return () => {
					element.removeAttribute('style');
				};
			});

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

			const cleanup = $.effect_root(() => {
				$.user_effect(() => {
					element.setAttribute('style', $.get(style));
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

	{
		let $0 = $.derived(() => [restrictToHorizontalAxis]);

		DndContext($$anchor, {
			get id() {
				return id;
			},

			get collisionDetection() {
				return closestCenter;
			},

			get modifiers() {
				return $.get($0);
			},
			onDragEnd: handleDragEnd,
			get sensors() {
				return sensors;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_2();
				var node_4 = $.first_child(fragment_10);

				Table(node_4, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_1();
						var node_5 = $.first_child(fragment_11);

						TableHeader(node_5, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = $.comment();
								var node_6 = $.first_child(fragment_12);

								$.each(node_6, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
									TableRow($$anchor, {
										class: 'bg-muted/50',
										children: ($$anchor, $$slotProps) => {
											SortableContext($$anchor, {
												get items() {
													return $.get(columnOrder);
												},

												get strategy() {
													return horizontalListSortingStrategy;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_15 = $.comment();
													var node_7 = $.first_child(fragment_15);

													$.each(node_7, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
														DraggableTableHeader($$anchor, () => $.get(header));
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_5, 2);

						TableBody(node_8, {
							children: ($$anchor, $$slotProps) => {
								var fragment_17 = $.comment();
								var node_9 = $.first_child(fragment_17);

								$.each(
									node_9,
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
													var fragment_19 = $.comment();
													var node_10 = $.first_child(fragment_19);

													$.each(node_10, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
														SortableContext($$anchor, {
															get items() {
																return $.get(columnOrder);
															},

															get strategy() {
																return horizontalListSortingStrategy;
															},

															children: ($$anchor, $$slotProps) => {
																DragAlongCell($$anchor, () => $.get(cell));
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_19);
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

														var text = $.text('No results.');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									}
								);

								$.append($$anchor, fragment_17);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});

				$.next(2);
				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}