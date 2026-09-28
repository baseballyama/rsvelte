import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

export default function DataTableNonSelectableRows($$anchor, $$props) {
	$.push($$props, true);

	const rows = [
		{
			id: "a",
			name: "Load Balancer 3",
			protocol: "HTTP",
			port: 3000,
			rule: "Round robin"
		},

		{
			id: "b",
			name: "Load Balancer 1",
			protocol: "HTTP",
			port: 443,
			rule: "Round robin"
		},

		{
			id: "c",
			name: "Load Balancer 2",
			protocol: "HTTP",
			port: 80,
			rule: "DNS delegation"
		},

		{
			id: "d",
			name: "Load Balancer 6",
			protocol: "HTTP",
			port: 3000,
			rule: "Round robin"
		},

		{
			id: "e",
			name: "Load Balancer 4",
			protocol: "HTTP",
			port: 443,
			rule: "Round robin"
		},

		{
			id: "f",
			name: "Load Balancer 5",
			protocol: "HTTP",
			port: 80,
			rule: "DNS delegation"
		}
	];

	{
		let $0 = $.derived(() => rows.filter((row) => row.port === 3000).map((row) => row.id));

		DataTable($$anchor, {
			batchSelection: true,
			get nonSelectableRowIds() {
				return $.get($0);
			},

			headers: [
				{ key: "name", value: "Name" },
				{ key: "protocol", value: "Protocol" },
				{ key: "port", value: "Port" },
				{ key: "rule", value: "Rule" }
			],

			get rows() {
				return rows;
			}
		});
	}

	$.pop();
}