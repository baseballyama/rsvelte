import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { getPrintCellStyle, getPrintFilterValue } from "@svar-ui/grid-store";

export default function HeaderFooter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { columns, type, columnStyle } = $$props;
		const api = getContext("grid-store");
		const { filterValues, _columns, _sizes: sizes } = api.getState();

		function getColumnCss(column) {
			return columnStyle ? " " + columnStyle(column) : "";
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(columns);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let row = each_array[i];

			$$renderer.push(`<tr><!--[-->`);

			const each_array_1 = $.ensure_array_like(row);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let cell = each_array_1[$$index];
				const column = _columns.find((c) => c.id === cell.id);

				$$renderer.push(`<th${$.attr_style(getPrintCellStyle(cell, sizes.columnWidth))}${$.attr_class(`wx-print-cell-${$.stringify(type)} ${$.stringify(getColumnCss(column))}`, void 0, {
					'wx-print-cell-filter': cell.filter,
					'wx-vertical': cell.vertical
				})}${$.attr('rowspan', cell.rowspan)}${$.attr('colspan', cell.colspan)}>`);

				if (cell.cell) {
					$$renderer.push('<!--[0-->');

					if (cell.cell) {
						$$renderer.push('<!--[-->');

						cell.cell($$renderer, {
							api,
							cell: Object.fromEntries(Object.entries(cell).filter(([key]) => key !== "cell")),
							column,
							row: i
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else if (cell.filter) {
					$$renderer.push(`<!--[1--><div class="wx-print-filter">${$.escape(getPrintFilterValue(filterValues, _columns, cell))}</div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="wx-text">${$.escape(cell.text ?? "")}</div>`);
				}

				$$renderer.push(`<!--]--></th>`);
			}

			$$renderer.push(`<!--]--></tr>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}