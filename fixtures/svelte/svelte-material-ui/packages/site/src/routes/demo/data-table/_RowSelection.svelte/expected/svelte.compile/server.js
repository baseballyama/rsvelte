import * as $ from 'svelte/internal/server';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
import Checkbox from '@smui/checkbox';

export default function _RowSelection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let options = [
			{
				name: 'Broom',
				description: 'A wooden handled broom.',
				price: 15
			},

			{
				name: 'Dust Pan',
				description: 'A plastic dust pan.',
				price: 8
			},

			{
				name: 'Mop',
				description: 'A strong, durable mop.',
				price: 18
			},

			{
				name: 'Horse',
				description: "She's got some miles on her.",
				price: 83
			},
			{ name: 'Bucket', description: 'A metal bucket.', price: 13 }
		];

		let selected = [options[2]];
		const selectedPrice = $.derived(() => selected.reduce((total, option) => option.price + total, 0));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DataTable($$renderer, {
				style: 'max-width: 100%;',
				children: ($$renderer) => {
					Head($$renderer, {
						children: ($$renderer) => {
							Row($$renderer, {
								children: ($$renderer) => {
									Cell($$renderer, {
										checkbox: true,
										children: ($$renderer) => {
											Checkbox($$renderer, {});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Description`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Cell($$renderer, {
										numeric: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Price`);
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

							const each_array = $.ensure_array_like(options);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let option = each_array[$$index];

								Row($$renderer, {
									children: ($$renderer) => {
										Cell($$renderer, {
											checkbox: true,
											children: ($$renderer) => {
												Checkbox($$renderer, {
													value: option,
													valueKey: option.name,
													get group() {
														return selected;
													},

													set group($$value) {
														selected = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(option.name)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(option.description)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Cell($$renderer, {
											numeric: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(option.price)}`);
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

			$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected.map((option) => option.name).join(', '))}</pre> <pre class="status">Total: ${$.escape(selectedPrice())}</pre>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}