import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

var root = $.from_html(`<p data-testid="expanded-detail"> </p>`);
var root_1 = $.from_html(`<p data-testid="prototype-id-detail"> </p>`);
var root_2 = $.from_html(`<p data-testid="expand-selectable-detail"> </p>`);
var root_3 = $.from_html(`<div data-testid="data-table-basic"><!></div> <div data-testid="data-table-sort"><!></div> <div data-testid="data-table-expand"><!></div> <div data-testid="data-table-prototype-id"><!></div> <div data-testid="data-table-expand-selectable"><!></div> <div data-testid="data-table-batch"><!></div> <div data-testid="data-table-select-range"><!></div>`, 1);

export default function DataTableFixture($$anchor) {
	const basicHeaders = [
		{ key: "name", value: "Name" },
		{ key: "value", value: "Value" }
	];

	const basicRows = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Row ${i}`, value: `Value ${i}` }));
	const sortHeaders = [{ key: "name", value: "Name" }, { key: "n", value: "N" }];

	const sortRows = [
		{ id: "s1", name: "Zebra", n: 1 },
		{ id: "s2", name: "Alpha", n: 2 },
		{ id: "s3", name: "Mike", n: 3 }
	];

	const expandHeaders = [{ key: "name", value: "Name" }];

	const expandRows = [
		{ id: "e1", name: "First" },
		{ id: "e2", name: "Second" },
		{ id: "e3", name: "Third" },
		{ id: "e4", name: "Fourth" }
	];

	const prototypeIdRows = [{ id: "toString", name: "Prototype ID" }];
	const batchHeaders = [{ key: "name", value: "Product" }];
	const batchRows = [{ id: "b1", name: "Item A" }, { id: "b2", name: "Item B" }];
	const selectRangeHeaders = [{ key: "name", value: "Product" }];

	const selectRangeRows = [
		{ id: "r1", name: "Item A" },
		{ id: "r2", name: "Item B" },
		{ id: "r3", name: "Item C" }
	];

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	DataTable(node, {
		get headers() {
			return basicHeaders;
		},

		get rows() {
			return basicRows;
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	DataTable(node_1, {
		sortable: true,
		get headers() {
			return sortHeaders;
		},

		get rows() {
			return sortRows;
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	DataTable(node_2, {
		expandable: true,
		get headers() {
			return expandHeaders;
		},

		get rows() {
			return expandRows;
		},

		$$slots: {
			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				var p = root();
				var text = $.only_child(p);

				$.template_effect(() => $.set_text(text, `Extra row: ${$.get(row).name ?? ''}`));
				$.append($$anchor, p);
			}
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	DataTable(node_3, {
		expandable: true,
		get headers() {
			return expandHeaders;
		},

		get rows() {
			return prototypeIdRows;
		},

		$$slots: {
			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				var p_1 = root_1();
				var text_1 = $.only_child(p_1);

				$.template_effect(() => $.set_text(text_1, `Extra row: ${$.get(row).name ?? ''}`));
				$.append($$anchor, p_1);
			}
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	DataTable(node_4, {
		expandable: true,
		batchSelection: true,
		get headers() {
			return expandHeaders;
		},

		get rows() {
			return expandRows;
		},

		$$slots: {
			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				var p_2 = root_2();
				var text_2 = $.only_child(p_2);

				$.template_effect(() => $.set_text(text_2, `Extra row: ${$.get(row).name ?? ''}`));
				$.append($$anchor, p_2);
			}
		}
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	DataTable(node_5, {
		batchSelection: true,
		get headers() {
			return batchHeaders;
		},

		get rows() {
			return batchRows;
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_6 = $.child(div_6);

	DataTable(node_6, {
		selectable: true,
		get headers() {
			return selectRangeHeaders;
		},

		get rows() {
			return selectRangeRows;
		}
	});

	$.reset(div_6);
	$.append($$anchor, fragment);
}