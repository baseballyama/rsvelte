import * as $ from 'svelte/internal/server';

import {
	DataTable,
	Toolbar,
	ToolbarContent,
	ToolbarMenu,
	ToolbarMenuItem
} from "carbon-components-svelte";

export default function DataTableColumnVisibility($$renderer) {
	let headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" },
		{ key: "port", value: "Port" },
		{ key: "rule", value: "Rule", columnHidden: true }
	];

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

	function toggleColumn(key) {
		headers = headers.map((header) => header.key === key
			? { ...header, columnHidden: !header.columnHidden }
			: header);
	}

	DataTable($$renderer, {
		title: 'Load balancers',
		description: 'Your organization\'s active load balancers.',
		headers,
		rows,
		children: ($$renderer) => {
			Toolbar($$renderer, {
				children: ($$renderer) => {
					ToolbarContent($$renderer, {
						children: ($$renderer) => {
							ToolbarMenu($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(headers);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let header = each_array[$$index];

										ToolbarMenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(header.columnHidden ? "Show" : "Hide")}
            ${$.escape(header.value)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
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