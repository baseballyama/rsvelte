import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiDotsVertical } from '@mdi/js';

import {
	Button,
	Menu,
	MenuItem,
	Paginate,
	Pagination,
	Table,
	Toggle,
	TweenedValue
} from 'svelte-ux';

import { tableOrderStore, tableCell } from '@layerstack/svelte-table';
import { randomInteger } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<td><!></td>`);
var root_2 = $.from_html(`<tr class="tabular-nums"></tr>`);
var root_3 = $.from_html(`<tbody slot="data"></tbody>`);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Pagination</h2> <!> <h2>Order</h2> <!> <h2>Order + Pagination</h2> <!> <h2>Data background</h2> <!> <h2>Formatting with HTML</h2> <!> <h2>Customize markup</h2> <!> <h2>Row actions</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $order = () => $.store_get(order, '$order', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const order = tableOrderStore({ initialBy: 'calories', initialDirection: 'desc' });

	const data = [
		{
			id: 1,
			name: 'Cupcake',
			calories: 305,
			fat: 3.7,
			carbs: 67,
			protein: 4.3
		},

		{
			id: 2,
			name: 'Donut',
			calories: 452,
			fat: 25.0,
			carbs: 51,
			protein: 4.9
		},

		{
			id: 3,
			name: 'Eclair',
			calories: 262,
			fat: 16.0,
			carbs: 24,
			protein: 6.0
		},

		{
			id: 4,
			name: 'Frozen yogurt',
			calories: 159,
			fat: 6.0,
			carbs: 24,
			protein: 4.0
		},

		{
			id: 5,
			name: 'Gingerbread',
			calories: 356,
			fat: 16.0,
			carbs: 49,
			protein: 3.9
		},

		{
			id: 6,
			name: 'Honeycomb',
			calories: 408,
			fat: 3.2,
			carbs: 87,
			protein: 6.5
		},

		{
			id: 7,
			name: 'Ice cream sandwich',
			calories: 237,
			fat: 9.0,
			carbs: 37,
			protein: 4.3
		},

		{
			id: 8,
			name: 'Jelly Bean',
			calories: 375,
			fat: 0.0,
			carbs: 94,
			protein: 0.0
		},

		{
			id: 9,
			name: 'KitKat',
			calories: 518,
			fat: 26.0,
			carbs: 65,
			protein: 7.0
		},

		{
			id: 10,
			name: 'Lollipop',
			calories: 392,
			fat: 0.2,
			carbs: 98,
			protein: 0.0
		},

		{
			id: 11,
			name: 'Marshmallow',
			calories: 318,
			fat: 0.0,
			carbs: 81,
			protein: 2.0
		},

		{
			id: 12,
			name: 'Nougat',
			calories: 360,
			fat: 19.0,
			carbs: 9,
			protein: 37.0
		},

		{
			id: 13,
			name: 'Oreo',
			calories: 437,
			fat: 18.0,
			carbs: 63,
			protein: 4.0
		}
	];

	function randomDataGen() {
		return data.map((d) => {
			return {
				...d,
				calories: randomInteger(300, 900),
				fat: randomInteger(2, 30),
				carbs: randomInteger(5, 100),
				protein: randomInteger(0, 50)
			};
		});
	}

	let randomData = randomDataGen();

	// Workaround to make Typescript happy
	function columnFormatAsNumberFormat(format) {
		return format;
	}

	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Table($$anchor, {
				get data() {
					return data;
				},

				columns: [
					{ name: 'name', align: 'left' },
					{ name: 'calories', align: 'right', format: 'integer' },
					{ name: 'fat', align: 'right', format: 'integer' },
					{ name: 'carbs', align: 'right', format: 'integer' },
					{ name: 'protein', align: 'right', format: 'integer' }
				]
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Paginate($$anchor, {
				get data() {
					return data;
				},
				perPage: 5,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const pageData = $.derived(() => $$slotProps.pageData);
						const pagination = $.derived(() => $$slotProps.pagination);
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						Table(node_2, {
							get data() {
								return $.get(pageData);
							},

							columns: [
								{ name: 'name', align: 'left' },
								{ name: 'calories', align: 'right', format: 'integer' },
								{ name: 'fat', align: 'right', format: 'integer' },
								{ name: 'carbs', align: 'right', format: 'integer' },
								{ name: 'protein', align: 'right', format: 'integer' }
							]
						});

						var node_3 = $.sibling(node_2, 2);

						Pagination(node_3, {
							get pagination() {
								return $.get(pagination);
							},
							perPageOptions: [5, 10, 25, 100],
							show: ['perPage', 'pagination', 'prevPage', 'nextPage'],
							classes: {
								root: 'border-t py-1 mt-2',
								perPage: 'flex-1 text-right',
								pagination: 'px-8'
							}
						});

						$.append($$anchor, fragment_3);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [...data].sort($order().handler));

				Table($$anchor, {
					get data() {
						return $.get($0);
					},

					columns: [
						{ name: 'name', align: 'left' },
						{ name: 'calories', align: 'right', format: 'integer' },
						{ name: 'fat', align: 'right', format: 'integer' },
						{
							name: 'carbs',
							align: 'right',
							format: 'integer',
							orderBy: false
						},
						{ name: 'protein', align: 'right', format: 'integer' }
					],

					get order() {
						return order;
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => data.sort($order().handler));

				Paginate($$anchor, {
					get data() {
						return $.get($0);
					},
					perPage: 5,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const pageData = $.derived(() => $$slotProps.pageData);
							const pagination = $.derived(() => $$slotProps.pagination);
							var fragment_6 = root();
							var node_6 = $.first_child(fragment_6);

							Table(node_6, {
								get data() {
									return $.get(pageData);
								},

								columns: [
									{ name: 'name', align: 'left' },
									{ name: 'calories', align: 'right', format: 'integer' },
									{ name: 'fat', align: 'right', format: 'integer' },
									{ name: 'carbs', align: 'right', format: 'integer' },
									{ name: 'protein', align: 'right', format: 'integer' }
								],

								get order() {
									return order;
								},

								$$events: {
									headerClick: (e) => {
										//Switch back to page 1 when sorting
										$.get(pagination).setPage(1);
									}
								}
							});

							var node_7 = $.sibling(node_6, 2);

							Pagination(node_7, {
								get pagination() {
									return $.get(pagination);
								},
								perPageOptions: [5, 10, 25, 100],
								show: ['perPage', 'pagination', 'prevPage', 'nextPage'],
								classes: {
									root: 'border-t py-1 mt-2',
									perPage: 'flex-1 text-right',
									pagination: 'px-8'
								}
							});

							$.append($$anchor, fragment_6);
						}
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_5, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_9 = $.first_child(fragment_7);

			Button(node_9, {
				variant: 'outline',
				color: 'primary',
				class: 'mb-1',
				$$events: { click: () => randomData = randomDataGen() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Randomize');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Table(node_10, {
				get data() {
					return randomData;
				},

				columns: [
					{ name: 'name', align: 'left' },
					{
						name: 'calories',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-primary/5 to-primary/10' }
					},

					{
						name: 'fat',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-secondary/5 to-secondary/10' }
					},

					{
						name: 'carbs',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-success/5 to-success/10' }
					},

					{
						name: 'protein',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-danger/5 to-danger/10' }
					}
				]
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_8, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			Table($$anchor, {
				get data() {
					return data;
				},

				columns: [
					{
						name: 'name',
						align: 'left',
						format: (value) => {
							// TODO: Docs currently do not support backticks (template literals)
							return '<a href="https://www.google.com/search?q=' + value + '" class="underline" target="_blank">' + value + '</a>';
						},
						html: true
					},
					{ name: 'calories', align: 'right', format: 'integer' },
					{ name: 'fat', align: 'right', format: 'integer' },
					{ name: 'carbs', align: 'right', format: 'integer' },
					{ name: 'protein', align: 'right', format: 'integer' }
				]
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_13 = $.first_child(fragment_9);

			Button(node_13, {
				variant: 'outline',
				color: 'primary',
				class: 'mb-1',
				$$events: { click: () => randomData = randomDataGen() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Randomize');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Table(node_14, {
				get data() {
					return randomData;
				},

				columns: [
					{ name: 'name', align: 'left' },
					{
						name: 'calories',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-primary/5 to-primary/10' }
					},

					{
						name: 'fat',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-secondary/5 to-secondary/10' }
					},

					{
						name: 'carbs',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-success/5 to-success/10' }
					},

					{
						name: 'protein',
						align: 'right',
						format: 'integer',
						dataBackground: { inset: [1, 2], tweened: { duration: 300 } },
						classes: { td: 'from-danger/5 to-danger/10' }
					}
				],
				$$slots: {
					data: ($$anchor, $$slotProps) => {
						const columns = $.derived(() => $$slotProps.columns);
						const data = $.derived(() => $$slotProps.data);
						const getCellValue = $.derived(() => $$slotProps.getCellValue);
						var tbody = root_3();

						$.each(tbody, 21, () => $.get(data) ?? [], $.index, ($$anchor, rowData, rowIndex) => {
							var tr = root_2();

							$.each(tr, 21, () => $.get(columns), (column) => column.name, ($$anchor, column) => {
								const value = $.derived(() => $.get(getCellValue)($.get(column), $.get(rowData), rowIndex));
								var td = root_1();
								var node_15 = $.child(td);

								{
									var consequent = ($$anchor) => {
										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(value)));
										$.append($$anchor, text_2);
									};

									var alternate = ($$anchor) => {
										{
											let $0 = $.derived(() => columnFormatAsNumberFormat($.get(column).format));
											let $1 = $.derived(() => typeof $.get(column).dataBackground === 'object' ? $.get(column).dataBackground.tweened : undefined);

											TweenedValue($$anchor, {
												get value() {
													return $.get(value);
												},

												get format() {
													return $.get($0);
												},

												get options() {
													return $.get($1);
												}
											});
										}
									};

									$.if(node_15, ($$render) => {
										if ($.get(column).name === 'name') $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.reset(td);

								$.action(td, ($$node, $$action_arg) => tableCell?.($$node, $$action_arg), () => ({
									column: $.get(column),
									rowData: $.get(rowData),
									rowIndex,
									tableData: $.get(data)
								}));

								$.append($$anchor, td);
							});

							$.reset(tr);
							$.append($$anchor, tr);
						});

						$.reset(tbody);
						$.append($$anchor, tbody);
					}
				}
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_12, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			Table($$anchor, {
				get data() {
					return data;
				},

				columns: [
					{ name: 'name', align: 'left' },
					{ name: 'calories', align: 'right', format: 'integer' },
					{ name: 'fat', align: 'right', format: 'integer' },
					{ name: 'carbs', align: 'right', format: 'integer' },
					{ name: 'protein', align: 'right', format: 'integer' },
					{ name: 'actions', header: '', align: 'right' }
				],
				$$slots: {
					data: ($$anchor, $$slotProps) => {
						const columns = $.derived(() => $$slotProps.columns);
						const data = $.derived(() => $$slotProps.data);
						const getCellValue = $.derived(() => $$slotProps.getCellValue);
						const getCellContent = $.derived(() => $$slotProps.getCellContent);
						var tbody_1 = root_3();

						$.each(tbody_1, 21, () => $.get(data) ?? [], $.index, ($$anchor, rowData, rowIndex) => {
							var tr_1 = root_2();

							$.each(tr_1, 21, () => $.get(columns), (column) => column.name, ($$anchor, column) => {
								const value = $.derived(() => $.get(getCellValue)($.get(column), $.get(rowData), rowIndex));
								const content = $.derived(() => $.get(getCellContent)($.get(column), $.get(rowData), rowIndex));
								var td_1 = root_1();
								var node_17 = $.child(td_1);

								{
									var consequent_1 = ($$anchor) => {
										Toggle($$anchor, {
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const open = $.derived(() => $$slotProps.on);
													const toggle = $.derived(() => $$slotProps.toggle);
													const toggleOff = $.derived(() => $$slotProps.toggleOff);

													Button($$anchor, {
														get icon() {
															return mdiDotsVertical;
														},
														iconOnly: true,
														size: 'sm',
														$$events: {
															click: function (...$$args) {
																$.get(toggle)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															Menu($$anchor, {
																get open() {
																	return $.get(open);
																},
																placement: 'bottom-end',
																$$events: {
																	close: function (...$$args) {
																		$.get(toggleOff)?.apply(this, $$args);
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_16 = root();
																	var node_18 = $.first_child(fragment_16);

																	MenuItem(node_18, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Edit');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});

																	var node_19 = $.sibling(node_18, 2);

																	MenuItem(node_19, {
																		class: 'text-danger',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Delete');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_16);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												}
											}
										});
									};

									var alternate_1 = ($$anchor) => {
										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(content)));
										$.append($$anchor, text_5);
									};

									$.if(node_17, ($$render) => {
										if ($.get(column).name === 'actions') $$render(consequent_1); else $$render(alternate_1, -1);
									});
								}

								$.reset(td_1);

								$.action(td_1, ($$node, $$action_arg) => tableCell?.($$node, $$action_arg), () => ({
									column: $.get(column),
									rowData: $.get(rowData),
									rowIndex,
									tableData: $.get(data)
								}));

								$.append($$anchor, td_1);
							});

							$.reset(tr_1);
							$.append($$anchor, tr_1);
						});

						$.reset(tbody_1);
						$.append($$anchor, tbody_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}