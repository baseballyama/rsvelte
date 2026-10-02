import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";

var root = $.from_html(`<div>Custom Description</div>`);

export default function DataTableCustomDescription_test($$anchor) {
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
			descriptionChildren: ($$anchor, $$slotProps) => {
				const props = $.derived(() => $$slotProps.props);
				var div = root();

				$.attribute_effect(div, () => ({ slot: 'descriptionChildren', ...$.get(props) }));
				$.append($$anchor, div);
			}
		}
	});
}