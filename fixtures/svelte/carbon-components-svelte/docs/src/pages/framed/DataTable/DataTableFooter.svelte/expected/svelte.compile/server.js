import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function DataTableFooter($$renderer) {
	const rows = [
		{
			id: "a",
			name: "Load Balancer 3",
			protocol: "HTTP",
			requests: 12_480
		},

		{
			id: "b",
			name: "Load Balancer 1",
			protocol: "HTTPS",
			requests: 8_112
		},

		{
			id: "c",
			name: "Load Balancer 2",
			protocol: "HTTP",
			requests: 3_907
		},

		{
			id: "d",
			name: "Load Balancer 6",
			protocol: "HTTPS",
			requests: 21_650
		}
	];

	const totalRequests = rows.reduce((total, row) => total + row.requests, 0);

	DataTable($$renderer, {
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "requests", value: "Requests" }
		],
		rows,
		$$slots: {
			footerCell: ($$renderer, { header, index }) => {
				{
					if (header.key === "requests") {
						$$renderer.push(`<!--[0-->${$.escape(totalRequests.toLocaleString())}`);
					} else if (index === 0) {
						$$renderer.push(`<!--[1-->Total`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}
			}
		}
	});
}