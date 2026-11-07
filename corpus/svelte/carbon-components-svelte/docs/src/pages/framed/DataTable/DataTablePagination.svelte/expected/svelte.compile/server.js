import * as $ from 'svelte/internal/server';
import { DataTable, Pagination } from "carbon-components-svelte";

export default function DataTablePagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rows = Array.from({ length: 10 }).map((_, i) => ({
			id: i,
			name: `Load Balancer ${i + 1}`,
			protocol: "HTTP",
			port: 3000 + i * 10,
			rule: i % 2 ? "Round robin" : "DNS delegation"
		}));

		let pageSize = 5;
		let page = 1;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DataTable($$renderer, {
				sortable: true,
				title: 'Load balancers',
				description: 'Your organization\'s active load balancers.',
				headers: [
					{ key: "name", value: "Name" },
					{ key: "protocol", value: "Protocol" },
					{ key: "port", value: "Port" },
					{ key: "rule", value: "Rule" }
				],
				pageSize,
				page,
				rows
			});

			$$renderer.push(`<!----> `);

			Pagination($$renderer, {
				totalItems: rows.length,
				pageSizeInputDisabled: true,
				get pageSize() {
					return pageSize;
				},

				set pageSize($$value) {
					pageSize = $$value;
					$$settled = false;
				},

				get page() {
					return page;
				},

				set page($$value) {
					page = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}