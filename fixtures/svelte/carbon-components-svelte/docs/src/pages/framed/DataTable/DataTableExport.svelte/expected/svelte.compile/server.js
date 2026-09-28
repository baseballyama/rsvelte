import * as $ from 'svelte/internal/server';

import {
	Button,
	DataTable,
	downloadFile,
	Toolbar,
	ToolbarContent,
	ToolbarSearch,
	toCsv
} from "carbon-components-svelte";

export default function DataTableExport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DataTable($$renderer, {
				headers,
				rows,
				children: ($$renderer) => {
					Toolbar($$renderer, {
						children: ($$renderer) => {
							ToolbarContent($$renderer, {
								children: ($$renderer) => {
									ToolbarSearch($$renderer, {
										persistent: true,
										shouldFilterRows: true,
										get filteredRowIds() {
											return filteredRowIds;
										},

										set filteredRowIds($$value) {
											filteredRowIds = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Export CSV`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
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
	});
}