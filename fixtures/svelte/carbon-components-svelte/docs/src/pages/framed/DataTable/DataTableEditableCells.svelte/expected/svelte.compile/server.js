import * as $ from 'svelte/internal/server';
import { DataTable, NumberInput } from "carbon-components-svelte";

export default function DataTableEditableCells($$renderer) {
	let dataTable;

	let rows = [
		{ id: "a", item: "Widget", unitPrice: 10, qty: 3 },
		{ id: "b", item: "Gadget", unitPrice: 25, qty: 1 },
		{ id: "c", item: "Gizmo", unitPrice: 8, qty: 5 }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}