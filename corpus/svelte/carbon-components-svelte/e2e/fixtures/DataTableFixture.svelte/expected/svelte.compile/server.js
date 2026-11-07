import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function DataTableFixture($$renderer) {
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

	$$renderer.push(`<div data-testid="data-table-basic">`);
	DataTable($$renderer, { headers: basicHeaders, rows: basicRows });
	$$renderer.push(`<!----></div> <div data-testid="data-table-sort">`);
	DataTable($$renderer, { sortable: true, headers: sortHeaders, rows: sortRows });
	$$renderer.push(`<!----></div> <div data-testid="data-table-expand">`);

	DataTable($$renderer, {
		expandable: true,
		headers: expandHeaders,
		rows: expandRows,
		$$slots: {
			expandedRow: ($$renderer, { row }) => {
				{
					$$renderer.push(`<p data-testid="expanded-detail">Extra row: ${$.escape(row.name)}</p>`);
				}
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="data-table-prototype-id">`);

	DataTable($$renderer, {
		expandable: true,
		headers: expandHeaders,
		rows: prototypeIdRows,
		$$slots: {
			expandedRow: ($$renderer, { row }) => {
				{
					$$renderer.push(`<p data-testid="prototype-id-detail">Extra row: ${$.escape(row.name)}</p>`);
				}
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="data-table-expand-selectable">`);

	DataTable($$renderer, {
		expandable: true,
		batchSelection: true,
		headers: expandHeaders,
		rows: expandRows,
		$$slots: {
			expandedRow: ($$renderer, { row }) => {
				{
					$$renderer.push(`<p data-testid="expand-selectable-detail">Extra row: ${$.escape(row.name)}</p>`);
				}
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="data-table-batch">`);
	DataTable($$renderer, { batchSelection: true, headers: batchHeaders, rows: batchRows });
	$$renderer.push(`<!----></div> <div data-testid="data-table-select-range">`);

	DataTable($$renderer, {
		selectable: true,
		headers: selectRangeHeaders,
		rows: selectRangeRows
	});

	$$renderer.push(`<!----></div>`);
}