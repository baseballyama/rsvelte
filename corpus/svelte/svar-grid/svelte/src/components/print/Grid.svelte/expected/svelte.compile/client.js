import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

import {
	getRenderValue,
	getHeaderFooterPrintColumns,
	getPrintCellStyle
} from "@svar-ui/grid-store";

import HeaderFooter from "./HeaderFooter.svelte";

var root = $.from_html(`<thead><!></thead>`);
var root_1 = $.from_html(`<i class="wxi-drag"></i>`);
var root_2 = $.from_html(`<span class="wx-print-draggable"><!></span>`);
var root_3 = $.from_html(`<i></i>`);
var root_4 = $.from_html(`<span></span> <!>`, 1);
var root_5 = $.from_html(`<span> </span>`);
var root_6 = $.from_html(`<td><!> <!> <!></td>`);
var root_7 = $.from_html(`<tr></tr>`);
var root_8 = $.from_html(`<tfoot><!></tfoot>`);
var root_9 = $.from_html(`<table><!><tbody></tbody><!></table>`);

export default function Grid($$anchor, $$props) {
	$.push($$props, true);

	const api = getContext("grid-store");
	const { flatData: data, _sizes: sizes } = api.getState();
	const headerColumns = $$props.header && getHeaderFooterPrintColumns($$props.columns, "header", sizes.headerRowHeights);
	const footerColumns = $$props.footer && getHeaderFooterPrintColumns($$props.columns, "footer", sizes.footerRowHeights);

	function buildCellCss(row, column) {
		let css = "";

		css += $$props.columnStyle ? " " + $$props.columnStyle(column) : "";
		css += $$props.cellStyle ? " " + $$props.cellStyle(row, column) : "";

		return css;
	}

	function isDraggableIcon(row, column) {
		return typeof column.draggable === "function"
			? column.draggable(row, column) !== false
			: column.draggable;
	}

	var table = root_9();
	let classes;
	var node = $.child(table);

	{
		var consequent = ($$anchor) => {
			var thead = root();
			var node_1 = $.child(thead);

			HeaderFooter(node_1, {
				get columns() {
					return headerColumns;
				},
				type: "header",
				get columnStyle() {
					return $$props.columnStyle;
				}
			});

			$.reset(thead);
			$.append($$anchor, thead);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent);
		});
	}

	var tbody = $.sibling(node);

	$.each(tbody, 21, () => data, $.index, ($$anchor, row) => {
		var tr = root_7();

		$.each(tr, 21, () => $$props.columns, (column) => column.id, ($$anchor, column) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			{
				var consequent_6 = ($$anchor) => {
					var td = root_6();
					var node_3 = $.child(td);

					{
						var consequent_2 = ($$anchor) => {
							var span = root_2();
							var node_4 = $.child(span);

							{
								var consequent_1 = ($$anchor) => {
									var i = root_1();

									$.append($$anchor, i);
								};

								var d = $.derived(() => isDraggableIcon($.get(row), $.get(column)));

								$.if(node_4, ($$render) => {
									if ($.get(d)) $$render(consequent_1);
								});
							}

							$.reset(span);
							$.append($$anchor, span);
						};

						$.if(node_3, ($$render) => {
							if ($$props.reorder && $.get(column).draggable) $$render(consequent_2);
						});
					}

					var node_5 = $.sibling(node_3, 2);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_1 = root_4();
							var span_1 = $.first_child(fragment_1);
							var node_6 = $.sibling(span_1, 2);

							{
								var consequent_3 = ($$anchor) => {
									var i_1 = root_3();

									$.template_effect(() => $.set_class(i_1, 1, `wx-print-grid-tree-toggle wxi-menu-${$.get(row).open !== false ? 'down' : 'right'}`));
									$.append($$anchor, i_1);
								};

								$.if(node_6, ($$render) => {
									if ($.get(row).$count) $$render(consequent_3);
								});
							}

							$.template_effect(() => $.set_style(span_1, `margin-left:${$.get(row).$level * 28}px;`));
							$.append($$anchor, fragment_1);
						};

						$.if(node_5, ($$render) => {
							if ($.get(column).treetoggle) $$render(consequent_4);
						});
					}

					var node_7 = $.sibling(node_5, 2);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_8 = $.first_child(fragment_2);

							$.component(node_8, () => $.get(column).cell, ($$anchor, column_cell) => {
								column_cell($$anchor, {
									get api() {
										return api;
									},

									get row() {
										return $.get(row);
									},

									get column() {
										return $.get(column);
									}
								});
							});

							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var span_2 = root_5();
							var text = $.only_child(span_2, true);

							$.template_effect(($0) => $.set_text(text, $0), [() => getRenderValue($.get(row), $.get(column))]);
							$.append($$anchor, span_2);
						};

						$.if(node_7, ($$render) => {
							if ($.get(column).cell) $$render(consequent_5); else $$render(alternate, -1);
						});
					}

					$.reset(td);

					$.template_effect(
						($0, $1) => {
							$.set_class(td, 1, `wx-print-cell wx-cell ${$0 ?? ''}`, 'svelte-1adch4k');
							$.set_style(td, $1);
						},
						[
							() => buildCellCss($.get(row), $.get(column)),
							() => getPrintCellStyle($.get(column), sizes.columnWidth)
						]
					);

					$.append($$anchor, td);
				};

				$.if(node_2, ($$render) => {
					if (!$.get(column).collapsed) $$render(consequent_6);
				});
			}

			$.append($$anchor, fragment);
		});

		$.reset(tr);

		$.template_effect(
			($0) => {
				$.set_class(tr, 1, $0, 'svelte-1adch4k');
				$.set_style(tr, `height:${$.get(row).rowHeight || sizes.rowHeight}px;`);
			},
			[
				() => "wx-row" + ($$props.rowStyle ? " " + $$props.rowStyle($.get(row)) : "")
			]
		);

		$.append($$anchor, tr);
	});

	$.reset(tbody);

	var node_9 = $.sibling(tbody);

	{
		var consequent_7 = ($$anchor) => {
			var tfoot = root_8();
			var node_10 = $.child(tfoot);

			HeaderFooter(node_10, {
				get columns() {
					return footerColumns;
				},
				type: "footer",
				get columnStyle() {
					return $$props.columnStyle;
				}
			});

			$.reset(tfoot);
			$.append($$anchor, tfoot);
		};

		$.if(node_9, ($$render) => {
			if ($$props.footer) $$render(consequent_7);
		});
	}

	$.reset(table);
	$.template_effect(($0) => classes = $.set_class(table, 1, 'wx-print-grid svelte-1adch4k', null, classes, { 'wx-flex-columns': $0 }), [() => $$props.columns.some((c) => c.flexgrow)]);
	$.append($$anchor, table);
	$.pop();
}