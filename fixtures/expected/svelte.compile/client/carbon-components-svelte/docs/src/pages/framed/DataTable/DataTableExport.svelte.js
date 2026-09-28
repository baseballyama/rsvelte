import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	DataTable,
	downloadFile,
	Toolbar,
	ToolbarContent,
	ToolbarSearch,
	toCsv
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DataTableExport($$anchor, $$props) {
	$.push($$props, true);

	const headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" },
		{ key: "port", value: "Port" },
		{ key: "rule", value: "Rule" }
	];

	const rows = Array.from({ length: 10 }).map((_, i) => ({
		id: i,
		name: `Load Balancer ${i + 1}`,
		protocol: "HTTP",
		port: 3000 + i * 10,
		rule: i % 2 ? "Round robin" : "DNS delegation"
	}));

	let filteredRowIds = [];

	function downloadCsv() {
		const matchedIds = new Set(filteredRowIds);
		const csv = toCsv(headers, rows.filter((row) => matchedIds.has(row.id)));

		downloadFile(csv, "load-balancers.csv", "text/csv;charset=utf-8");
	}

	DataTable($$anchor, {
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node = $.first_child(fragment_3);

							ToolbarSearch(node, {
								persistent: true,
								shouldFilterRows: true,
								get filteredRowIds() {
									return filteredRowIds;
								},

								set filteredRowIds($$value) {
									filteredRowIds = $$value;
								}
							});

							var node_1 = $.sibling(node, 2);

							Button(node_1, {
								$$events: { click: downloadCsv },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Export CSV');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}