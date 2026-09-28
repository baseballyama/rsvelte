import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import Toolbar from "carbon-components-svelte/DataTable/Toolbar.svelte";
import ToolbarContent from "carbon-components-svelte/DataTable/ToolbarContent.svelte";
import ToolbarSearch from "carbon-components-svelte/DataTable/ToolbarSearch.svelte";

var root = $.from_html(`<!> <div data-testid="filtered-ids-1"> </div> <!> <div data-testid="filtered-ids-2"> </div> <!> <div data-testid="filtered-ids-3"> </div>`, 1);

export default function ToolbarSearchGenerics_test($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root();
	var node = $.first_child(fragment);

	DataTable(node, {
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ToolbarSearch($$anchor, {
								shouldFilterRows: true,
								get value() {
									return searchValue;
								},

								set value($$value) {
									searchValue = $$value;
								},

								get filteredRowIds() {
									return filteredRowIds;
								},

								set filteredRowIds($$value) {
									filteredRowIds = $$value;
								},

								$$events: {
									input: () => {
										// filteredRowIds should be typed as ReadonlyArray<Row["id"]>
										// which is ReadonlyArray<"row-1" | "row-2" | "row-3">
										console.log("Filtered IDs:", filteredRowIds);
									}
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

	var div = $.sibling(node, 2);
	var text = $.only_child(div, true);
	var node_1 = $.sibling(div, 2);

	DataTable(node_1, {
		get headers() {
			return numericHeaders;
		},

		get rows() {
			return numericRows;
		},

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ToolbarSearch($$anchor, {
								shouldFilterRows: true,
								get value() {
									return numericSearchValue;
								},

								set value($$value) {
									numericSearchValue = $$value;
								},

								get filteredRowIds() {
									return numericFilteredRowIds;
								},

								set filteredRowIds($$value) {
									numericFilteredRowIds = $$value;
								},

								$$events: {
									input: () => {
										// numericFilteredRowIds should be typed as ReadonlyArray<NumericRow["id"]>
										// which is ReadonlyArray<1 | 2 | 3>
										console.log("Numeric filtered IDs:", numericFilteredRowIds);
									}
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

	var div_1 = $.sibling(node_1, 2);
	var text_1 = $.only_child(div_1, true);
	var node_2 = $.sibling(div_1, 2);

	DataTable(node_2, {
		get headers() {
			return productHeaders;
		},

		get rows() {
			return productRows;
		},

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ToolbarSearch($$anchor, {
								shouldFilterRows: customProductFilter,
								get value() {
									return productSearchValue;
								},

								set value($$value) {
									productSearchValue = $$value;
								},

								get filteredRowIds() {
									return productFilteredRowIds;
								},

								set filteredRowIds($$value) {
									productFilteredRowIds = $$value;
								},

								$$events: {
									input: () => {
										// productFilteredRowIds should be typed as ReadonlyArray<ProductRow["id"]>
										// which is ReadonlyArray<string>
										// customProductFilter receives ProductRow type, not DataTableRow<any>
										console.log("Product filtered IDs:", productFilteredRowIds);
									}
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

	var div_2 = $.sibling(node_2, 2);
	var text_2 = $.only_child(div_2, true);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
		},
		[
			() => JSON.stringify(filteredRowIds),
			() => JSON.stringify(numericFilteredRowIds),
			() => JSON.stringify(productFilteredRowIds)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}