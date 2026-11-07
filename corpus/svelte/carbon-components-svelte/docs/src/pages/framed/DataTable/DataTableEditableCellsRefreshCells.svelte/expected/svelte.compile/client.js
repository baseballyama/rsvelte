import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DataTable, NumberInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DataTableEditableCellsRefreshCells($$anchor) {
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

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => !hasEdits);

				Button(node, {
					kind: 'secondary',
					size: 'sm',
					get disabled() {
						return $.get($0);
					},
					$$events: { click: updateTotals },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Update totals');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			var node_1 = $.sibling(node, 2);

			$.bind_this(
				DataTable(node_1, {
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
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

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
										$$events: { input: syncHasEdits }
									});
								};

								var alternate = ($$anchor) => {
									var text_1 = $.text();

									$.template_effect(($0) => $.set_text(text_1, $0), [
										() => $.get(cell).display
											? $.get(cell).display($.get(cell).value, $.get(row))
											: $.get(cell).value
									]);

									$.append($$anchor, text_1);
								};

								$.if(node_2, ($$render) => {
									if ($.get(cell).key === "qty") $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_2);
						}
					}
				}),
				($$value) => dataTable = $$value,
				() => dataTable
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}