import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

export default function VirtualizeRowHeight($$anchor) {
	const rows = Array.from({ length: 10_000 }, (_, i) => ({
		id: i,
		name: `Load Balancer ${i + 1}`,
		protocol: "HTTP",
		port: 3000 + i * 10
	}));

	let filteredRowIds = [];

	DataTable($$anchor, {
		sortable: true,
		virtualize: { itemHeight: 20 },
		rowClass: 'virtualize-tall-row',
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "port", value: "Port" }
		],

		get rows() {
			return rows;
		},

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ToolbarSearch($$anchor, {
								persistent: true,
								placeholder: 'Search 10,000 rows...',
								shouldFilterRows: true,
								get filteredRowIds() {
									return filteredRowIds;
								},

								set filteredRowIds($$value) {
									filteredRowIds = $$value;
								}
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}