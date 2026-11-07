import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable, TextInput, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

export default function DataTableFilterMode($$anchor, $$props) {
	$.push($$props, true);

	let rows = Array.from({ length: 10 }).map((_, i) => ({
		id: i,
		name: `Load Balancer ${i + 1}`,
		protocol: "HTTP",
		port: 3000 + i * 10,
		rule: i % 2 ? "Round robin" : "DNS delegation",
		note: ""
	}));

	DataTable($$anchor, {
		filterMode: 'hide',
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "port", value: "Port" },
			{ key: "note", value: "Note" }
		],

		get rows() {
			return rows;
		},

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ToolbarSearch($$anchor, { persistent: true, shouldFilterRows: true });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			cell: ($$anchor, $$slotProps) => {
				const cell = $.derived(() => $$slotProps.cell);
				const row = $.derived(() => $$slotProps.row);
				var fragment_4 = $.comment();
				var node = $.first_child(fragment_4);

				{
					var consequent = ($$anchor) => {
						TextInput($$anchor, {
							size: 'sm',
							get labelText() {
								return `Note for ${$.get(row).name ?? ''}`;
							},
							hideLabel: true,
							placeholder: 'Type a note, then filter'
						});
					};

					var alternate = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(cell).value));
						$.append($$anchor, text);
					};

					$.if(node, ($$render) => {
						if ($.get(cell).key === "note") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.pop();
}