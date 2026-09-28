import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import TableBodyRow from "./TableBodyRow.svelte";
import TableBodyCell from "./TableBodyCell.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'bodyItems',
	'class'
]);

var root = $.from_html(`<tbody><!></tbody>`);

export default function TableBody($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	function getCellValues(row) {
		if (Array.isArray(row)) {
			return row;
		} else {
			return Object.values(row);
		}
	}

	var tbody = root();

	$.attribute_effect(tbody, ($0) => ({ ...restProps, class: $0 }), [() => clsx($$props.class)]);

	var node = $.child(tbody);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 19, () => $$props.bodyItems, (row, i) => "id" in row ? row.id : i, ($$anchor, row) => {
				TableBodyRow($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 17, () => getCellValues($.get(row)), $.index, ($$anchor, cellValue) => {
							TableBodyCell($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(cellValue) ?? ""));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_3 = $.first_child(fragment_5);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if ($$props.bodyItems) $$render(consequent); else if ($$props.children) $$render(consequent_1, 1);
		});
	}

	$.reset(tbody);
	$.append($$anchor, tbody);
	$.pop();
}