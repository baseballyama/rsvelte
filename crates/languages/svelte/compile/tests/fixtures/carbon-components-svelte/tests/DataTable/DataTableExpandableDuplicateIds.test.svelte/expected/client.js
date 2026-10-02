import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DataTableExpandableDuplicateIds_test($$anchor) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "port", value: "Port" }
	];

	// Overlapping row ids across both tables (very common when ids are user data).
	const rows = [
		{ id: "0", name: "Row 0", port: 3000 },
		{ id: "1", name: "Row 1", port: 443 }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	DataTable(node, {
		expandable: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});

	var node_1 = $.sibling(node, 2);

	DataTable(node_1, {
		expandable: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});

	$.append($$anchor, fragment);
}