import * as $ from 'svelte/internal/server';
import { getContext, untrack } from "svelte";
import { getStyle } from "../helpers/columnWidth";
import { getRenderValue } from "@svar-ui/grid-store";
import { setID } from "@svar-ui/lib-dom";

export default function Cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			row,
			column,
			cellStyle = null,
			columnStyle = null,
			children,
			focusable
		} = $$props;

		let style = $.derived(() => getStyle(column.width, column.flexgrow, column.fixed, column.left, column.right));
		let css = $.derived(() => buildCellCss(columnStyle, cellStyle));
		const api = getContext("grid-store");
		const { focusCell, search, reorder } = api.getReactiveState();
		const shouldHighlight = $.derived(() => $.store_get($$store_subs ??= {}, '$search', search)?.rows[row.id] && $.store_get($$store_subs ??= {}, '$search', search).rows[row.id][column.id]);

		const isDraggable = $.derived(() => typeof column.draggable === "function"
			? column.draggable(row, column) !== false
			: column.draggable);

		let cellEl;

		function buildCellCss(columnStyle, cellStyle) {
			let css = "wx-cell";

			css += column.fixed
				? " " + (column.fixed === -1 ? "wx-shadow" : "wx-fixed")
				: "";

			css += columnStyle ? " " + columnStyle(column) : "";
			css += cellStyle ? " " + cellStyle(row, column) : "";
			css += column.treetoggle ? " wx-tree-cell" : "";

			return css;
		}

		function toggleFocusAction() {
			if (focusable && !$.store_get($$store_subs ??= {}, '$focusCell', focusCell)) {
				api.exec("focus-cell", { row: row.id, column: column.id, eventSource: "focus" });
			}
		}

		function highlightText(text) {
			const regex = new RegExp(`(${$.store_get($$store_subs ??= {}, '$search', search).value.trim()})`, "gi");
			const parts = String(text).split(regex);

			return parts.map((text) => ({ text, highlight: regex.test(text) }));
		}

		$$renderer.push(`<div${$.attr_class($.clsx(css()), 'svelte-ys2x3c', {
			'wx-shadow': column.fixed && column.fixed.left === -1 || column.fixed.right === -1,
			'wx-fixed-right': column.fixed && column.fixed.right
		})}${$.attr_style(style())}${$.attr('data-row-id', setID(row.id))}${$.attr('data-col-id', setID(column.id))}${$.attr('tabindex', focusable ? "0" : "-1")} role="gridcell"${$.attr('aria-colindex', column._colindex)}${$.attr('aria-readonly', !column.editor ? true : undefined)}>`);

		if ($.store_get($$store_subs ??= {}, '$reorder', reorder) && column.draggable) {
			$$renderer.push('<!--[0-->');

			if (isDraggable()) {
				$$renderer.push(`<!--[0--><i draggable-data="true" class="wx-draggable wxi-drag svelte-ys2x3c"></i>`);
			} else {
				$$renderer.push(`<!--[-1--><i class="wx-draggable-stub svelte-ys2x3c"></i>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (column.treetoggle) {
			$$renderer.push(`<!--[0--><span${$.attr_style(`margin-left:${$.stringify(row.$level * 28)}px;`)}></span> `);

			if (row.$count) {
				$$renderer.push(`<!--[0--><i data-action="toggle-row"${$.attr_class(`wx-table-tree-toggle wxi-menu-${row.open !== false ? 'down' : 'right'}`, 'svelte-ys2x3c')}></i>`);
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

				column.cell($$renderer, {
					api,
					row,
					column,
					onaction: ({ action, data }) => api.exec(action, data)
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else if (shouldHighlight()) {
			$$renderer.push(`<!--[2--><span><!--[-->`);

			const each_array = $.ensure_array_like(highlightText(getRenderValue(row, column)));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { highlight, text } = each_array[$$index];

				if (highlight) {
					$$renderer.push(`<!--[0--><mark class="wx-search svelte-ys2x3c">${$.escape(text)}</mark>`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(text)}`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></span>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(getRenderValue(row, column))}`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}