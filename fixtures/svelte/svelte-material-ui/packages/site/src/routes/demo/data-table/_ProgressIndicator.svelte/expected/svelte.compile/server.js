import * as $ from 'svelte/internal/server';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
import LinearProgress from '@smui/linear-progress';
import Button from '@smui/button';

export default function _ProgressIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];
		let loaded = false;

		loadThings(false);

		function loadThings(wait) {
			if (typeof fetch !== 'undefined') {
				loaded = false;

				fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json').then((response) => response.json()).then((json) => setTimeout(
					() => {
						items = json;
						loaded = true;
					},
					// Simulate a long load time.
					wait ? 2000 : 0
				));
			}
		}

		$$renderer.push(`<div style="margin-bottom: 1em;">`);

		Button($$renderer, {
			onclick: () => loadThings(true),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Do Pretend Loading`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		{
			function progress($$renderer) {
				LinearProgress($$renderer, {
					indeterminate: true,
					closed: loaded,
					'aria-label': 'Data is being loaded...'
				});
			}

			DataTable($$renderer, {
				'table$aria-label': 'User list',
				style: 'width: 100%;',
				progress,
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
				$$slots: { progress: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}