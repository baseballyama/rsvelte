import * as $ from 'svelte/internal/server';
import { Button, DataTable, NumberInput, Stack } from "carbon-components-svelte";

export default function DataTableEditableCellsRefreshCells($$renderer) {
	let dataTable;

	let rows = [
		{ id: "a", item: "Widget", unitPrice: 10, qty: 3 },
		{ id: "b", item: "Gadget", unitPrice: 25, qty: 1 },
		{ id: "c", item: "Gizmo", unitPrice: 8, qty: 5 }
	];

	function snapshotQty() {
		return Object.fromEntries(rows.map((row) => [row.id, row.qty]));
	}

	let savedQtyById = snapshotQty();
	let hasEdits = false;

	function syncHasEdits() {
		hasEdits = rows.some((row) => row.qty !== savedQtyById[row.id]);
	}

	function updateTotals() {
		dataTable.refreshCells();
		savedQtyById = snapshotQty();
		hasEdits = false;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				Button($$renderer, {
					kind: 'secondary',
					size: 'sm',
					disabled: !hasEdits,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Update totals`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DataTable($$renderer, {
					headers: [
						{ key: "item", value: "Item" },
						{ key: "unitPrice", value: "Unit price" },
						{ key: "qty", value: "Quantity" },
						{
							key: "total",
							value: "Total",
							display: (_value, row) => `$${row.unitPrice * row.qty}`
						}
					],
					rows,
					$$slots: {
						cell: ($$renderer, { row, cell }) => {
							{
								if (cell.key === "qty") {
									$$renderer.push('<!--[0-->');

									NumberInput($$renderer, {
										size: 'sm',
										hideLabel: true,
										label: 'Quantity',
										min: 0,
										get value() {
											return row.qty;
										},

										set value($$value) {
											row.qty = $$value;
											$$settled = false;
										}
									});
								} else {
									$$renderer.push(`<!--[-1-->${$.escape(cell.display ? cell.display(cell.value, row) : cell.value)}`);
								}

								$$renderer.push(`<!--]-->`);
							}
						}
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}