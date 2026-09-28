import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { getStyle, getCssName } from "../helpers/columnWidth";

export default function FooterCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const api = getContext("grid-store");
		let { cell, column, row, columnStyle } = $$props;
		let style = $.derived(() => getStyle(cell.width, cell.flexgrow, column.fixed, column.left, cell.right ?? column.right, cell.height));
		let css = $.derived(() => getCssName(column, cell, columnStyle));

		function getCell() {
			return Object.fromEntries(Object.entries(cell).filter(([key]) => key !== "cell"));
		}

		$$renderer.push(`<div${$.attr_class(`wx-cell ${$.stringify(css())} ${$.stringify(cell.css || '')}`, 'svelte-1p0egin', { 'wx-fixed-right': column.fixed && column.fixed.right })}${$.attr_style(style())}>`);

		if (!column.collapsed && !cell.collapsed) {
			$$renderer.push('<!--[0-->');

			if (cell.cell) {
				$$renderer.push('<!--[0-->');

				if (cell.cell) {
					$$renderer.push('<!--[-->');

					cell.cell($$renderer, {
						api,
						cell: getCell(),
						column,
						row,
						onaction: ({ action, data }) => api.exec(action, data)
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push(`<!--[-1--><div class="wx-text svelte-1p0egin">${$.escape(cell.text || "")}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}