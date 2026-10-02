import * as $ from 'svelte/internal/server';
import DataTableSkeleton from "carbon-components-svelte/DataTable/DataTableSkeleton.svelte";

export default function DataTableSkeleton_test($$renderer) {
	DataTableSkeleton($$renderer, {
		size: 'tall',
		showHeader: // Regression test for https://github.com/carbon-design-system/carbon-components-svelte/issues/2869
		// DataTableSkeletonProps should not require `key` / `empty` from DataTableHeader.
		false,
		showToolbar: false,
		rows: 10
	});

	$$renderer.push(`<!----> `);
	DataTableSkeleton($$renderer, {});
	$$renderer.push(`<!----> `);
	DataTableSkeleton($$renderer, { headers: ["Name", "Protocol", "Port", "Rule"], rows: 10 });
	$$renderer.push(`<!----> `);

	DataTableSkeleton($$renderer, {
		headers: [
			{ value: "Name" },
			{ value: "Protocol" },
			{ value: "Port" },
			{ value: "Rule" }
		],
		rows: 10
	});

	$$renderer.push(`<!----> `);

	DataTableSkeleton($$renderer, {
		headers: [
			{ value: "Name" },
			{ value: "Protocol" },
			{ value: "Port" },
			{ value: "Rule" },
			{ empty: true }
		],
		rows: 10
	});

	$$renderer.push(`<!----> `);
	DataTableSkeleton($$renderer, { showHeader: false, showToolbar: false });
	$$renderer.push(`<!----> `);
	DataTableSkeleton($$renderer, { showHeader: false, showToolbar: false, size: 'tall' });
	$$renderer.push(`<!----> `);
	DataTableSkeleton($$renderer, { showHeader: false, showToolbar: false, size: 'short' });
	$$renderer.push(`<!----> `);
	DataTableSkeleton($$renderer, { showHeader: false, showToolbar: false, size: 'compact' });
	$$renderer.push(`<!---->`);
}