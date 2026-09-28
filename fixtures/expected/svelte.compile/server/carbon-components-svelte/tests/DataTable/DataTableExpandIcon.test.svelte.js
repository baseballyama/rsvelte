import * as $ from 'svelte/internal/server';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";

export default function DataTableExpandIcon_test($$renderer) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" }
	];

	const rows = [
		{ id: "a", name: "Load Balancer 1", protocol: "HTTP" },
		{ id: "b", name: "Load Balancer 2", protocol: "HTTPS" }
	];

	DataTable($$renderer, {
		expandable: true,
		headers,
		rows,
		$$slots: {
			expandIcon: ($$renderer, { expanded, props }) => {
				{
					ChevronRight($$renderer, $.spread_props([
						props,
						{
							'data-testid': 'custom-expand-icon',
							'data-expanded': expanded
						}
					]));
				}
			},

			expandedRow: ($$renderer, { row }) => {
				{
					$$renderer.push(`<pre>${$.escape(JSON.stringify(row, null, 2))}</pre>`);
				}
			}
		}
	});
}