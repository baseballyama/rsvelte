import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="data-table-virtual-root"><!></div>`);

export default function DataTableVirtualFixture($$anchor) {
	const headers = [
		{ key: "name", value: "Name" },
		{ key: "value", value: "Value" }
	];

	const rows = Array.from({ length: 80 }, (_, i) => ({ id: i, name: `Row ${i}`, value: `Value ${i}` }));

	var // Virtual + stickyHeader together can lock Chromium (tight afterUpdate/layout loop). Use the wrapper
	// scroll container (virtualScrollContainer) for e2e instead of sticky inner-container scrolling.
	div = root();

	var node = $.child(div);

	DataTable(node, {
		get headers() {
			return headers;
		},

		get rows() {
			return rows;
		},
		stickyHeader: false,
		virtualize: {
			threshold: 10,
			maxVisibleRows: 8,
			itemHeight: 48,
			overscan: 2
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}