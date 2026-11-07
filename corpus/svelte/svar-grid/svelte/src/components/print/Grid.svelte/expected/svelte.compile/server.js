import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

import {
	getRenderValue,
	getHeaderFooterPrintColumns,
	getPrintCellStyle
} from "@svar-ui/grid-store";

import HeaderFooter from "./HeaderFooter.svelte";

export default function Grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			columns,
			rowStyle,
			columnStyle,
			cellStyle,
			header,
			footer,
			reorder
		} = $$props;

		const api = getContext("grid-store");
		const { flatData: data, _sizes: sizes } = api.getState();
		const headerColumns = header && getHeaderFooterPrintColumns(columns, "header", sizes.headerRowHeights);
		const footerColumns = footer && getHeaderFooterPrintColumns(columns, "footer", sizes.footerRowHeights);

		function buildCellCss(row, column) {
			let css = "";

			css += columnStyle ? " " + columnStyle(column) : "";
			css += cellStyle ? " " + cellStyle(row, column) : "";

			return css;
		}

		function isDraggableIcon(row, column) {
			return typeof column.draggable === "function"
				? column.draggable(row, column) !== false
				: column.draggable;
		}

		$$renderer.push(`<table${$.attr_class('wx-print-grid svelte-1adch4k', void 0, { 'wx-flex-columns': columns.some((c) => c.flexgrow) })}>`);

		if (header) {
			$$renderer.push(`<!--[0--><thead>`);
			HeaderFooter($$renderer, { columns: headerColumns, type: "header", columnStyle });
			$$renderer.push(`<!----></thead>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><tbody><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let row = each_array[$$index_1];

			$$renderer.push(`<tr${$.attr_class("wx-row" + (rowStyle ? " " + rowStyle(row) : ""), 'svelte-1adch4k')}${$.attr_style(`height:${row.rowHeight || sizes.rowHeight}px;`)}><!--[-->`);

			const each_array_1 = $.ensure_array_like(columns);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let column = each_array_1[$$index];

				if (!column.collapsed) {
					$$renderer.push(`<!--[0--><td${$.attr_class(`wx-print-cell wx-cell ${$.stringify(buildCellCss(row, column))}`, 'svelte-1adch4k')}${$.attr_style(getPrintCellStyle(column, sizes.columnWidth))}>`);

					if (reorder && column.draggable) {
						$$renderer.push(`<!--[0--><span class="wx-print-draggable">`);

						if (isDraggableIcon(row, column)) {
							$$renderer.push(`<!--[0--><i class="wxi-drag"></i>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (column.treetoggle) {
						$$renderer.push(`<!--[0--><span${$.attr_style(`margin-left:${$.stringify(row.$level * 28)}px;`)}></span> `);

						if (row.$count) {
							$$renderer.push(`<!--[0--><i${$.attr_class(`wx-print-grid-tree-toggle wxi-menu-${row.open !== false ? 'down' : 'right'}`)}></i>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (column.cell) {
						$$renderer.push('<!--[0-->');

						if (column.cell) {
							$$renderer.push('<!--[-->');
							column.cell($$renderer, { api, row, column });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push(`<!--[-1--><span>${$.escape(getRenderValue(row, column))}</span>`);
					}

					$$renderer.push(`<!--]--></td>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></tr>`);
		}

		$$renderer.push(`<!--]--></tbody>`);

		if (footer) {
			$$renderer.push(`<!--[0--><tfoot>`);
			HeaderFooter($$renderer, { columns: footerColumns, type: "footer", columnStyle });
			$$renderer.push(`<!----></tfoot>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></table>`);
	});
}