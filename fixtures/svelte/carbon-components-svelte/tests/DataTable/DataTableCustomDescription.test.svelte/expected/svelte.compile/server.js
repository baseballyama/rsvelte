import * as $ from 'svelte/internal/server';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

export default function DataTableCustomDescription_test($$renderer) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" }
	];

	const rows = [{ id: "a", name: "Load Balancer 1", protocol: "HTTP" }];

	DataTable($$renderer, {
		headers,
		rows,
		$$slots: {
			descriptionChildren: ($$renderer, { props }) => {
				$$renderer.push(`<div${$.attributes({ slot: 'descriptionChildren', ...props })}>Custom Description</div>`);
			}
		}
	});
}