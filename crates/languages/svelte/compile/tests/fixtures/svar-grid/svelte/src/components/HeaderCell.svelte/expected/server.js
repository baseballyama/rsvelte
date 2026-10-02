import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { resize } from "../helpers/actions/resize";
import { getCssName, getStyle } from "../helpers/columnWidth";
import Filter from "./inlineFilters/Filter.svelte";
import { setID } from "@svar-ui/lib-dom";

export default function HeaderCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			cell,
			column,
			row,
			lastRow,
			sortRow,
			columnStyle,
			bodyHeight,
			hasSplit,
			deltaLeft,
			leftColumnsWidth,
			rightColumnsWidth,
			viewportWidth
		} = $$props;

		const api = getContext("grid-store");
		const { sortMarks, scrollLeft } = api.getReactiveState();
		let start;
		let sortMark = $.derived(() => $.store_get($$store_subs ??= {}, '$sortMarks', sortMarks)[column.id]);

		function down(node) {
			start = cell.flexgrow ? node.parentNode.clientWidth : cell.width;
		}

		function move(dx) {
			resizeColumn(dx, true);
		}

		function up(dx) {
			resizeColumn(dx, false);
		}

		function resizeColumn(dx, inProgress) {
			api.exec("resize-column", { id: cell.id, width: Math.max(1, start + dx), inProgress });
		}

		function sort(ev) {
			if (!column.sort || cell.filter) return;

			if (sortMark()?.order) {
				sortMark().order = sortMark()?.order === "asc" ? "desc" : "asc";
			}

			api.exec("sort-rows", {
				key: cell.id,
				add: ev.ctrlKey || ev.metaKey,
				order: sortMark()?.order
			});
		}

		function collapse(ev) {
			if (ev) ev.stopPropagation();

			api.exec("collapse-column", { id: cell.id, row });
		}

		function toggleCollapseColumn(ev) {
			if (ev.key === "Enter") collapse();
		}

		function toggleSortColumn(ev) {
			if (ev.key === "Enter" && !cell.filter) sort(ev);
		}

		let isCollapsed = $.derived(() => cell.collapsed && column?.collapsed);
		const isCenterColumn = $.derived(() => hasSplit && (column?.fixed === 0 || !column?.fixed));

		const centerBounds = $.derived(() => {
			if (!hasSplit || !isCenterColumn()) return { visible: false, clip: "" };

			const width = cell.width || column.width;
			const x = deltaLeft + cell.left - $.store_get($$store_subs ??= {}, '$scrollLeft', scrollLeft);
			const centerRight = viewportWidth - rightColumnsWidth;

			if (x + width <= leftColumnsWidth || x >= centerRight) {
				return { visible: false, clip: "" };
			}

			const hiddenLeft = Math.max(0, leftColumnsWidth - x);
			const hiddenRight = Math.max(0, x + width - centerRight);

			return {
				visible: true,
				clip: hiddenLeft || hiddenRight
					? `clip-path:inset(0px ${hiddenRight}px 0px ${hiddenLeft}px);`
					: ""
			};
		});

		// 1) no split: all collapsed columns render with content
		// 2) split + fixed: fixed columns render with content
		// 3) split + center: only when visible in center area (clip if partially hidden)
		const showCollapsedContent = $.derived(() => !hasSplit || !isCenterColumn() || centerBounds().visible);

		const collapsedClip = $.derived(() => hasSplit && isCenterColumn() && centerBounds().visible ? centerBounds().clip : "");
		let collapsedTextStyle = $.derived(() => showCollapsedContent() ? `top:-${bodyHeight / 2}px;position:absolute;` : "");
		let style = $.derived(() => getStyle(cell.width, cell.flexgrow, column.fixed, column.left, cell.right ?? column.right, cell.height + (isCollapsed() && showCollapsedContent() ? bodyHeight : 0)) + collapsedClip());
		const css = $.derived(() => getCssName(column, cell, columnStyle));

		function getCell() {
			return Object.fromEntries(Object.entries(cell).filter(([key]) => key !== "cell"));
		}

		if (isCollapsed()) {
			$$renderer.push('<!--[0-->');

			if (showCollapsedContent()) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`wx-cell ${$.stringify(css())} ${$.stringify(cell.css || '')} wx-collapsed`, 'svelte-1t83xbl')}${$.attr_style(style())} role="button"${$.attr('aria-label', `Expand column ${cell.text || ""}`)}${$.attr('aria-expanded', !cell.collapsed)} tabindex="0"${$.attr('data-header-id', setID(column.id))}><div class="wx-text svelte-1t83xbl"${$.attr_style(collapsedTextStyle())}>${$.escape(cell.text || "")}</div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class(`wx-cell ${$.stringify(css())} ${$.stringify(cell.css || '')} wx-collapsed`, 'svelte-1t83xbl')}${$.attr_style(style())} aria-hidden="true"${$.attr('data-header-id', setID(column.id))}></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class(`wx-cell ${$.stringify(css())} ${$.stringify(cell.css || '')}`, 'svelte-1t83xbl', {
				'wx-filter': cell.filter,
				'wx-fixed-right': column.fixed && column.fixed.right
			})}${$.attr_style(style())}${$.attr('data-header-id', setID(column.id))}${$.attr('tabindex', !cell._hidden && column.sort && !cell.filter ? "0" : undefined)} role="columnheader"${$.attr('aria-colindex', column._colindex)}${$.attr('aria-colspan', cell.colspan > 1 ? cell.colspan : undefined)}${$.attr('aria-rowspan', cell.rowspan > 1 ? cell.rowspan : undefined)}${$.attr('aria-sort', !sortMark()?.order || cell.filter
				? "none"
				: sortMark()?.order === "asc" ? "ascending" : "descending")}>`);

			if (cell.collapsible) {
				$$renderer.push(`<!--[0--><div class="wx-collapse svelte-1t83xbl" role="button"${$.attr('aria-label', cell.collapsed ? "Expand column" : "Collapse column")}${$.attr('aria-expanded', !cell.collapsed)} tabindex="0"><i${$.attr_class(`wxi-angle-${cell.collapsed ? 'down' : 'right'}`, 'svelte-1t83xbl')}></i></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

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
			} else if (cell.filter) {
				$$renderer.push('<!--[1-->');
				Filter($$renderer, { filter: cell.filter, column });
			} else {
				$$renderer.push(`<!--[-1--><div class="wx-text svelte-1t83xbl">${$.escape(cell.text || "")}</div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (column.resize && lastRow && !cell._hidden) {
				$$renderer.push(`<!--[0--><div class="wx-grip svelte-1t83xbl" role="presentation" aria-label="Resize column"><div class="svelte-1t83xbl"></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (sortRow) {
				$$renderer.push(`<!--[0--><div class="wx-sort svelte-1t83xbl">`);

				if (sortMark()) {
					$$renderer.push('<!--[0-->');

					if (typeof sortMark().index !== "undefined") {
						$$renderer.push(`<!--[0--><div class="wx-order svelte-1t83xbl">${$.escape(sortMark().index + 1)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <i${$.attr_class(`wxi-arrow-${sortMark().order === 'asc' ? 'up' : 'down'}`, 'svelte-1t83xbl')}></i>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}