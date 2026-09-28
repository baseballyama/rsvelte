import * as $ from 'svelte/internal/server';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

export default function DataTableCustomBoth_test($$renderer) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" }
	];

	const rows = [{ id: "a", name: "Load Balancer 1", protocol: "HTTP" }];

	DataTable($$renderer, {
		headers,
		rows,
		$$slots: {
			titleChildren: ($$renderer, { props }) => {
				$$renderer.push(`<h2${$.attributes({ slot: 'titleChildren', ...props })}>Custom Title</h2>`);
			},

			descriptionChildren: ($$renderer, { props }) => {
				$$renderer.push(`<div${$.attributes({ slot: 'descriptionChildren', ...props })}>Custom Description</div>`);
			}
		}
	});
}