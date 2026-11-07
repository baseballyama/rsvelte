import * as $ from 'svelte/internal/server';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

export default function DuplicateDataTables_test($$renderer) {
	const headers = [
		{ key: "id", value: "id" },
		{ key: "contact.company", value: "Company name" }
	];

	const rows = [
		{ id: "1", contact: { company: "Company 1" } },
		{ id: "2", contact: { company: "Company 2" } }
	];

	DataTable($$renderer, { inputName: 'radio-select', radio: true, headers, rows });
	$$renderer.push(`<!----> `);
	DataTable($$renderer, { inputName: 'radio-select', radio: true, headers, rows });
	$$renderer.push(`<!----> `);

	DataTable($$renderer, {
		inputName: 'checkbox-select',
		batchSelection: true,
		selectable: true,
		headers,
		rows
	});

	$$renderer.push(`<!----> `);

	DataTable($$renderer, {
		inputName: 'checkbox-select',
		batchSelection: true,
		selectable: true,
		headers,
		rows
	});

	$$renderer.push(`<!---->`);
}