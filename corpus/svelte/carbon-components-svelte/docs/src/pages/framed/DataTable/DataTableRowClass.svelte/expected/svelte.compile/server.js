import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function DataTableRowClass($$renderer) {
	let selectedRowIds = [];
	let expandedRowIds = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		DataTable($$renderer, {
			selectable: true,
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
					protocol: "HTTPS",
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
					protocol: "HTTPS",
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

			rowClass: ({ row, selected, expanded }) => {
				const classes = [];

				if (row.protocol === "HTTPS") classes.push("secure");
				if (selected) classes.push("selected");
				if (expanded) classes.push("expanded");

				return classes.join(" ") || undefined;
			},

			get selectedRowIds() {
				return selectedRowIds;
			},

			set selectedRowIds($$value) {
				selectedRowIds = $$value;
				$$settled = false;
			},

			get expandedRowIds() {
				return expandedRowIds;
			},

			set expandedRowIds($$value) {
				expandedRowIds = $$value;
				$$settled = false;
			},

			$$slots: {
				expandedRow: ($$renderer, { row }) => {
					{
						$$renderer.push(`<pre>${$.escape(JSON.stringify(row, null, 2))}</pre>`);
					}
				}
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}