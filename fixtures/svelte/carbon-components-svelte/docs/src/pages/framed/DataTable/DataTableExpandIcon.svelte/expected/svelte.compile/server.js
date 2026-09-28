import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function DataTableExpandIcon($$renderer) {
	DataTable($$renderer, {
		expandable: true,
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "port", value: "Port" },
			{ key: "rule", value: "Rule" }
		],
		rows: [
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
		],
		$$slots: {
			expandIcon: ($$renderer, { expanded, props }) => {
				{
					Add($$renderer, $.spread_props([
						props,
						{
							style: `display: inline-block; transition: transform 0.2s ease; transform: ${expanded ? 'rotate(45deg)' : 'rotate(0deg)'}`
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