import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

export default function DataTableExplicitGenerics_test($$anchor) {
	// This example showcases generic types, allowing type-safety
	// and IDE autocomplete for both header keys and row properties.
	const headers = [
		{ key: "id", value: "ID" },
		{ key: "name", value: "Product Name" },
		{ key: "price", value: "Price" },
		{ key: "category.name", value: "Category" },
		{ key: "category.department.name", value: "Department" },
		{ key: "category.department.location.city", value: "City" },
		{
			key: "category.department.location.country",
			value: "Country"
		},
		{ key: "inStock", value: "In Stock" }
	];

	const rows = [
		{
			id: "1",
			name: "Laptop",
			price: 1299.99,
			category: {
				name: "Electronics",
				department: {
					name: "Technology",
					location: { city: "San Francisco", country: "USA" }
				}
			},
			inStock: true
		},

		{
			id: "2",
			name: "Desk Chair",
			price: 299.99,
			category: {
				name: "Furniture",
				department: {
					name: "Office Supplies",
					location: { city: "New York", country: "USA" }
				}
			},
			inStock: false
		},

		{
			id: "3",
			name: "Monitor",
			price: 449.99,
			category: {
				name: "Electronics",
				department: {
					name: "Technology",
					location: { city: "Seattle", country: "USA" }
				}
			},
			inStock: true
		}
	];

	DataTable($$anchor, {
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});
}