import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	DataTable,
	Toolbar,
	ToolbarContent,
	ToolbarMenu,
	ToolbarMenuItem
} from "carbon-components-svelte";

export default function DataTableColumnVisibility($$anchor) {
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

	DataTable($$anchor, {
		title: 'Load balancers',
		description: 'Your organization\'s active load balancers.',
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
							ToolbarMenu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node = $.first_child(fragment_4);

									$.each(node, 17, () => headers, (header) => header.key, ($$anchor, header) => {
										ToolbarMenuItem($$anchor, {
											$$events: { click: () => toggleColumn($.get(header).key) },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, `${$.get(header).columnHidden ? "Show" : "Hide"}
            ${$.get(header).value ?? ''}`));

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
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