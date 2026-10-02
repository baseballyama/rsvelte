import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, untrack } from "svelte";
import { getStyle } from "../helpers/columnWidth";
import { getRenderValue } from "@svar-ui/grid-store";
import { setID } from "@svar-ui/lib-dom";

var root = $.from_html(`<i draggable-data="true" class="wx-draggable wxi-drag svelte-ys2x3c"></i>`);
var root_1 = $.from_html(`<i class="wx-draggable-stub svelte-ys2x3c"></i>`);
var root_2 = $.from_html(`<i data-action="toggle-row"></i>`);
var root_3 = $.from_html(`<span></span> <!>`, 1);
var root_4 = $.from_html(`<mark class="wx-search svelte-ys2x3c"> </mark>`);
var root_5 = $.from_html(`<span></span>`);
var root_6 = $.from_html(`<div><!> <!> <!></div>`);

export default function Cell($$anchor, $$props) {
	$.push($$props, true);

	const $search = () => $.store_get(search, '$search', $$stores);
	const $focusCell = () => $.store_get(focusCell, '$focusCell', $$stores);
	const $reorder = () => $.store_get(reorder, '$reorder', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let cellStyle = $.prop($$props, 'cellStyle', 3, null),
		columnStyle = $.prop($$props, 'columnStyle', 3, null);

	let style = $.derived(() => getStyle($$props.column.width, $$props.column.flexgrow, $$props.column.fixed, $$props.column.left, $$props.column.right));
	let css = $.derived(() => buildCellCss(columnStyle(), cellStyle()));
	const api = getContext("grid-store");
	const { focusCell, search, reorder } = api.getReactiveState();
	const shouldHighlight = $.derived(() => $search()?.rows[$$props.row.id] && $search().rows[$$props.row.id][$$props.column.id]);

	const isDraggable = $.derived(() => typeof $$props.column.draggable === "function"
		? $$props.column.draggable($$props.row, $$props.column) !== false
		: $$props.column.draggable);

	let cellEl;

	$.user_effect(() => {
		$focusCell();
		$$props.focusable;

		untrack(() => {
			if (cellEl && $$props.focusable) {
				const needFocus = $focusCell()?.row === $$props.row.id && $focusCell()?.column === $$props.column.id;

				if (needFocus) cellEl.focus();
			}
		});
	});

	function buildCellCss(columnStyle, cellStyle) {
		let css = "wx-cell";

		css += $$props.column.fixed
			? " " + ($$props.column.fixed === -1 ? "wx-shadow" : "wx-fixed")
			: "";

		css += columnStyle ? " " + columnStyle($$props.column) : "";
		css += cellStyle ? " " + cellStyle($$props.row, $$props.column) : "";
		css += $$props.column.treetoggle ? " wx-tree-cell" : "";

		return css;
	}

	function toggleFocusAction() {
		if ($$props.focusable && !$focusCell()) {
			api.exec("focus-cell", {
				row: $$props.row.id,
				column: $$props.column.id,
				eventSource: "focus"
			});
		}
	}

	function highlightText(text) {
		const regex = new RegExp(`(${$search().value.trim()})`, "gi");
		const parts = String(text).split(regex);

		return parts.map((text) => ({ text, highlight: regex.test(text) }));
	}

	var div = root_6();
	let classes;

	$.set_attribute(div, 'role', "gridcell");

	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var i = root();

					$.append($$anchor, i);
				};

				var alternate = ($$anchor) => {
					var i_1 = root_1();

					$.append($$anchor, i_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isDraggable)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($reorder() && $$props.column.draggable) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_3();
			var span = $.first_child(fragment_1);
			var node_3 = $.sibling(span, 2);

			{
				var consequent_2 = ($$anchor) => {
					var i_2 = root_2();

					$.template_effect(() => $.set_class(i_2, 1, `wx-table-tree-toggle wxi-menu-${$$props.row.open !== false ? 'down' : 'right'}`, 'svelte-ys2x3c'));
					$.append($$anchor, i_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.row.$count) $$render(consequent_2);
				});
			}

			$.template_effect(() => $.set_style(span, `margin-left:${$$props.row.$level * 28}px;`));
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.column.treetoggle) $$render(consequent_3);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			$.component(node_5, () => $$props.column.cell, ($$anchor, column_cell) => {
				column_cell($$anchor, {
					get api() {
						return api;
					},

					get row() {
						return $$props.row;
					},

					get column() {
						return $$props.column;
					},
					onaction: ({ action, data }) => api.exec(action, data)
				});
			});

			$.append($$anchor, fragment_2);
		};

		var consequent_5 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			$.snippet(node_6, () => $$props.children);
			$.append($$anchor, fragment_3);
		};

		var consequent_7 = ($$anchor) => {
			var span_1 = root_5();

			$.each(span_1, 21, () => highlightText(getRenderValue($$props.row, $$props.column)), $.index, ($$anchor, $$item) => {
				let highlight = () => $.get($$item).highlight;
				let text = () => $.get($$item).text;
				var fragment_4 = $.comment();
				var node_7 = $.first_child(fragment_4);

				{
					var consequent_6 = ($$anchor) => {
						var mark = root_4();
						var text_1 = $.only_child(mark, true);

						$.template_effect(() => $.set_text(text_1, text()));
						$.append($$anchor, mark);
					};

					var alternate_1 = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, text()));
						$.append($$anchor, text_2);
					};

					$.if(node_7, ($$render) => {
						if (highlight()) $$render(consequent_6); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_4);
			});

			$.reset(span_1);
			$.append($$anchor, span_1);
		};

		var alternate_2 = ($$anchor) => {
			var text_3 = $.text();

			$.template_effect(($0) => $.set_text(text_3, $0), [() => getRenderValue($$props.row, $$props.column)]);
			$.append($$anchor, text_3);
		};

		$.if(node_4, ($$render) => {
			if ($$props.column.cell) $$render(consequent_4); else if ($$props.children) $$render(consequent_5, 1); else if ($.get(shouldHighlight)) $$render(consequent_7, 2); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => cellEl = $$value, () => cellEl);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(div, 1, $.clsx($.get(css)), 'svelte-ys2x3c', classes, {
				'wx-shadow': $$props.column.fixed && $$props.column.fixed.left === -1 || $$props.column.fixed.right === -1,
				'wx-fixed-right': $$props.column.fixed && $$props.column.fixed.right
			});

			$.set_style(div, $.get(style));
			$.set_attribute(div, 'data-row-id', $0);
			$.set_attribute(div, 'data-col-id', $1);
			$.set_attribute(div, 'tabindex', $$props.focusable ? "0" : "-1");
			$.set_attribute(div, 'aria-colindex', $$props.column._colindex);
			$.set_attribute(div, 'aria-readonly', !$$props.column.editor ? true : undefined);
		},
		[() => setID($$props.row.id), () => setID($$props.column.id)]
	);

	$.event('focus', div, toggleFocusAction);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}