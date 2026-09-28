import * as $ from 'svelte/internal/server';
import { DataTable, TextInput, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

export default function DataTableFilterMode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rows = Array.from({ length: 10 }).map((_, i) => ({
			id: i,
			name: `Load Balancer ${i + 1}`,
			protocol: "HTTP",
			port: 3000 + i * 10,
			rule: i % 2 ? "Round robin" : "DNS delegation",
			note: ""
		}));

		DataTable($$renderer, {
			filterMode: 'hide',
			headers: [
				{ key: "name", value: "Name" },
				{ key: "protocol", value: "Protocol" },
				{ key: "port", value: "Port" },
				{ key: "note", value: "Note" }
			],
			rows,
			children: ($$renderer) => {
				Toolbar($$renderer, {
					children: ($$renderer) => {
						ToolbarContent($$renderer, {
							children: ($$renderer) => {
								ToolbarSearch($$renderer, { persistent: true, shouldFilterRows: true });
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},

			$$slots: {
				default: true,
				cell: ($$renderer, { cell, row }) => {
					{
						if (cell.key === "note") {
							$$renderer.push('<!--[0-->');

							TextInput($$renderer, {
								size: 'sm',
								labelText: `Note for ${$.stringify(row.name)}`,
								hideLabel: true,
								placeholder: 'Type a note, then filter'
							});
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(cell.value)}`);
						}

						$$renderer.push(`<!--]-->`);
					}
				}
			}
		});
	});
}