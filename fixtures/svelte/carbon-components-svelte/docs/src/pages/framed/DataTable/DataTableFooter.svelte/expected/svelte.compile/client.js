import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

export default function DataTableFooter($$anchor) {
	const rows = [
		{
			id: "a",
			name: "Load Balancer 3",
			protocol: "HTTP",
			requests: 12_480
		},

		{
			id: "b",
			name: "Load Balancer 1",
			protocol: "HTTPS",
			requests: 8_112
		},

		{
			id: "c",
			name: "Load Balancer 2",
			protocol: "HTTP",
			requests: 3_907
		},

		{
			id: "d",
			name: "Load Balancer 6",
			protocol: "HTTPS",
			requests: 21_650
		}
	];

	const totalRequests = rows.reduce((total, row) => total + row.requests, 0);

	DataTable($$anchor, {
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "requests", value: "Requests" }
		],

		get rows() {
			return rows;
		},

		$$slots: {
			footerCell: ($$anchor, $$slotProps) => {
				const header = $.derived(() => $$slotProps.header);
				const index = $.derived(() => $$slotProps.index);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var text = $.text();

						$.template_effect(($0) => $.set_text(text, $0), [() => totalRequests.toLocaleString()]);
						$.append($$anchor, text);
					};

					var consequent_1 = ($$anchor) => {
						var text_1 = $.text('Total');

						$.append($$anchor, text_1);
					};

					$.if(node, ($$render) => {
						if ($.get(header).key === "requests") $$render(consequent); else if ($.get(index) === 0) $$render(consequent_1, 1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});
}