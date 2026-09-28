import * as $ from 'svelte/internal/server';
import { DataTable, OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

export default function DataTableAppendColumns($$renderer) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "port", value: "Port" },
		{ key: "rule", value: "Rule" },
		{ key: "overflow", empty: true, width: "72px" }
	];

	const rows = [
		{
			id: "a",
			name: "Load Balancer 3",
			port: 3000,
			rule: "Round robin"
		},

		{
			id: "b",
			name: "Load Balancer 1",
			port: 443,
			rule: "Round robin"
		},

		{
			id: "c",
			name: "Load Balancer 2",
			port: 80,
			rule: "DNS delegation"
		},

		{
			id: "d",
			name: "Load Balancer 6",
			port: 3000,
			rule: "Round robin"
		},

		{
			id: "e",
			name: "Load Balancer 4",
			port: 443,
			rule: "Round robin"
		},

		{
			id: "f",
			name: "Load Balancer 5",
			port: 80,
			rule: "DNS delegation"
		}
	];

	DataTable($$renderer, {
		sortable: true,
		headers,
		rows,
		$$slots: {
			cell: ($$renderer, { cell }) => {
				{
					if (cell.key === "overflow") {
						$$renderer.push('<!--[0-->');

						OverflowMenu($$renderer, {
							portalMenu: true,
							flipped: true,
							children: ($$renderer) => {
								OverflowMenuItem($$renderer, { text: 'Restart' });
								$$renderer.push(`<!----> `);

								OverflowMenuItem($$renderer, {
									href: 'https://cloud.ibm.com/docs/loadbalancer-service',
									text: 'API documentation'
								});

								$$renderer.push(`<!----> `);
								OverflowMenuItem($$renderer, { danger: true, text: 'Stop' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(cell.value)}`);
					}

					$$renderer.push(`<!--]-->`);
				}
			}
		}
	});
}