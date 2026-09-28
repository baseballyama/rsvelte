import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
import SearchIcon from '@lucide/svelte/icons/search';

import {
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getSortedRowModel
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

var root = $.from_html(`<div class="[&amp;>*:not(:first-child)]:mt-2"><!> <div class="flex"><!> <!></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="[&amp;>*:not(:first-child)]:mt-2"><!> <!></div>`);
var root_3 = $.from_html(`<div class="[&amp;>*:not(:first-child)]:mt-2"><!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"><!></div></div></div>`);
var root_4 = $.from_html(`<span class="size-4" aria-hidden="true"></span>`);
var root_5 = $.from_html(`<div><!> <!></div>`);
var root_6 = $.from_html(`<div class="space-y-6"><div class="flex flex-wrap gap-3"><div class="w-44"><!></div> <div class="w-36"><!></div> <div class="w-36"><!></div> <div class="w-36"><!></div> <div class="w-36"><!></div></div> <!> <p class="text-muted-foreground mt-4 text-center text-sm">Data table with filters made with <a class="hover:text-foreground underline" href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer">TanStack Table</a></p></div>`);

export default function Table_13($$anchor, $$props) {
	$.push($$props, true);

	const // For server-side rendering, use render
	// For client-side rendering, use mount
	// generate min/max values for range filter
	// client-side faceting
	// generate unique values for select filter/autocomplete
	//client-side filtering
	// Get all unique values from the column
	// If the values are arrays, flatten them and get unique items
	// Get unique values and sort them
	// Enhanced keyboard handling for sorting
	Filter = ($$anchor, $$arg0) => {
		let column = () => ($$arg0?.()).column;
		const columnHeader = $.derived(() => typeof column().columnDef.header === 'string' ? column().columnDef.header : '');
		const columnFilterValue = $.derived(() => column().getFilterValue());
		const filterVariant = $.derived(() => column().columnDef.meta?.filterVariant ?? '');
		const sortedUniqueValues = $.derived(() => getSortedUniqueValues(column(), $.get(filterVariant)));
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var node_1 = $.child(div);

				Label(node_1, {
					get for() {
						return `${column().id ?? ''}-range-1`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(columnHeader)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_1 = $.sibling(node_1, 2);
				var node_2 = $.child(div_1);

				{
					let $0 = $.derived(() => $.get(columnFilterValue)?.[0] ?? '');

					Input(node_2, {
						get id() {
							return `${column().id ?? ''}-range-1`;
						},
						class: 'flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
						get value() {
							return $.get($0);
						},

						onchange: (e) => column().setFilterValue((old) => [
							e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
							old?.[1]
						]),
						placeholder: 'Min',
						type: 'number',
						get 'aria-label'() {
							return `${$.get(columnHeader) ?? ''} min`;
						}
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => $.get(columnFilterValue)?.[1] ?? '');

					Input(node_3, {
						get id() {
							return `${column().id ?? ''}-range-2`;
						},
						class: '-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
						get value() {
							return $.get($0);
						},

						onchange: (e) => column().setFilterValue((old) => [
							old?.[0],
							e.currentTarget.value ? Number(e.currentTarget.value) : undefined
						]),
						placeholder: 'Max',
						type: 'number',
						get 'aria-label'() {
							return `${$.get(columnHeader) ?? ''} max`;
						}
					});
				}

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			};

			var consequent_1 = ($$anchor) => {
				var div_2 = root_2();
				var node_4 = $.child(div_2);

				Label(node_4, {
					get for() {
						return `${column().id ?? ''}-select`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(columnHeader)));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				{
					let $0 = $.derived(() => $.get(columnFilterValue)?.toString() ?? 'all');

					Select(node_5, {
						type: 'single',
						get value() {
							return $.get($0);
						},

						onValueChange: (value) => {
							column().setFilterValue(value === 'all' ? undefined : value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_6 = $.first_child(fragment_3);

							SelectTrigger(node_6, {
								get id() {
									return `${column().id ?? ''}-select`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									$.template_effect(($0) => $.set_text(text_2, $0), [() => $.get(columnFilterValue)?.toString() ?? 'All']);
									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							SelectContent(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_8 = $.first_child(fragment_5);

									SelectItem(node_8, {
										value: 'all',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('All');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									$.each(node_9, 16, () => $.get(sortedUniqueValues), (value) => value, ($$anchor, value) => {
										{
											let $0 = $.derived(() => String(value));

											SelectItem($$anchor, {
												get value() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text();

													$.template_effect(($0) => $.set_text(text_4, $0), [() => String(value)]);
													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										}
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_2);
				$.append($$anchor, div_2);
			};

			var alternate = ($$anchor) => {
				var div_3 = root_3();
				var node_10 = $.child(div_3);

				Label(node_10, {
					get for() {
						return `${column().id ?? ''}-input`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(columnHeader)));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_10, 2);
				var node_11 = $.child(div_4);

				{
					let $0 = $.derived(() => $.get(columnFilterValue) ?? '');
					let $1 = $.derived(() => `Search ${$.get(columnHeader).toLowerCase()}`);

					Input(node_11, {
						get id() {
							return `${column().id ?? ''}-input`;
						},
						class: 'peer ps-9',
						get value() {
							return $.get($0);
						},
						onchange: (e) => column().setFilterValue(e.currentTarget.value),
						get placeholder() {
							return $.get($1);
						},
						type: 'text'
					});
				}

				var div_5 = $.sibling(node_11, 2);
				var node_12 = $.child(div_5);

				SearchIcon(node_12, { size: 16 });
				$.reset(div_5);
				$.reset(div_4);
				$.reset(div_3);
				$.append($$anchor, div_3);
			};

			$.if(node, ($$render) => {
				if ($.get(filterVariant) === 'range') $$render(consequent); else if ($.get(filterVariant) === 'select') $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	const columns = [
		{
			cell: ({ row }) => renderComponent(Checkbox, {
				'aria-label': 'Select row',
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value)
			}),

			header: ({ table }) => renderComponent(Checkbox, {
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
				const nameSnippet = createRawSnippet((getKeyword) => {
					const keyword = getKeyword();

					return { render: () => `<div class="font-medium">${keyword}</div>` };
				});

				return renderSnippet(nameSnippet, row.getValue('keyword'));
			},
			header: 'Keyword'
		},

		{
			accessorKey: 'intents',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet((getIntents) => {
					const intents = getIntents();

					const styles = {
						Commercial: 'bg-amber-400/20 text-amber-500',
						Informational: 'bg-indigo-400/20 text-indigo-500',
						Navigational: 'bg-emerald-400/20 text-emerald-500',
						Transactional: 'bg-rose-400/20 text-rose-500'
					};

					return {
						render: () => {
							const inner = intents.map((intent) => {
								const className = cn('flex size-5 items-center justify-center rounded text-xs font-medium', styles[intent]);

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
			meta: { filterVariant: 'select' }
		},

		{
			accessorKey: 'volume',
			cell: ({ row }) => {
				const volume = parseInt(row.getValue('volume'));

				return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, notation: 'compact' }).format(volume);
			},
			header: 'Volume',
			meta: { filterVariant: 'range' }
		},

		{
			accessorKey: 'cpc',
			cell: ({ row }) => {
				const cpcSnippet = createRawSnippet((getCpc) => {
					const cpc = getCpc();

					return { render: () => `<div>${cpc}</div>` };
				});

				return renderSnippet(cpcSnippet, row.getValue('cpc'));
			},
			header: 'CPC',
			meta: { filterVariant: 'range' }
		},

		{
			accessorKey: 'traffic',
			cell: ({ row }) => {
				const traffic = parseInt(row.getValue('traffic'));

				return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, notation: 'compact' }).format(traffic);
			},
			header: 'Traffic',
			meta: { filterVariant: 'range' }
		},

		{
			accessorKey: 'link',
			cell: ({ row }) => {
				const linkSnippet = createRawSnippet((args) => {
					const { component, link } = args();

					// For server-side rendering, use render
					if (typeof window === 'undefined') {
						const { body } = render(component, { props: { 'aria-hidden': 'true', size: 16 } });

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

					const icon = mount(component, { props: { 'aria-hidden': 'true', size: 16 }, target });

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

				return renderSnippet(linkSnippet, { component: ExternalLinkIcon, link: row.getValue('link') });
			},
			enableSorting: false,
			header: 'Link'
		}
	];

	const items = [
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

	let columnFilters = $.state($.proxy([]));
	let rowSelection = $.state($.proxy({}));
	let sorting = $.state($.proxy([]));

	const table = createSvelteTable({
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
				$.set(columnFilters, updater($.get(columnFilters)), true);
			} else {
				$.set(columnFilters, updater, true);
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

			get rowSelection() {
				return $.get(rowSelection);
			},

			get sorting() {
				return $.get(sorting);
			}
		}
	});

	const getSortedUniqueValues = (column, filterVariant) => {
		if (filterVariant === 'range') return [];

		// Get all unique values from the column
		const values = Array.from(column.getFacetedUniqueValues().keys());

		// If the values are arrays, flatten them and get unique items
		const flattenedValues = values.reduce(
			(acc, curr) => {
				if (Array.isArray(curr)) {
					return [...acc, ...curr];
				}

				return [...acc, curr];
			},
			[]
		);

		// Get unique values and sort them
		return Array.from(new Set(flattenedValues)).sort();
	};

	var div_6 = root_6();
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var node_13 = $.child(div_8);

	{
		let $0 = $.derived(() => ({ column: table.getColumn('keyword') }));

		Filter(node_13, () => $.get($0));
	}

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_14 = $.child(div_9);

	{
		let $0 = $.derived(() => ({ column: table.getColumn('intents') }));

		Filter(node_14, () => $.get($0));
	}

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_15 = $.child(div_10);

	{
		let $0 = $.derived(() => ({ column: table.getColumn('volume') }));

		Filter(node_15, () => $.get($0));
	}

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_16 = $.child(div_11);

	{
		let $0 = $.derived(() => ({ column: table.getColumn('cpc') }));

		Filter(node_16, () => $.get($0));
	}

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_17 = $.child(div_12);

	{
		let $0 = $.derived(() => ({ column: table.getColumn('traffic') }));

		Filter(node_17, () => $.get($0));
	}

	$.reset(div_12);
	$.reset(div_7);

	var node_18 = $.sibling(div_7, 2);

	Table(node_18, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_1();
			var node_19 = $.first_child(fragment_9);

			TableHeader(node_19, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = $.comment();
					var node_20 = $.first_child(fragment_10);

					$.each(node_20, 17, () => table.getHeaderGroups(), (headerGroup) => headerGroup.id, ($$anchor, headerGroup) => {
						TableRow($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = $.comment();
								var node_21 = $.first_child(fragment_12);

								$.each(node_21, 17, () => $.get(headerGroup).headers, (header) => header.id, ($$anchor, header) => {
									{
										let $0 = $.derived(() => $.get(header).column.getIsSorted() === 'asc'
											? 'ascending'
											: $.get(header).column.getIsSorted() === 'desc' ? 'descending' : 'none');

										TableHead($$anchor, {
											class: 'relative h-10 border-t select-none',
											get 'aria-sort'() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_14 = $.comment();
												var node_22 = $.first_child(fragment_14);

												{
													var consequent_4 = ($$anchor) => {
														var div_13 = root_5();
														var event_handler = $.derived(() => $.get(header).column.getToggleSortingHandler());
														var node_23 = $.child(div_13);

														{
															let $0 = $.derived(() => $.get(header).getContext());

															FlexRender(node_23, {
																get content() {
																	return $.get(header).column.columnDef.header;
																},

																get context() {
																	return $.get($0);
																}
															});
														}

														var node_24 = $.sibling(node_23, 2);

														{
															var consequent_2 = ($$anchor) => {
																ChevronUpIcon($$anchor, {
																	class: 'shrink-0 opacity-60',
																	size: 16,
																	'aria-hidden': 'true'
																});
															};

															var d = $.derived(() => $.get(header).column.getIsSorted() === 'asc');

															var consequent_3 = ($$anchor) => {
																ChevronDownIcon($$anchor, {
																	class: 'shrink-0 opacity-60',
																	size: 16,
																	'aria-hidden': 'true'
																});
															};

															var d_1 = $.derived(() => $.get(header).column.getIsSorted() === 'desc');

															var alternate_1 = ($$anchor) => {
																var span = root_4();

																$.append($$anchor, span);
															};

															$.if(node_24, ($$render) => {
																if ($.get(d)) $$render(consequent_2); else if ($.get(d_1)) $$render(consequent_3, 1); else $$render(alternate_1, -1);
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
															// Enhanced keyboard handling for sorting
															if ($.get(header).column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
																e.preventDefault();
																$.get(header).column.getToggleSortingHandler()?.(e);
															}
														});

														$.append($$anchor, div_13);
													};

													var d_2 = $.derived(() => !$.get(header).isPlaceholder && $.get(header).column.getCanSort());

													var consequent_5 = ($$anchor) => {
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

													var d_3 = $.derived(() => !$.get(header).isPlaceholder && !$.get(header).column.getCanSort());

													$.if(node_22, ($$render) => {
														if ($.get(d_2)) $$render(consequent_4); else if ($.get(d_3)) $$render(consequent_5, 1);
													});
												}

												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_19, 2);

			TableBody(node_25, {
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = $.comment();
					var node_26 = $.first_child(fragment_18);

					$.each(
						node_26,
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
										var fragment_20 = $.comment();
										var node_27 = $.first_child(fragment_20);

										$.each(node_27, 17, () => $.get(row).getVisibleCells(), (cell) => cell.id, ($$anchor, cell) => {
											TableCell($$anchor, {
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

										$.append($$anchor, fragment_20);
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

											var text_6 = $.text('No results.');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}
					);

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_6);
	$.append($$anchor, div_6);
	$.pop();
}

$.delegate(['click', 'keydown']);