import * as $ from 'svelte/internal/server';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import Toolbar from "carbon-components-svelte/DataTable/Toolbar.svelte";
import ToolbarContent from "carbon-components-svelte/DataTable/ToolbarContent.svelte";
import ToolbarSearch from "carbon-components-svelte/DataTable/ToolbarSearch.svelte";

export default function ToolbarSearchGenerics_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rows = [
			{ id: "row-1", name: "Laptop", price: 999 },
			{ id: "row-2", name: "Phone", price: 599 },
			{ id: "row-3", name: "Desk", price: 299 }
		];

		const headers = [
			{ key: "id", value: "ID" },
			{ key: "name", value: "Name" },
			{ key: "price", value: "Price" }
		];

		let filteredRowIds = [];
		let searchValue = "";

		const numericRows = [
			{ id: 1, name: "Item 1", category: "Electronics" },
			{ id: 2, name: "Item 2", category: "Furniture" },
			{ id: 3, name: "Item 3", category: "Electronics" }
		];

		const numericHeaders = [
			{ key: "id", value: "ID" },
			{ key: "name", value: "Name" },
			{ key: "category", value: "Category" }
		];

		let numericFilteredRowIds = [];
		let numericSearchValue = "";

		const productRows = [
			{ id: "prod-1", name: "Widget", price: 10, inStock: true },
			{ id: "prod-2", name: "Gadget", price: 20, inStock: false },
			{ id: "prod-3", name: "Thing", price: 15, inStock: true }
		];

		const productHeaders = [
			{ key: "id", value: "ID" },
			{ key: "name", value: "Name" },
			{ key: "price", value: "Price" },
			{ key: "inStock", value: "In Stock" }
		];

		let productFilteredRowIds = [];
		let productSearchValue = "";

		const customProductFilter = (row, value) => {
			const search = String(value).toLowerCase();

			return row.name.toLowerCase().includes(search) || row.id.toLowerCase().includes(search);
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DataTable($$renderer, {
				headers,
				rows,
				children: ($$renderer) => {
					Toolbar($$renderer, {
						children: ($$renderer) => {
							ToolbarContent($$renderer, {
								children: ($$renderer) => {
									ToolbarSearch($$renderer, {
										shouldFilterRows: true,
										get value() {
											return searchValue;
										},

										set value($$value) {
											searchValue = $$value;
											$$settled = false;
										},

										get filteredRowIds() {
											return filteredRowIds;
										},

										set filteredRowIds($$value) {
											filteredRowIds = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div data-testid="filtered-ids-1">${$.escape(JSON.stringify(filteredRowIds))}</div> `);

			DataTable($$renderer, {
				headers: numericHeaders,
				rows: numericRows,
				children: ($$renderer) => {
					Toolbar($$renderer, {
						children: ($$renderer) => {
							ToolbarContent($$renderer, {
								children: ($$renderer) => {
									ToolbarSearch($$renderer, {
										shouldFilterRows: true,
										get value() {
											return numericSearchValue;
										},

										set value($$value) {
											numericSearchValue = $$value;
											$$settled = false;
										},

										get filteredRowIds() {
											return numericFilteredRowIds;
										},

										set filteredRowIds($$value) {
											numericFilteredRowIds = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div data-testid="filtered-ids-2">${$.escape(JSON.stringify(numericFilteredRowIds))}</div> `);

			DataTable($$renderer, {
				headers: productHeaders,
				rows: productRows,
				children: ($$renderer) => {
					Toolbar($$renderer, {
						children: ($$renderer) => {
							ToolbarContent($$renderer, {
								children: ($$renderer) => {
									ToolbarSearch($$renderer, {
										shouldFilterRows: customProductFilter,
										get value() {
											return productSearchValue;
										},

										set value($$value) {
											productSearchValue = $$value;
											$$settled = false;
										},

										get filteredRowIds() {
											return productFilteredRowIds;
										},

										set filteredRowIds($$value) {
											productFilteredRowIds = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div data-testid="filtered-ids-3">${$.escape(JSON.stringify(productFilteredRowIds))}</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}