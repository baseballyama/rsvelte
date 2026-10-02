import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable, OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function DataTableAppendColumns($$anchor) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "port", value: "Port" },
		{ key: "rule", value: "Rule" },
		{ key: "overflow", empty: true, width: "72px" }
	];

	const rows = [
		{
			id: "a",
			name: "Load Balancer 3",
			port: 3000,
			rule: "Round robin"
		},

		{
			id: "b",
			name: "Load Balancer 1",
			port: 443,
			rule: "Round robin"
		},

		{
			id: "c",
			name: "Load Balancer 2",
			port: 80,
			rule: "DNS delegation"
		},

		{
			id: "d",
			name: "Load Balancer 6",
			port: 3000,
			rule: "Round robin"
		},

		{
			id: "e",
			name: "Load Balancer 4",
			port: 443,
			rule: "Round robin"
		},

		{
			id: "f",
			name: "Load Balancer 5",
			port: 80,
			rule: "DNS delegation"
		}
	];

	DataTable($$anchor, {
		sortable: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},

		$$slots: {
			cell: ($$anchor, $$slotProps) => {
				const cell = $.derived(() => $$slotProps.cell);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						OverflowMenu($$anchor, {
							portalMenu: true,
							flipped: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_1 = $.first_child(fragment_3);

								OverflowMenuItem(node_1, { text: 'Restart' });

								var node_2 = $.sibling(node_1, 2);

								OverflowMenuItem(node_2, {
									href: 'https://cloud.ibm.com/docs/loadbalancer-service',
									text: 'API documentation'
								});

								var node_3 = $.sibling(node_2, 2);

								OverflowMenuItem(node_3, { danger: true, text: 'Stop' });
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(cell).value));
						$.append($$anchor, text);
					};

					$.if(node, ($$render) => {
						if ($.get(cell).key === "overflow") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});
}