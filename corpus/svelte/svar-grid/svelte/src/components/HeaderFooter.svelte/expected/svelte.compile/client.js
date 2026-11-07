import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import HeaderCell from "./HeaderCell.svelte";
import FooterCell from "./FooterCell.svelte";
import { isCommunity } from "@svar-ui/grid-store";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'deltaLeft',
	'contentWidth',
	'columns',
	'type',
	'columnStyle',
	'bodyHeight'
]);

var root = $.from_html(`<div role="row"></div>`);
var root_1 = $.from_html(`<div role="rowgroup"></div>`);

export default function HeaderFooter($$anchor, $$props) {
	$.push($$props, true);

	const $sizes = () => $.store_get(sizes, '$sizes', $$stores);
	const $split = () => $.store_get(split, '$split', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let type = $.prop($$props, 'type', 3, "header"),
		restProps = $.rest_props($$props, rest_excludes);

	const api = getContext("grid-store");
	const { _sizes: sizes, split } = api.getReactiveState();
	let rowHeights = $.derived(() => $sizes()[`${type()}RowHeights`]);

	let renderedHeader = $.derived(() => {
		let res = [];

		if ($$props.columns.length) {
			const rowsCount = $$props.columns[0][type()].length;

			for (let ri = 0; ri < rowsCount; ri++) {
				let inSpan = 0;
				let left = 0;

				res.push([]);

				$$props.columns.forEach((col, ci) => {
					const cell = { ...col[type()][ri] };

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
									right -= $$props.columns[ci + i].width;
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

	const hasSplit = $.derived(() => $split()?.left || $split()?.right);

	function getColumn(id) {
		return $$props.columns.find((c) => c.id === id);
	}

	function isLast(cell, ind) {
		if (cell.rowspan) ind += cell.rowspan - 1;

		return ind === $.get(renderedHeader).length - 1;
	}

	function isSort(cell, ind, column) {
		if (!column.sort) return false;

		for (let i = $.get(renderedHeader).length - 1; i >= 0; i--) {
			const cell = column.header[i];

			if (!cell.filter && !cell._hidden) return ind === i;
		}

		return isLast(cell, ind);
	}

	var div = root_1();

	$.each(div, 21, () => $.get(renderedHeader), $.index, ($$anchor, row, i) => {
		var div_1 = root();

		$.each(div_1, 21, () => $.get(row), (cell) => cell.id, ($$anchor, cell) => {
			const column = $.derived(() => getColumn($.get(cell).id));
			var fragment = $.comment();
			var node = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => isLast($.get(cell), i));
						let $1 = $.derived(() => isSort($.get(cell), i, $.get(column)));

						HeaderCell($$anchor, $.spread_props(
							{
								get cell() {
									return $.get(cell);
								},

								get columnStyle() {
									return $$props.columnStyle;
								},

								get column() {
									return $.get(column);
								},
								row: i,
								get lastRow() {
									return $.get($0);
								},

								get bodyHeight() {
									return $$props.bodyHeight;
								},

								get sortRow() {
									return $.get($1);
								},

								get hasSplit() {
									return $.get(hasSplit);
								},

								get deltaLeft() {
									return $$props.deltaLeft;
								}
							},
							() => restProps
						));
					}
				};

				var alternate = ($$anchor) => {
					FooterCell($$anchor, {
						get cell() {
							return $.get(cell);
						},

						get columnStyle() {
							return $$props.columnStyle;
						},

						get column() {
							return $.get(column);
						},
						row: i
					});
				};

				$.if(node, ($$render) => {
					if (type() === "header") $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		});

		$.reset(div_1);

		$.template_effect(() => {
			$.set_class(div_1, 1, $.clsx(type() === "header" ? "wx-h-row" : "wx-f-row"));
			$.set_style(div_1, `height:${$.get(rowHeights)[i] ?? ''}px; display: flex`);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-${type()}`, 'svelte-b4gut6');
		$.set_style(div, `padding-left:${$$props.deltaLeft ?? ''}px;width:${$$props.contentWidth ?? ''}px;`);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}