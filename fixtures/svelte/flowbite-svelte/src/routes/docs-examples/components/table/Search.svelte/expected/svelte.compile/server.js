import * as $ from 'svelte/internal/server';

import {
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	TableSearch
} from "flowbite-svelte";

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let searchTerm = "";

		let items = [
			{ id: 1, maker: "Toyota", type: "ABC", make: 2017 },
			{ id: 2, maker: "Ford", type: "CDE", make: 2018 },
			{ id: 3, maker: "Volvo", type: "FGH", make: 2019 },
			{ id: 4, maker: "Saab", type: "IJK", make: 2020 }
		];

		let filteredItems = $.derived(() => items.filter((item) => !searchTerm || item.maker.toLowerCase().includes(searchTerm.toLowerCase())));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TableSearch($$renderer, {
				placeholder: 'Search by maker name',
				hoverable: true,
				get inputValue() {
					return searchTerm;
				},

				set inputValue($$value) {
					searchTerm = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					TableHead($$renderer, {
						children: ($$renderer) => {
							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->ID`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Maker`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Type`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Make`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(filteredItems());

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let item = each_array[$$index];

								TableBodyRow($$renderer, {
									children: ($$renderer) => {
										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.id)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.maker)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.type)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item.make)}`);
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