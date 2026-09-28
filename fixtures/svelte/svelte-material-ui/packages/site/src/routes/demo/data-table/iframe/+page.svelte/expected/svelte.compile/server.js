import * as $ from 'svelte/internal/server';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];

		if (typeof fetch !== 'undefined') {
			fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json').then((response) => response.json()).then((json) => items = json);
		}

		DataTable($$renderer, {
			stickyHeader: true,
			'table$aria-label': 'User list',
			style: 'width: 100%;',
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
										$$renderer.push(`<!---->Name`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Cell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Username`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Cell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Email`);
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
	});
}