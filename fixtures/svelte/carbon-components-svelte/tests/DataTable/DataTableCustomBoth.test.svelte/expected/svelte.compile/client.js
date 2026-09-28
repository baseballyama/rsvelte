import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

var root = $.from_html(`<h2>Custom Title</h2>`);
var root_1 = $.from_html(`<div>Custom Description</div>`);

export default function DataTableCustomBoth_test($$anchor) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" }
	];

	const rows = [{ id: "a", name: "Load Balancer 1", protocol: "HTTP" }];

	DataTable($$anchor, {
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},

		$$slots: {
			titleChildren: ($$anchor, $$slotProps) => {
				const props = $.derived(() => $$slotProps.props);
				var h2 = root();

				$.attribute_effect(h2, () => ({ slot: 'titleChildren', ...$.get(props) }));
				$.append($$anchor, h2);
			},

			descriptionChildren: ($$anchor, $$slotProps) => {
				const props = $.derived(() => $$slotProps.props);
				var div = root_1();

				$.attribute_effect(div, () => ({ slot: 'descriptionChildren', ...$.get(props) }));
				$.append($$anchor, div);
			}
		}
	});
}