import * as $ from 'svelte/internal/server';
import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

export default function VirtualizeMaxVisibleRows($$renderer) {
	const rows = Array.from({ length: 10_000 }, (_, i) => ({
		id: i,
		name: `Load Balancer ${i + 1}`,
		protocol: "HTTP",
		port: 3000 + i * 10,
		rule: i % 2 ? "Round robin" : "DNS delegation"
	}));

	let filteredRowIds = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		DataTable($$renderer, {
			sortable: true,
			virtualize: { maxVisibleRows: 5 },
			headers: [
				{ key: "name", value: "Name" },
				{ key: "protocol", value: "Protocol" },
				{ key: "port", value: "Port" },
				{ key: "rule", value: "Rule" }
			],
			rows,
			children: ($$renderer) => {
				Toolbar($$renderer, {
					children: ($$renderer) => {
						ToolbarContent($$renderer, {
							children: ($$renderer) => {
								ToolbarSearch($$renderer, {
									persistent: true,
									placeholder: 'Search 10,000 rows...',
									shouldFilterRows: true,
									get filteredRowIds() {
										return filteredRowIds;
									},

									set filteredRowIds($$value) {
										filteredRowIds = $$value;
										$$settled = false;
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}