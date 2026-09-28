import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { getStyle, getCssName } from "../helpers/columnWidth";

var root = $.from_html(`<div class="wx-text svelte-1p0egin"> </div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function FooterCell($$anchor, $$props) {
	$.push($$props, true);

	const api = getContext("grid-store");
	let style = $.derived(() => getStyle($$props.cell.width, $$props.cell.flexgrow, $$props.column.fixed, $$props.column.left, $$props.cell.right ?? $$props.column.right, $$props.cell.height));
	let css = $.derived(() => getCssName($$props.column, $$props.cell, $$props.columnStyle));

	function getCell() {
		return Object.fromEntries(Object.entries($$props.cell).filter(([key]) => key !== "cell"));
	}

	var div = root_1();
	let classes;
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						let $0 = $.derived(getCell);

						$.component(node_2, () => $$props.cell.cell, ($$anchor, cell_cell) => {
							cell_cell($$anchor, {
								get api() {
									return api;
								},

								get cell() {
									return $.get($0);
								},

								get column() {
									return $$props.column;
								},

								get row() {
									return $$props.row;
								},
								onaction: ({ action, data }) => api.exec(action, data)
							});
						});
					}

					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var div_1 = root();
					var text = $.only_child(div_1, true);

					$.template_effect(() => $.set_text(text, $$props.cell.text || ""));
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.cell.cell) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (!$$props.column.collapsed && !$$props.cell.collapsed) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `wx-cell ${$.get(css) ?? ''} ${($$props.cell.css || '') ?? ''}`, 'svelte-1p0egin', classes, {
			'wx-fixed-right': $$props.column.fixed && $$props.column.fixed.right
		});

		$.set_style(div, $.get(style));
	});

	$.append($$anchor, div);
	$.pop();
}