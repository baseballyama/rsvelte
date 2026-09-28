import * as $ from 'svelte/internal/server';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

export default function DataTableExpandableDuplicateIds_test($$renderer) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "port", value: "Port" }
	];

	// Overlapping row ids across both tables (very common when ids are user data).
	const rows = [
		{ id: "0", name: "Row 0", port: 3000 },
		{ id: "1", name: "Row 1", port: 443 }
	];

	DataTable($$renderer, { expandable: true, headers, rows });
	$$renderer.push(`<!----> `);
	DataTable($$renderer, { expandable: true, headers, rows });
	$$renderer.push(`<!---->`);
}