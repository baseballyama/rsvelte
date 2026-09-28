import * as $ from 'svelte/internal/server';
import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Sortable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];
		let sort = 'id';
		let sortDirection = 'ascending';

		if (typeof fetch !== 'undefined') {
			fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json').then((response) => response.json()).then((json) => items = json);
		}

		function handleSort() {
			items.sort((a, b) => {
				const [aVal, bVal] = [a[sort], b[sort]][sortDirection === 'ascending' ? 'slice' : 'reverse']();

				if (typeof aVal === 'string' && typeof bVal === 'string') {
					return aVal.localeCompare(bVal);
				}

				return Number(aVal) - Number(bVal);
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DataTable($$renderer, {
				sortable: true,
				onSMUIDataTableSorted: handleSort,
				'table$aria-label': 'User list',
				style: 'width: 100%;',
				get sort() {
					return sort;
				},

				set sort($$value) {
					sort = $$value;
					$$settled = false;
				},

				get sortDirection() {
					return sortDirection;
				},

				set sortDirection($$value) {
					sortDirection = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Head($$renderer, {
						children: ($$renderer) => {
							Row($$renderer, {
								children: ($$renderer) => {
									Cell($$renderer, {
										numeric: true,
										columnId: 'id',
										children: ($$renderer) => {
											IconButton($$renderer, {
												children: ($$renderer) => {
													Icon($$renderer, {
														class: 'material-icons',
														children: ($$renderer) => {
															$$renderer.push(`<!---->arrow_upward`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->ID`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										columnId: 'name',
										style: 'width: 100%;',
										children: ($$renderer) => {
											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Name`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											IconButton($$renderer, {
												children: ($$renderer) => {
													Icon($$renderer, {
														class: 'material-icons',
														children: ($$renderer) => {
															$$renderer.push(`<!---->arrow_upward`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										columnId: 'username',
										children: ($$renderer) => {
											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Username`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											IconButton($$renderer, {
												children: ($$renderer) => {
													Icon($$renderer, {
														class: 'material-icons',
														children: ($$renderer) => {
															$$renderer.push(`<!---->arrow_upward`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										columnId: 'email',
										children: ($$renderer) => {
											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Email`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											IconButton($$renderer, {
												children: ($$renderer) => {
													Icon($$renderer, {
														class: 'material-icons',
														children: ($$renderer) => {
															$$renderer.push(`<!---->arrow_upward`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										sortable: false,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Website`);
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

							const each_array = $.ensure_array_like(items);

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
												$$renderer.push(`<!---->${$.escape(item.name)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.username)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.email)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.website)}`);
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
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}