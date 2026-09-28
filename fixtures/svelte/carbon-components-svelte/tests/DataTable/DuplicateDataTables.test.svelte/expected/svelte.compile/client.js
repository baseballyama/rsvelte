import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function DuplicateDataTables_test($$anchor) {
	const headers = [
		{ key: "id", value: "id" },
		{ key: "contact.company", value: "Company name" }
	];

	const rows = [
		{ id: "1", contact: { company: "Company 1" } },
		{ id: "2", contact: { company: "Company 2" } }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	DataTable(node, {
		inputName: 'radio-select',
		radio: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});

	var node_1 = $.sibling(node, 2);

	DataTable(node_1, {
		inputName: 'radio-select',
		radio: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	DataTable(node_2, {
		inputName: 'checkbox-select',
		batchSelection: true,
		selectable: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	DataTable(node_3, {
		inputName: 'checkbox-select',
		batchSelection: true,
		selectable: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		}
	});

	$.append($$anchor, fragment);
}