import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Table($$renderer, {
					data,
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

		$$renderer.push(`<!----> <h2>Pagination</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Paginate($$renderer, {
					data,
					perPage: 5,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { pageData, pagination }) => {
							Table($$renderer, {
								data: pageData,
								columns: [
									{ name: 'name', align: 'left' },
									{ name: 'calories', align: 'right', format: 'integer' },
									{ name: 'fat', align: 'right', format: 'integer' },
									{ name: 'carbs', align: 'right', format: 'integer' },
									{ name: 'protein', align: 'right', format: 'integer' }
								]
							});

							$$renderer.push(`<!----> `);

							Pagination($$renderer, {
								pagination,
								perPageOptions: [5, 10, 25, 100],
								show: ['perPage', 'pagination', 'prevPage', 'nextPage'],
								classes: {
									root: 'border-t py-1 mt-2',
									perPage: 'flex-1 text-right',
									pagination: 'px-8'
								}
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Order</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Table($$renderer, {
					data: [...data].sort($.store_get($$store_subs ??= {}, '$order', order).handler),
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
					order
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Order + Pagination</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Paginate($$renderer, {
					data: data.sort($.store_get($$store_subs ??= {}, '$order', order).handler),
					perPage: 5,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { pageData, pagination }) => {
							Table($$renderer, {
								data: pageData,
								columns: [
									{ name: 'name', align: 'left' },
									{ name: 'calories', align: 'right', format: 'integer' },
									{ name: 'fat', align: 'right', format: 'integer' },
									{ name: 'carbs', align: 'right', format: 'integer' },
									{ name: 'protein', align: 'right', format: 'integer' }
								],
								order
							});

							$$renderer.push(`<!----> `);

							Pagination($$renderer, {
								pagination,
								perPageOptions: [5, 10, 25, 100],
								show: ['perPage', 'pagination', 'prevPage', 'nextPage'],
								classes: {
									root: 'border-t py-1 mt-2',
									perPage: 'flex-1 text-right',
									pagination: 'px-8'
								}
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Data background</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					class: 'mb-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Randomize`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Table($$renderer, {
					data: randomData,
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Formatting with HTML</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Table($$renderer, {
					data,
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

		$$renderer.push(`<!----> <h2>Customize markup</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					class: 'mb-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Randomize`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Table($$renderer, {
					data: randomData,
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
						data: ($$renderer, { columns, data, getCellValue }) => {
							$$renderer.push(`<tbody slot="data"><!--[-->`);

							const each_array = $.ensure_array_like(data ?? []);

							for (let rowIndex = 0, $$length = each_array.length; rowIndex < $$length; rowIndex++) {
								let rowData = each_array[rowIndex];

								$$renderer.push(`<tr class="tabular-nums"><!--[-->`);

								const each_array_1 = $.ensure_array_like(columns);

								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let column = each_array_1[$$index];
									const value = getCellValue(column, rowData, rowIndex);

									$$renderer.push(`<td>`);

									if (column.name === 'name') {
										$$renderer.push(`<!--[0-->${$.escape(value)}`);
									} else {
										$$renderer.push('<!--[-1-->');

										TweenedValue($$renderer, {
											value,
											format: columnFormatAsNumberFormat(column.format),
											options: typeof column.dataBackground === 'object' ? column.dataBackground.tweened : undefined
										});
									}

									$$renderer.push(`<!--]--></td>`);
								}

								$$renderer.push(`<!--]--></tr>`);
							}

							$$renderer.push(`<!--]--></tbody>`);
						}
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Row actions</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Table($$renderer, {
					data,
					columns: [
						{ name: 'name', align: 'left' },
						{ name: 'calories', align: 'right', format: 'integer' },
						{ name: 'fat', align: 'right', format: 'integer' },
						{ name: 'carbs', align: 'right', format: 'integer' },
						{ name: 'protein', align: 'right', format: 'integer' },
						{ name: 'actions', header: '', align: 'right' }
					],
					$$slots: {
						data: ($$renderer, { columns, data, getCellValue, getCellContent }) => {
							$$renderer.push(`<tbody slot="data"><!--[-->`);

							const each_array_2 = $.ensure_array_like(data ?? []);

							for (let rowIndex = 0, $$length = each_array_2.length; rowIndex < $$length; rowIndex++) {
								let rowData = each_array_2[rowIndex];

								$$renderer.push(`<tr class="tabular-nums"><!--[-->`);

								const each_array_3 = $.ensure_array_like(columns);

								for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
									let column = each_array_3[$$index_2];
									const value = getCellValue(column, rowData, rowIndex);
									const content = getCellContent(column, rowData, rowIndex);

									$$renderer.push(`<td>`);

									if (column.name === 'actions') {
										$$renderer.push('<!--[0-->');

										Toggle($$renderer, {
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$renderer, { on: open, toggle, toggleOff }) => {
													Button($$renderer, {
														icon: mdiDotsVertical,
														iconOnly: true,
														size: 'sm',
														children: ($$renderer) => {
															Menu($$renderer, {
																open,
																placement: 'bottom-end',
																children: ($$renderer) => {
																	MenuItem($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Edit`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	MenuItem($$renderer, {
																		class: 'text-danger',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Delete`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												}
											}
										});
									} else {
										$$renderer.push(`<!--[-1-->${$.escape(content)}`);
									}

									$$renderer.push(`<!--]--></td>`);
								}

								$$renderer.push(`<!--]--></tr>`);
							}

							$$renderer.push(`<!--]--></tbody>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}