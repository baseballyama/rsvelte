import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div>Additional details for <strong> </strong> </div>`);

export default function DataTableCustomCellRowState($$anchor) {
	let selectedRowIds = ["a", "c"];
	let expandedRowIds = ["b"];

	DataTable($$anchor, {
		selectable: true,
		expandable: true,
		headers: [
			{ key: "name", value: "Name" },
			{ key: "status", value: "Status" },
			{ key: "port", value: "Port" }
		],
		rows: [
			{
				id: "a",
				name: "Load Balancer 1",
				status: "Active",
				port: 3000
			},

			{
				id: "b",
				name: "Load Balancer 2",
				status: "Active",
				port: 443
			},

			{
				id: "c",
				name: "Load Balancer 3",
				status: "Inactive",
				port: 80
			}
		],

		get selectedRowIds() {
			return selectedRowIds;
		},

		set selectedRowIds($$value) {
			selectedRowIds = $$value;
		},

		get expandedRowIds() {
			return expandedRowIds;
		},

		set expandedRowIds($$value) {
			expandedRowIds = $$value;
		},

		$$slots: {
			cell: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				const cell = $.derived(() => $$slotProps.cell);
				const rowSelected = $.derived(() => $$slotProps.rowSelected);
				const rowExpanded = $.derived(() => $$slotProps.rowExpanded);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var span = root();
						var text = $.only_child(span);

						$.template_effect(() => {
							$.set_style(span, `color: ${$.get(rowSelected)
								? '#0f62fe'
								: $.get(cell).value === 'Active' ? 'green' : 'gray'}`);

							$.set_text(text, `${$.get(cell).value ?? ''}
        ${$.get(rowExpanded) ? "(expanded)" : ""}`);
						});

						$.append($$anchor, span);
					};

					var alternate = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(cell).value));
						$.append($$anchor, text_1);
					};

					$.if(node, ($$render) => {
						if ($.get(cell).key === "status") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},

			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				const rowSelected = $.derived(() => $$slotProps.rowSelected);
				var div = root_1();
				var strong = $.sibling($.child(div));
				var text_2 = $.only_child(strong, true);
				var text_3 = $.sibling(strong);

				$.reset(div);

				$.template_effect(() => {
					$.set_text(text_2, $.get(row).name);
					$.set_text(text_3, ` ${$.get(rowSelected) ? "(Currently selected)" : ""}`);
				});

				$.append($$anchor, div);
			}
		}
	});
}