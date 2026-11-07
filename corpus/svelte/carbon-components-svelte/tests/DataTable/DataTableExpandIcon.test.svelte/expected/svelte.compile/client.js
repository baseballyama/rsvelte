import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";

var root = $.from_html(`<pre> </pre>`);

export default function DataTableExpandIcon_test($$anchor) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" }
	];

	const rows = [
		{ id: "a", name: "Load Balancer 1", protocol: "HTTP" },
		{ id: "b", name: "Load Balancer 2", protocol: "HTTPS" }
	];

	DataTable($$anchor, {
		expandable: true,
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},

		$$slots: {
			expandIcon: ($$anchor, $$slotProps) => {
				const expanded = $.derived(() => $$slotProps.expanded);
				const props = $.derived(() => $$slotProps.props);

				ChevronRight($$anchor, $.spread_props(() => $.get(props), {
					'data-testid': 'custom-expand-icon',
					get 'data-expanded'() {
						return $.get(expanded);
					}
				}));
			},

			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				var pre = root();
				var text = $.only_child(pre, true);

				$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($.get(row), null, 2)]);
				$.append($$anchor, pre);
			}
		}
	});
}