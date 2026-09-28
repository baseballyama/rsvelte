import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable, NumberInput } from "carbon-components-svelte";

export default function DataTableEditableCells($$anchor) {
	let dataTable;

	let rows = [
		{ id: "a", item: "Widget", unitPrice: 10, qty: 3 },
		{ id: "b", item: "Gadget", unitPrice: 25, qty: 1 },
		{ id: "c", item: "Gizmo", unitPrice: 8, qty: 5 }
	];

	$.bind_this(
		DataTable($$anchor, {
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

			get rows() {
				return rows;
			},

			$$slots: {
				cell: ($$anchor, $$slotProps) => {
					const row = $.derived(() => $$slotProps.row);
					const cell = $.derived(() => $$slotProps.cell);
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							NumberInput($$anchor, {
								size: 'sm',
								hideLabel: true,
								label: 'Quantity',
								min: 0,
								get value() {
									return $.get(row).qty;
								},

								set value($$value) {
									$.get(row).qty = $$value;
								},

								$$events: {
									input: () => {
										// Rebuild cells so the Total column picks up the new qty.
										dataTable.refreshRow($.get(row).id);
									}
								}
							});
						};

						var alternate = ($$anchor) => {
							var text = $.text();

							$.template_effect(($0) => $.set_text(text, $0), [
								() => $.get(cell).display
									? $.get(cell).display($.get(cell).value, $.get(row))
									: $.get(cell).value
							]);

							$.append($$anchor, text);
						};

						$.if(node, ($$render) => {
							if ($.get(cell).key === "qty") $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				}
			}
		}),
		($$value) => dataTable = $$value,
		() => dataTable
	);
}