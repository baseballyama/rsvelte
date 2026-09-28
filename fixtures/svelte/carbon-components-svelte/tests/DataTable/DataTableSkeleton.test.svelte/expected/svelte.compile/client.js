import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTableSkeleton from "carbon-components-svelte/DataTable/DataTableSkeleton.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function DataTableSkeleton_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	// Regression test for https://github.com/carbon-design-system/carbon-components-svelte/issues/2869
	// DataTableSkeletonProps should not require `key` / `empty` from DataTableHeader.
	DataTableSkeleton(node, {
		size: 'tall',
		showHeader: false,
		showToolbar: false,
		rows: 10
	});

	var node_1 = $.sibling(node, 2);

	DataTableSkeleton(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	DataTableSkeleton(node_2, { headers: ["Name", "Protocol", "Port", "Rule"], rows: 10 });

	var node_3 = $.sibling(node_2, 2);

	DataTableSkeleton(node_3, {
		headers: [
			{ value: "Name" },
			{ value: "Protocol" },
			{ value: "Port" },
			{ value: "Rule" }
		],
		rows: 10
	});

	var node_4 = $.sibling(node_3, 2);

	DataTableSkeleton(node_4, {
		headers: [
			{ value: "Name" },
			{ value: "Protocol" },
			{ value: "Port" },
			{ value: "Rule" },
			{ empty: true }
		],
		rows: 10
	});

	var node_5 = $.sibling(node_4, 2);

	DataTableSkeleton(node_5, { showHeader: false, showToolbar: false });

	var node_6 = $.sibling(node_5, 2);

	DataTableSkeleton(node_6, { showHeader: false, showToolbar: false, size: 'tall' });

	var node_7 = $.sibling(node_6, 2);

	DataTableSkeleton(node_7, { showHeader: false, showToolbar: false, size: 'short' });

	var node_8 = $.sibling(node_7, 2);

	DataTableSkeleton(node_8, { showHeader: false, showToolbar: false, size: 'compact' });
	$.append($$anchor, fragment);
}