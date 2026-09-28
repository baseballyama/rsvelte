import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import FilterRowsCaller from "./FilterRowsCaller.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DataTableRefilterOnRowsChange_test($$anchor, $$props) {
	$.push($$props, true);

	const initialRows = Array.from({ length: 10 }).map((_, i) => ({
		id: i,
		name: `Load Balancer ${i + 1}`,
		rule: i % 2 ? "Round robin" : "DNS delegation"
	}));

	const toggledRows = Array.from({ length: 4 }).map((_, i) => ({
		id: i,
		name: `Server instance ${i + 1}`,
		rule: i % 2 ? "Round!" : "DNS!"
	}));

	let rows = initialRows;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => rows = toggledRows },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle rows');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	DataTable(node_1, {
		headers: [
			{ key: "name", value: "Name" },
			{ key: "rule", value: "Rule" }
		],

		get rows() {
			return rows;
		},

		children: ($$anchor, $$slotProps) => {
			FilterRowsCaller($$anchor, { searchValue: 'round' });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}