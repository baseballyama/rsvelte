import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import HeaderCell from "./HeaderCell.svelte";
import FooterCell from "./FooterCell.svelte";
import { isCommunity } from "@svar-ui/grid-store";

export default function HeaderFooter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			deltaLeft,
			contentWidth,
			columns,
			type = "header",
			columnStyle,
			bodyHeight,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const api = getContext("grid-store");
		const { _sizes: sizes, split } = api.getReactiveState();
		let rowHeights = $.derived(() => $.store_get($$store_subs ??= {}, '$sizes', sizes)[`${type}RowHeights`]);

		let renderedHeader = $.derived(() => {
			let res = [];

			if (columns.length) {
				const rowsCount = columns[0][type].length;

				for (let ri = 0; ri < rowsCount; ri++) {
					let inSpan = 0;
					let left = 0;

					res.push([]);

					columns.forEach((col, ci) => {
						const cell = { ...col[type][ri] };

						if (!inSpan) {
							cell.left = left;
							res[ri].push(cell);
						}

						left += col.width;

						if (cell.colspan > 1) {
							inSpan = cell.colspan - 1;

							if (!isCommunity()) {
								if (col.right) {
									// if column is fixed on the right and have colspan we need to recalculate right position
									let right = col.right;

									for (let i = 1; i < cell.colspan; i++) {
										right -= columns[ci + i].width;
									}

									cell.right = right;
								}
							}
						} else if (inSpan) inSpan--;
					});
				}
			}

			return res;
		});

		const hasSplit = $.derived(() => $.store_get($$store_subs ??= {}, '$split', split)?.left || $.store_get($$store_subs ??= {}, '$split', split)?.right);

		function getColumn(id) {
			return columns.find((c) => c.id === id);
		}

		function isLast(cell, ind) {
			if (cell.rowspan) ind += cell.rowspan - 1;

			return ind === renderedHeader().length - 1;
		}

		function isSort(cell, ind, column) {
			if (!column.sort) return false;

			for (let i = renderedHeader().length - 1; i >= 0; i--) {
				const cell = column.header[i];

				if (!cell.filter && !cell._hidden) return ind === i;
			}

			return isLast(cell, ind);
		}

		$$renderer.push(`<div${$.attr_class(`wx-${type}`, 'svelte-b4gut6')}${$.attr_style(`padding-left:${$.stringify(deltaLeft)}px;width:${$.stringify(contentWidth)}px;`)} role="rowgroup"><!--[-->`);

		const each_array = $.ensure_array_like(renderedHeader());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let row = each_array[i];

			$$renderer.push(`<div${$.attr_class($.clsx(type === "header" ? "wx-h-row" : "wx-f-row"))}${$.attr_style(`height:${$.stringify(rowHeights()[i])}px; display: flex`)} role="row"><!--[-->`);

			const each_array_1 = $.ensure_array_like(row);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let cell = each_array_1[$$index];
				const column = getColumn(cell.id);

				if (type === "header") {
					$$renderer.push('<!--[0-->');

					HeaderCell($$renderer, $.spread_props([
						{
							cell,
							columnStyle,
							column,
							row: i,
							lastRow: isLast(cell, i),
							bodyHeight,
							sortRow: isSort(cell, i, column),
							hasSplit: hasSplit(),
							deltaLeft
						},
						restProps
					]));
				} else {
					$$renderer.push('<!--[-1-->');
					FooterCell($$renderer, { cell, columnStyle, column, row: i });
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}