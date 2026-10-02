import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import Toolbar from "carbon-components-svelte/DataTable/Toolbar.svelte";
import ToolbarContent from "carbon-components-svelte/DataTable/ToolbarContent.svelte";
import ToolbarSearch from "carbon-components-svelte/DataTable/ToolbarSearch.svelte";

export default function DataTableHiddenColumnSearch_test($$anchor) {
	DataTable($$anchor, {
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "rule", value: "Rule", columnHidden: true }
		],
		rows: [
			{
				id: "a",
				name: "Load Balancer 3",
				protocol: "HTTP",
				rule: "Round robin"
			},

			{
				id: "b",
				name: "Load Balancer 1",
				protocol: "HTTP",
				rule: "DNS delegation"
			}
		],

		children: ($$anchor, $$slotProps) => {
			Toolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ToolbarSearch($$anchor, { shouldFilterRows: true });
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