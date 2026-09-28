import * as $ from 'svelte/internal/server';
import DataTable, { Head, Body, Row, Cell, Pagination } from '@smui/data-table';
import Select, { Option } from '@smui/select';
import IconButton, { Icon } from '@smui/icon-button';
import { Label } from '@smui/common';

export default function _Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];
		let perPage = 10;
		let currentPage = 0;
		const start = $.derived(() => currentPage * perPage);
		const end = $.derived(() => Math.min(start() + perPage, items.length));
		const slice = $.derived(() => items.slice(start(), end()));
		const lastPage = $.derived(() => Math.max(Math.ceil(items.length / perPage) - 1, 0));

		if (typeof fetch !== 'undefined') {
			// Slice a few off the end to show how the
			// last page looks when it's not full.
			fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/todos.json').then((response) => response.json()).then((json) => items = json.slice(0, 197));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function paginate($$renderer) {
					{
						function rowsPerPage($$renderer) {
							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Rows Per Page`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Select($$renderer, {
								variant: 'outlined',
								noLabel: true,
								get value() {
									return perPage;
								},

								set value($$value) {
									perPage = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									Option($$renderer, {
										value: 10,
										children: ($$renderer) => {
											$$renderer.push(`<!---->10`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Option($$renderer, {
										value: 25,
										children: ($$renderer) => {
											$$renderer.push(`<!---->25`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Option($$renderer, {
										value: 100,
										children: ($$renderer) => {
											$$renderer.push(`<!---->100`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}

						function total($$renderer) {
							$$renderer.push(`<!---->${$.escape(start() + 1)}-${$.escape(end())} of ${$.escape(items.length)}`);
						}

						Pagination($$renderer, {
							rowsPerPage,
							total,
							children: ($$renderer) => {
								IconButton($$renderer, {
									action: 'first-page',
									title: 'First page',
									onclick: () => currentPage = 0,
									disabled: currentPage === 0,
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->first_page`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									action: 'prev-page',
									title: 'Prev page',
									onclick: () => currentPage--,
									disabled: currentPage === 0,
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->chevron_left`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									action: 'next-page',
									title: 'Next page',
									onclick: () => currentPage++,
									disabled: currentPage === lastPage(),
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->chevron_right`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									action: 'last-page',
									title: 'Last page',
									onclick: () => currentPage = lastPage(),
									disabled: currentPage === lastPage(),
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->last_page`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { rowsPerPage: true, total: true, default: true }
						});
					}
				}

				DataTable($$renderer, {
					'table$aria-label': 'Todo list',
					style: 'width: 100%;',
					paginate,
					children: ($$renderer) => {
						Head($$renderer, {
							children: ($$renderer) => {
								Row($$renderer, {
									children: ($$renderer) => {
										Cell($$renderer, {
											numeric: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->ID`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											style: 'width: 100%;',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Title`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Completed`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											numeric: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->User ID`);
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

						$$renderer.push(`<!----> `);

						Body($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(slice());

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									Row($$renderer, {
										children: ($$renderer) => {
											Cell($$renderer, {
												numeric: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.id)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Cell($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.title)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Cell($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.completed ? 'Yes' : 'No')}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Cell($$renderer, {
												numeric: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.userId)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
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
					$$slots: { paginate: true, default: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}