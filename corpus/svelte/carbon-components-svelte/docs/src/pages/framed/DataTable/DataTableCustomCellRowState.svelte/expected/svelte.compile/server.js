import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function DataTableCustomCellRowState($$renderer) {
	let selectedRowIds = ["a", "c"];
	let expandedRowIds = ["b"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		DataTable($$renderer, {
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
				$$settled = false;
			},

			get expandedRowIds() {
				return expandedRowIds;
			},

			set expandedRowIds($$value) {
				expandedRowIds = $$value;
				$$settled = false;
			},

			$$slots: {
				cell: ($$renderer, { row, cell, rowSelected, rowExpanded }) => {
					{
						if (cell.key === "status") {
							$$renderer.push(`<!--[0--><span${$.attr_style(`color: ${rowSelected
								? '#0f62fe'
								: cell.value === 'Active' ? 'green' : 'gray'}`)}>${$.escape(cell.value)}
        ${$.escape(rowExpanded ? "(expanded)" : "")}</span>`);
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(cell.value)}`);
						}

						$$renderer.push(`<!--]-->`);
					}
				},

				expandedRow: ($$renderer, { row, rowSelected }) => {
					{
						$$renderer.push(`<div>Additional details for <strong>${$.escape(row.name)}</strong> ${$.escape(rowSelected ? "(Currently selected)" : "")}</div>`);
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