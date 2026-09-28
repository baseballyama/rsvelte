import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

var root = $.from_html(`<pre> </pre>`);

export default function DataTableRowClass($$anchor) {
	let selectedRowIds = [];
	let expandedRowIds = [];

	DataTable($$anchor, {
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
		},

		get expandedRowIds() {
			return expandedRowIds;
		},

		set expandedRowIds($$value) {
			expandedRowIds = $$value;
		},

		$$slots: {
			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				var pre = root();
				var text = $.only_child(pre, true);

				$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($.get(row), null, 2)]);
				$.append($$anchor, pre);
			}
		}
	});
}