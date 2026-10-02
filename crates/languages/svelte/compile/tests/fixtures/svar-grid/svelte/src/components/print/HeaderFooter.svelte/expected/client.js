import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { getPrintCellStyle, getPrintFilterValue } from "@svar-ui/grid-store";

var root = $.from_html(`<div class="wx-print-filter"> </div>`);
var root_1 = $.from_html(`<div class="wx-text"> </div>`);
var root_2 = $.from_html(`<th><!></th>`);
var root_3 = $.from_html(`<tr></tr>`);

export default function HeaderFooter($$anchor, $$props) {
	$.push($$props, true);

	const api = getContext("grid-store");
	const { filterValues, _columns, _sizes: sizes } = api.getState();

	function getColumnCss(column) {
		return $$props.columnStyle ? " " + $$props.columnStyle(column) : "";
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.columns, $.index, ($$anchor, row, i) => {
		var tr = root_3();

		$.each(tr, 21, () => $.get(row), (cell) => cell.id, ($$anchor, cell) => {
			const column = $.derived(() => _columns.find((c) => c.id === $.get(cell).id));
			var th = root_2();
			let classes;
			var node_1 = $.child(th);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						let $0 = $.derived(() => Object.fromEntries(Object.entries($.get(cell)).filter(([key]) => key !== "cell")));

						$.component(node_2, () => $.get(cell).cell, ($$anchor, cell_cell) => {
							cell_cell($$anchor, {
								get api() {
									return api;
								},

								get cell() {
									return $.get($0);
								},

								get column() {
									return $.get(column);
								},
								row: i
							});
						});
					}

					$.append($$anchor, fragment_1);
				};

				var consequent_1 = ($$anchor) => {
					var div = root();
					var text = $.only_child(div, true);

					$.template_effect(($0) => $.set_text(text, $0), [
						() => getPrintFilterValue(filterValues, _columns, $.get(cell))
					]);

					$.append($$anchor, div);
				};

				var alternate = ($$anchor) => {
					var div_1 = root_1();
					var text_1 = $.only_child(div_1, true);

					$.template_effect(() => $.set_text(text_1, $.get(cell).text ?? ""));
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(cell).cell) $$render(consequent); else if ($.get(cell).filter) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.reset(th);

			$.template_effect(
				($0, $1) => {
					$.set_style(th, $0);

					classes = $.set_class(th, 1, `wx-print-cell-${$$props.type ?? ''} ${$1 ?? ''}`, null, classes, {
						'wx-print-cell-filter': $.get(cell).filter,
						'wx-vertical': $.get(cell).vertical
					});

					$.set_attribute(th, 'rowspan', $.get(cell).rowspan);
					$.set_attribute(th, 'colspan', $.get(cell).colspan);
				},
				[
					() => getPrintCellStyle($.get(cell), sizes.columnWidth),
					() => getColumnCss($.get(column))
				]
			);

			$.append($$anchor, th);
		});

		$.reset(tr);
		$.append($$anchor, tr);
	});

	$.append($$anchor, fragment);
	$.pop();
}