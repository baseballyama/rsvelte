import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function DataTableVirtualFixture($$renderer) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "value", value: "Value" }
	];

	const rows = Array.from({ length: 80 }, (_, i) => ({ id: i, name: `Row ${i}`, value: `Value ${i}` }));

	$$renderer.push(`<div data-testid="data-table-virtual-root">`);

	DataTable($$renderer, {
		// Virtual + stickyHeader together can lock Chromium (tight afterUpdate/layout loop). Use the wrapper
		// scroll container (virtualScrollContainer) for e2e instead of sticky inner-container scrolling.
		headers,
		rows,
		stickyHeader: false,
		virtualize: {
			threshold: 10,
			maxVisibleRows: 8,
			itemHeight: 48,
			overscan: 2
		}
	});

	$$renderer.push(`<!----></div>`);
}